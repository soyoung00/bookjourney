import React, { useState } from 'react'
import styles from '@/app/book/[isbn]/reviewModal.module.scss'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";



function ReviewModal({ onClose, onSave, bookId }) {
    const [rating, setRating] = useState(0);
    const [quote, setQuote] = useState("");
    const [shortReview, setShortReview] = useState("");
    const [review, setReview] = useState("");
    const [error, setError] = useState("");
    const { data: session } = useSession();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError("별점을 선택해주세요.");
            return;
        }


        if (!shortReview.trim()) {
            setError("한줄 감상평을 입력해주세요.");
            return;
        }

        if (!review.trim()) {
            setError("독후감을 작성해야 완독 처리할 수 있어요.");
            return;
        }

        setError("");

        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userEmail: session.user.email,
                userName: session.user.name,
                bookId: bookId,
                status: "completed",
                rating,
                quote,
                shortReview,
                review,
                completedAt: new Date(),
            }),
        });


        const data = await res.json();
        
        if (!res.ok) {
            setError("저장에 실패했어요. 다시 시도해주세요.");
            return;
        }

        if (data.levelUp) {
            router.push(`/levelup?level=${data.level}`);
            return;
        }

        onSave();
    };

    return (
        <div className={styles.reviewPop}>
            <header>
                <h3>독후감 작성</h3>
                <button type="button" onClick={onClose}>
                    <img src="/img/ic_close_btn.png" alt="닫기" />
                </button>
            </header>

            <form onSubmit={handleSubmit}>
                <section className={styles.starScore}>
                    <h2>별점</h2>

                    <div className={styles.starWrap}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`${styles.starBtn} ${rating >= star ? styles.active : ""}`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </section>

                <section className={styles.reviewWrap}>
                    <div>
                        <h2>인상 깊은 문장</h2>
                        <input
                            type="text"
                            value={quote}
                            onChange={(e) => setQuote(e.target.value)}
                        />
                    </div>

                    <div>
                        <h2>한줄 감상평</h2>
                        <input
                            type="text"
                            value={shortReview}
                            onChange={(e) => setShortReview(e.target.value)}
                            placeholder="자유롭게 의견을 작성해주세요."
                        />
                    </div>

                    <div>
                        <h2>독후감</h2>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                        />
                    </div>
                </section>
                <div className={styles.bottomArea}>
                    {error && (
                        <p className={styles.errorText}>
                            {error}
                        </p>
                    )}

                    <button type="submit" className={styles.completeBtn}>
                        저장
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ReviewModal