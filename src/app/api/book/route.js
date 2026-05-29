export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query");
  const display = searchParams.get("display") || 9;
  const start = searchParams.get("start") || 1;

  const response = await fetch(
    `https://openapi.naver.com/v1/search/book.json?query=${query}&display=${display}&start=${start}`,
    {
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
      },
    }
  );

  const data = await response.json();

  return Response.json(data);
}