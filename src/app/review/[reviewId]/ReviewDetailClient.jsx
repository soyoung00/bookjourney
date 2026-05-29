// app/review/[reviewId]/ReviewDetailClient.jsx

"use client";

import React, { useEffect, useState } from "react";
import styles from "@/app/review/[reviewId]/reviewDetail.module.scss";
import Link from "next/link";

function ReviewDetailClient({ reviewId }) {
  const [review, setReview] = useState(null);
  const [book, setBook] = useState(null);
  const [mod, setMode] = useState(false);
  const [quote, setQuote] = useState("");
  const [shortReview, setShortReview] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const getReview = async () => {
    const res = await fetch(`/api/reviews?reviewId=${reviewId}`);
    const data = await res.json();

    setReview(data);
  };

  const getBookInfo = async () => {
    if (!review?.bookId) return;

    const res = await fetch(`/api/books?isbn=${review.bookId}`);
    const data = await res.json();

    setBook(data[0]);
  };

  useEffect(() => {
    getReview();
  }, [reviewId]);

  useEffect(() => {
    getBookInfo();
  }, [review]);

  useEffect(() => {
    if (!review) return;

    setRating(review.rating || 0);
    setQuote(review.quote || "");
    setShortReview(review.shortReview || "");
    setReviewText(review.review || "");
  }, [review]);

  if (!review || !book) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

  const handleEdit = async () => {
    if (!mod) {
      setMode(true);
      return;
    }

    await fetch(`/api/reviews?reviewId=${reviewId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: rating,
        quote: quote,
        shortReview: shortReview,
        review: reviewText,
      }),
    });

    setReview({
      ...review,
      rating: rating,
      quote: quote,
      shortReview: shortReview,
      review: reviewText,
    });

    setMode(false);
  };

  return (
    <div className={styles.reviewDetail}>
      <header className={styles.header}>
        <Link className={styles.backBtn} href="/journey">
          <img src="/img/ic_back_btn.png" alt="뒤로가기" />
        </Link>

        <h3>완독기록</h3>
      </header>

      <section className={styles.bookSection}>
        <div className={styles.bookImg}>
          <img src={book.image} alt={book.title} />
        </div>

        <div className={styles.bookInfo}>
          <h2>{book.title}</h2>
          <p>{book.author}</p>

          <div className={styles.smallRating}>
            {"★".repeat(rating)}
            {"☆".repeat(5 - rating)}
            <span>{rating}점</span>
          </div>
          <small>{review.completedAt?.slice(0, 10)} 완독</small>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionTitle}>
          <h3>내 별점</h3>

          <button type="button" onClick={handleEdit}>
            {mod ? "완료" : "수정"}
          </button>
        </div>

        <div className={styles.bigRating}>
          {[1, 2, 3, 4, 5].map((star) => {
            return (
              <button
                key={star}
                type="button"
                className={`${styles.starBtn} ${!mod ? styles.readonly : ""}`}
                onClick={() => {
                  if (mod) {
                    setRating(star);
                  }
                }}
              >
                {star <= rating ? "★" : "☆"}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.contentSection}>
        <h3>인상 깊은 문장</h3>

        {mod ? (
          <input
            className={styles.quoteInput}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />
        ) : (
          <div className={styles.quoteBox}>
            “{quote}”
          </div>
        )}
      </section>

      <section className={styles.contentSection}>
        <h3>한줄 감상평</h3>

        {mod ? (
          <input
            className={styles.shortReviewInput}
            value={shortReview}
            onChange={(e) => setShortReview(e.target.value)}
          />
        ) : (
          <p className={styles.shortReview}>
            {review.shortReview}
          </p>
        )}
      </section>

      <section className={styles.contentSection}>
        <h3>독후감</h3>


        {mod ? (
          <textarea
            className={styles.reviewTextInput}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        ) : (
          <p className={styles.reviewText}>
            {review.review}
          </p>
        )}

      </section>
    </div>
  );
}

export default ReviewDetailClient;