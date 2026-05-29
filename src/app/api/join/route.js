import { NextResponse } from "next/server";
import { connectDB } from "@/util/database";
import bcrypt from "bcrypt";

export async function POST(req) {
    const data = await req.json();
    const hashPassword = await bcrypt.hash(data.password, 10);
    const db = (await connectDB).db("BookJourney");

    const existUser = await db.collection("users").findOne({
        email: data.email,
    });

    if (existUser) {
        return NextResponse.json(
            { message: "이미 존재하는 아이디입니다." },
            { status: 400 }
        );
    }

    await db.collection("users").insertOne({
        name: data.name,
        email: data.email,
        password: hashPassword,
        growth: {
            level: 1,
            achievedYears: [],
        },
        character: data.character || "w",
        createdAt: new Date(),
    });

    return NextResponse.json({
        message: "회원가입이 완료되었습니다.",
    });
}