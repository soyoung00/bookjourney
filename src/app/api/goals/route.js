import { connectDB } from "@/util/database";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const userEmail = searchParams.get("userEmail");

    const db = (await connectDB).db("BookJourney");

    const goals = await db.collection("goals").findOne({
        userEmail,
    });

    return Response.json(goals);
}

export async function POST(req) {
    const data = await req.json();

    const db = (await connectDB).db("BookJourney");

    const goalData = {
        userEmail: data.userEmail,
        year: data.year,
        targetCount: data.targetCount,
        createdAt: new Date(),
    };

    await db.collection("goals").insertOne(goalData);

    return NextResponse.json({
        message: "목표가 설정되었습니다.",
        goal: goalData,
    });
}