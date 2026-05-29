import { connectDB } from "@/util/database";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return Response.json(
      { message: "email이 없습니다." },
      { status: 400 }
    );
  }

  const db = (await connectDB).db("BookJourney");

  const user = await db.collection("users").findOne({
    email: email,
  });

  if (!user) {
    return Response.json(
      { message: "유저를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return Response.json({
    name: user.name,
    email: user.email,
    growth: user.growth || { level: 1, achievedYears: [] },
    character: user.character || "w",
  });
}