
import BookDetailClient from './BookDetailClient';

export default async function BookDetail({ params }) {
    const { isbn } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/book?query=${isbn}&display=1`,
        {
            cache: "no-store",
        }
    );

    const data = await res.json();
    const book = data.items?.[0];

    return <BookDetailClient book={book} />;
    
}