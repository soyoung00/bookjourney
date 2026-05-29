import { connectDB } from "@/util/database";

export async function POST(req) {
    const body = await req.json();

    const db = (await connectDB).db("BookJourney");

    if (body.userEmail && body.reviewIds) {
        const reviewLikes = await db.collection("reviewLikes").find({
            reviewId: { $in: body.reviewIds },
            userEmail: body.userEmail,
        }).toArray();

        console.log("유저 리뷰 조회 결과 :: ", reviewLikes);
        return Response.json(reviewLikes);
    }
}