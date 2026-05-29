"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import Link from "next/link";
import Header from "@/components/common/Header";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function HomeClient() {
    const [keyword, setKeyword] = useState("");
    const [currentQuery, setCurrentQuery] = useState("소설");
    const [books, setBooks] = useState([]);
    const [review, setReview] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const reset = searchParams.get("reset");

    const { data: session } = useSession();

    const removeTag = (text) => {
        return text?.replace(/<[^>]*>/g, "");
    };

    const getBooks = async (
        query,
        start = 1,
        display = 9,
        isMore = false
    ) => {
        if (!isMore) {
            setLoading(true);
        }

        const res = await fetch(
            `/api/book?query=${query}&start=${start}&display=${display}`
        );

        const data = await res.json();
        const items = data.items || [];

        if (isMore) {
            setBooks((prev) => [...prev, ...items]);
        } else {
            setBooks(items);
        }

        setLoading(false);
    };

    const getStatus = async () => {
        const res = await fetch(
            `/api/reviews?userEmail=${session.user.email}`
        );

        const data = await res.json();
        setReview(data);
    };

    useEffect(() => {
        setKeyword("");
        setCurrentQuery("소설");
        getBooks("소설", 1, 9);
    }, [reset]);

    useEffect(() => {
        if (session?.user?.email) {
            getStatus();
        }
    }, [session]);

    const handleSearch = () => {
        if (!keyword.trim()) {
            alert("검색어를 입력해주세요.");
            return;
        }

        setCurrentQuery(keyword);
        getBooks(keyword, 1, 9);
    };

    const handleMore = () => {
        const nextStart = books.length + 1;
        getBooks(currentQuery, nextStart, 3, true);
    };

    return (
        <>
            <Header />

            <main className={styles.main}>
                <section className={styles.searchWrap}>
                    <input
                        type="text"
                        placeholder="검색어를 입력해주세요."
                        className={styles.searchInput}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                    />

                    <img
                        src="/img/ic_search.png"
                        alt="검색"
                        className={styles.searchIcon}
                        onClick={handleSearch}
                    />
                </section>

                <section className={styles.section}>

                    {loading && books.length === 0 ? (
                        <div className={styles.loadingWrap}>
                            <p>로딩 중</p>

                            <div className={styles.dots}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.bookList}>
                                {books.map((book) => {
                                    const isbn = book.isbn?.split(" ")[0];

                                    const matchedReview = review.find(
                                        (item) => item.bookId === isbn
                                    );

                                    return (
                                        <Link
                                            href={`/book/${isbn}`}
                                            className={styles.bookCard}
                                            key={isbn}
                                        >
                                            <div className={styles.bookImgBox}>
                                                {matchedReview?.status === "reading" && (
                                                    <span className={styles.readingLabel}>독서 중</span>
                                                )}

                                                {matchedReview?.status === "completed" && (
                                                    <span className={styles.completeLabel}>완독</span>
                                                )}

                                                <img
                                                    src={book.image || "/img/no_book.png"}
                                                    alt={removeTag(book.title)}
                                                />
                                            </div>

                                            <div className={styles.bookInfo}>
                                                <h3>{removeTag(book.title)}</h3>
                                                <p>{removeTag(book.author)}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            <button className={styles.moreBtn} onClick={handleMore}>
                                더보기
                            </button>
                        </>
                    )}
                </section>
            </main>
        </>
    );
}