import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const reviewId = searchParams.get("reviewId");
    const userEmail = searchParams.get("userEmail");

    const db = (await connectDB).db("BookJourney");

    // 특정 책 + 특정 유저 리뷰 조회
    if (userEmail && reviewId) {
        const reviewLikes = await db.collection("reviewLikes").findOne({
            reviewId,
            userEmail,
        });

        console.log("유저 리뷰 조회 결과 :: ",reviewLikes);
        return Response.json(reviewLikes);
    }
}



export async function POST(req) {
    const body = await req.json();

    const db = (await connectDB).db("BookJourney");

    await db.collection("reviewLikes").insertOne({
        reviewId: body.reviewId,
        userEmail: body.userEmail,
        createdAt: new Date(),
    });

    await db.collection("reviews").updateOne(
        { _id: new ObjectId(body.reviewId) },
        { $inc: { likeCount: 1 } }
    );

    return Response.json({
        message: "좋아요",
    });
}


export async function DELETE(req) {
    const body = await req.json();

    const db = (await connectDB).db("BookJourney");

    await db.collection("reviewLikes").deleteOne({
        reviewId: body.reviewId,
        userEmail: body.userEmail,
    });

    await db.collection("reviews").updateOne(
        { _id: new ObjectId(body.reviewId) },
        { $inc: { likeCount: -1 } }
    );

    return Response.json({
        message: "좋아요 취소",
    });
}



