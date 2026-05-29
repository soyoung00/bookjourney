import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const bookId = searchParams.get("bookId");
  const userEmail = searchParams.get("userEmail");
  const reviewId = searchParams.get("reviewId");

  const db = (await connectDB).db("BookJourney");


  // 특정 리뷰 1개 조회
  if (reviewId) {
    const review = await db.collection("reviews").findOne({
      _id: new ObjectId(reviewId),
    });

    return Response.json(review);
  }

  // 특정 책 + 특정 유저 리뷰 조회
  if (userEmail && bookId) {
    const review = await db.collection("reviews").findOne({
      bookId,
      userEmail,
    });

    return Response.json(review);
  }

  // 특정 유저의 전체 리뷰 목록 조회
  if (userEmail && !bookId) {
    const reviews = await db
      .collection("reviews")
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(reviews);
  }

  // 특정 책의 완독 리뷰 목록 조회
  if (bookId) {
    const reviews = await db
      .collection("reviews")
      .find({
        bookId,
        status: "completed",
      })
      .sort({ completedAt: -1 })
      .toArray();

    return Response.json(reviews);
  }


  return Response.json([]);
}

export async function POST(req) {
  const body = await req.json();

  const db = (await connectDB).db("BookJourney");

  await db.collection("reviews").updateOne(
    {
      userEmail: body.userEmail,
      bookId: body.bookId,
    },
    {
      $set: {
        status: body.status,
        rating: body.rating,
        quote: body.quote,
        shortReview: body.shortReview,
        review: body.review,
        completedAt: body.status === "completed" ? new Date() : body.completedAt,
        year: new Date().getFullYear(),
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userEmail: body.userEmail,
        userName: body.userName,
        bookId: body.bookId,
        startedAt: new Date(),
        likeCount: 0,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  let levelUpResult = {
    levelUp: false,
  };

  if (body.status === "completed") {
    levelUpResult = await checkAndLevelUp(db, body.userEmail);
  }

  return Response.json({
    message: "리뷰 상태 저장 완료",
    levelUp: levelUpResult.levelUp,
    level: levelUpResult.level,
  });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);

  const bookId = searchParams.get("bookId");
  const userEmail = searchParams.get("userEmail");

  const db = (await connectDB).db("BookJourney");

  await db.collection("reviews").deleteOne({
    bookId,
    userEmail,
  });

  return Response.json({
    message: "리뷰 삭제 완료",
  });
}


async function checkAndLevelUp(db, userEmail) {
  const currentYear = new Date().getFullYear();

  const goal = await db.collection("goals").findOne({
    userEmail: userEmail,
    year: currentYear,
  });

  if (!goal) {
    return {
      levelUp: false,
    };
  }

  const targetCount = goal.targetCount;

  const completedCount = await db.collection("reviews").countDocuments({
    userEmail: userEmail,
    status: "completed",
    year: currentYear,
  });

  if (completedCount < targetCount) {
    return {
      levelUp: false,
    };
  }

  const user = await db.collection("users").findOne({
    email: userEmail,
  });

  const achievedYears = user.growth?.achievedYears || [];

  if (achievedYears.includes(currentYear)) {
    return {
      levelUp: false,
    };
  }

  const nextLevel = (user.growth?.level || 1) + 1;

  await db.collection("users").updateOne(
    { email: userEmail },
    {
      $inc: {
        "growth.level": 1,
      },
      $push: {
        "growth.achievedYears": currentYear,
      },
    }
  );

  return {
    levelUp: true,
    level: nextLevel,
  };
}

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get("reviewId");
  const body = await req.json();

  const db = (await connectDB).db("BookJourney");

  await db.collection("reviews").updateOne(
    {
      _id: new ObjectId(reviewId),
    },
    {
      $set: {
        rating: body.rating,
        quote: body.quote,
        shortReview: body.shortReview,
        review: body.review,
        updatedAt: new Date(),
      },
    }
  );

  return Response.json({
    message: "독후감 수정 완료",
  });
}