import { NextResponse } from "next/server";
import { connectDB } from "@/util/database";

export async function PATCH(req) {
    const data = await req.json();

    const userEmail = data.userEmail;
    const year = data.year;

    if (!userEmail || !year) {
        return NextResponse.json(
            { message: "필수 값이 없습니다." },
            { status: 400 }
        );
    }

    const db = (await connectDB).db("BookJourney");

    const user = await db.collection("users").findOne({
        email: userEmail,
    });

    if (!user) {
        return NextResponse.json(
            { message: "유저를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const achievedYears = user.growth?.achievedYears || [];

    if (achievedYears.includes(year)) {
        return NextResponse.json({
            message: "이미 올해 레벨업 완료",
            level: user.growth?.level || 1,
        });
    }

    const nextLevel = (user.growth?.level || 1) + 1;

    await db.collection("users").updateOne(
        { email: userEmail },
        {
            $set: {
                "growth.level": nextLevel,
            },
            $push: {
                "growth.achievedYears": year,
            },
        }
    );

    return NextResponse.json({
        message: "레벨업 완료",
        level: nextLevel,
    });
}