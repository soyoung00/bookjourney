import { connectDB } from "@/util/database";

export async function POST(req) {

    const body = await req.json();

    const db = (await connectDB).db("BookJourney");

    await db.collection("books").updateOne(
        { isbn: body.isbn }, // 같은 책 찾기
        {
            $setOnInsert: {
                ...body,
                createdAt: new Date(),
            }
        },
        { upsert: true }
    );


    return Response.json({
        message: "저장 완료",
    });
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const isbnList = searchParams.getAll("isbn");

    const db = (await connectDB).db("BookJourney");

    const books = await db
        .collection("books")
        .find({
            isbn: { $in: isbnList },
        })
        .toArray();

    return Response.json(books);
}