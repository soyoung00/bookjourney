"use client"
import React, { useEffect } from 'react'
import styles from '@/app/book/[isbn]/bookDetail.module.scss';
import Link from "next/link";
import { useState } from 'react';
import ReviewModal from './ReviewModal';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BookDetailClient({ book }) {
    const [readStatus, setReadStatus] = useState("");
    const [reviewPopup, setReviewPopup] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const { data: session, status } = useSession();
    const [likedReviews, setLikedReviews] = useState({});
    const [filter, setFilter] = useState(true);
    const router = useRouter();
    const [myReview, setMyReview] = useState(null);

    const sortedReviews = [...(reviewData || [])].sort((a, b) => {
        if (filter) {
            // 최신순
            return new Date(b.completedAt) - new Date(a.completedAt);
        }

        // 좋아요 많은 순
        return b.likeCount - a.likeCount;
    });


    // 1. 내 독서 상태 + 내 리뷰 id 확인용
    const getMyReviewStatus = async () => {
        if (!session) return;

        const myRes = await fetch(
            `/api/reviews?bookId=${book.isbn}&userEmail=${session.user.email}`
        );

        const myData = await myRes.json();

        setMyReview(myData);

        if (myData?.status) {
            setReadStatus(myData.status);
        }
    };
    // 2. 이 책의 전체 리뷰 목록용
    const getReviewList = async () => {
        const listRes = await fetch(`/api/reviews?bookId=${book.isbn}`);
        const listData = await listRes.json();

        setReviewData(listData);
        getLikedReviews(listData);
    };


    // 페이지 진입시 리뷰 목록 가져오기
    useEffect(() => {
        if (status === "loading") return;
        if (!session) return;

        getMyReviewStatus();
        getReviewList();
    }, [session, status]);


    const handleStart = async (status) => {
        const goalRes = await fetch(
            `/api/goals?userEmail=${session.user.email}`
        );

        const goalData = await goalRes.json();

        if (!goalData || goalData.length === 0) {
            alert("먼저 올해 독서 목표를 설정해주세요.");
            router.push("/journey");
            return;
        }

        await fetch("/api/books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                isbn: book.isbn,
                title: book.title,
                author: book.author,
                image: book.image
            }),
        });

        await fetch("/api/reviews", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userEmail: session.user.email,
                userName: session.user.name,
                bookId: book.isbn,
                status: status
            }),
        });

        setReadStatus(status);
    };

    const handleCancelReading = async () => {
        await fetch(
            `/api/reviews?bookId=${book.isbn}&userEmail=${session.user.email}`,
            {
                method: "DELETE",
            }
        );

        setReadStatus("");
    };

    const handleLikeReview = async (reviewId, likeCount) => {

        const myRes = await fetch(
            `/api/reviewLikes?reviewId=${reviewId}&userEmail=${session.user.email}`
        );
        const myData = await myRes.json();

        if (myData) {
            // 좋아요 취소

            await fetch("/api/reviewLikes", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reviewId,
                    userEmail: session.user.email,
                    likeCount,
                }),
            });

            setLikedReviews(prev => ({
                ...prev,
                [reviewId]: false,
            }));

            setReviewData(prev =>
                prev.map(review =>
                    review._id === reviewId
                        ? { ...review, likeCount: review.likeCount - 1 }
                        : review
                )
            );

        } else {
            // 좋아요 추가

            await fetch("/api/reviewLikes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reviewId,
                    userEmail: session.user.email,
                    likeCount,
                }),
            });

            setLikedReviews(prev => ({
                ...prev,
                [reviewId]: true,
            }));

            setReviewData(prev =>
                prev.map(review =>
                    review._id === reviewId
                        ? { ...review, likeCount: review.likeCount + 1 }
                        : review
                )
            );
        }


    }


    async function getLikedReviews(reviews) {

        const reviewIds = reviews.map(function (review) {
            return review._id;
        });


        const res = await fetch("/api/reviewLikes/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reviewIds: reviewIds,
                userEmail: session.user.email,
            }),
        });

        const myData = await res.json();



        const likedMap = {};

        myData.forEach(function (review) {
            likedMap[review.reviewId] = true;
        });


        setLikedReviews(likedMap);




    }


    return (
        <main className={styles.bookdetail}>
            <header className={styles.header}>
                <Link className={styles.backBtn} href={'/'}>
                    <img src="/img/ic_back_btn.png" alt="뒤로가기" />
                </Link>

                <h3>책 상세</h3>
            </header>


            <section className={styles.bookSection}>
                <div className={styles.bookImg}>
                    <img src={book.image} alt={book.title} />
                </div>

                <div className={styles.bookInfo}>
                    <h2>{book.title}</h2>

                    <p className={styles.author}>{book.author}</p>

                    <span className={styles.publisher}>
                        {book.publisher} | {book.pubdate}
                    </span>

                    <a href={book.link} target='_blank'>구매하기</a>
                </div>
            </section>

            <section className={styles.summarySection}>
                <h3>줄거리</h3>

                <p>
                    {book.description.replace(/<[^>]*>/g, "")}
                </p>
            </section>

            <section className={styles.reviewSection}>
                <div className={styles.reviewSectionTop}>
                    <h3>한줄 감상평</h3>
                    <p onClick={() => setFilter(prev => !prev)}>
                        <img src="/img/ic_filter.png" alt="필터" />
                        {filter ? "최신순" : "좋아요순"}
                    </p>
                </div>

                {(reviewData?.length === 0 || !reviewData) && (
                    <div className={styles.noReview}>
                        <h3>
                            아직 등록된 감상평이 없어요. <br />
                            이 책의 첫 감상평을 남겨보세요.
                        </h3>
                    </div>
                )}

                <div className={styles.reviewList}>
                    {sortedReviews.map((review) => (
                        <div className={styles.reviewCard} key={review._id}>
                            <div className={styles.reviewTop}>
                                <div className={styles.reviewLeft}>
                                    <div className={styles.starWrap}>
                                        {"★".repeat(review.rating)}
                                        {"☆".repeat(5 - review.rating)}
                                    </div>

                                    <div className={styles.reviewMeta}>
                                        {review.userName}  | {new Date(review.completedAt).toISOString().slice(0, 10)}
                                    </div>
                                </div>

                                <div className={likedReviews[review._id] ? styles.liked : styles.likeWrap} onClick={() => handleLikeReview(review._id, review.likeCount)}>
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_14_1019)">
                                            <path d="M8.60042 4.69675L7.48167 8.65508C7.45699 8.74239 7.40428 8.81925 7.33194 8.874C7.25959 8.92875 7.17135 8.95839 7.08063 8.95841H1.66667C1.55616 8.95841 1.45018 8.91452 1.37204 8.83638C1.2939 8.75824 1.25 8.65225 1.25 8.54175V4.41425C1.24991 4.33932 1.27003 4.26576 1.30823 4.2013C1.34644 4.13685 1.40131 4.08389 1.46708 4.048L2.85438 3.29175C3.30336 3.04685 3.67356 2.67947 3.92188 2.23237L4.47583 1.2355C4.54208 1.11591 4.66813 1.04175 4.805 1.04175H4.855C5.08129 1.04187 5.29828 1.13179 5.45833 1.29175C5.63326 1.46667 5.74051 1.69793 5.76104 1.94446L5.78021 2.17425C5.81542 2.59716 5.78479 3.02321 5.68938 3.43675L5.58521 3.88758C5.5775 3.92099 5.57743 3.95571 5.585 3.98915C5.59256 4.02259 5.60758 4.05389 5.62893 4.08072C5.65027 4.10755 5.6774 4.12922 5.70828 4.14412C5.73916 4.15901 5.77301 4.16675 5.80729 4.16675H8.19896C8.26339 4.16667 8.32697 4.18154 8.38469 4.21018C8.4424 4.23883 8.49269 4.28047 8.5316 4.33183C8.5705 4.38319 8.59697 4.44288 8.60891 4.5062C8.62085 4.56952 8.61794 4.63474 8.60042 4.69675Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_14_1019">
                                                <rect width="10" height="10" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>

                                    <span>{review.likeCount}</span>
                                </div>
                            </div>

                            <p className={styles.reviewText}>
                                {review.shortReview}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {
                readStatus === "reading" ? (
                    <>
                        <div className={styles.btnGap}></div>
                        <div className={styles.completeWrap}>
                            <button className={styles.completeBtn} onClick={() => setReviewPopup(true)}>
                                완독하기
                            </button>
                            <button className={styles.cancleBtn}
                                onClick={() => {
                                    const check = confirm("독서를 중단하시겠어요?");

                                    if (!check) return;

                                    handleCancelReading();
                                }}
                            >
                                그만 읽을래요.
                            </button>
                        </div>
                    </>

                ) : readStatus === "completed" ? (
                    <>
                        <div className={styles.btnGap}></div>
                        <button className={styles.complete}>
                            <div>
                                <img src="/img/ic_completed.png" alt="" />
                                <span>완독 완료</span>
                            </div>
                            {myReview?._id && (
                                <Link href={`/review/${myReview._id}`}>
                                    <p>나의 독후감을 확인해보세요</p>
                                    <img src="/img/ic_rightArrow.png" alt="" />
                                </Link>
                            )}
                        </button>
                    </>
                ) : (
                    <button
                        className={styles.startBtn}
                        onClick={() => {
                            handleStart("reading");
                        }}
                    >
                        <img src="/img/ic_reading_btn.png" alt="읽기 시작" />
                        독서 시작
                    </button>
                )
            }

            {reviewPopup && (
                <ReviewModal
                    onClose={() => setReviewPopup(false)}
                    onSave={async () => {
                        await getReviewList();
                        await getMyReviewStatus();
                        setReviewPopup(false);
                    }}
                    bookId={book.isbn} />
            )}
        </main>
    );
}
