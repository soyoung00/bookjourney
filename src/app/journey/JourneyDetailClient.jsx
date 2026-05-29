"use client"
import React, { useEffect, useState } from 'react'
import { signOut } from "next-auth/react";
import styles from '@/app/journey/journey.module.scss';
import Link from "next/link";
import { useSession } from "next-auth/react";

function JourneyDetailClient() {
  const [menu, setMenu] = useState(false);
  const { data: session } = useSession();
  const [myReviews, setMyReviews] = useState([]);
  const [bookList, setBookList] = useState([]);
  const [goals, setGoals] = useState(null);
  const targetCount = goals?.targetCount || 0;
  const [userInfo, setUserInfo] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalCount, setGoalCount] = useState(12);
  const [showPastReviews, setShowPastReviews] = useState(false);
  const currentYear = new Date().getFullYear();

  const readingReviews = myReviews.filter((review) => {
    return review.status === "reading";
  });

  const completedReviews = myReviews.filter((review) => {
    return review.status === "completed";
  });

  const thisYearCompletedReviews = completedReviews.filter((review) => {
    return Number(review.year) === currentYear;
  });

  const pastCompletedReviews = completedReviews.filter((review) => {
    return Number(review.year) !== currentYear;
  });


  const getMyReview = async () => {
    if (!session) return;

    const myRes = await fetch(
      `/api/reviews?userEmail=${session.user.email}`
    );
    const myData = await myRes.json();


    setMyReviews(myData);
  };

  const getBookInfo = async () => {
    if (myReviews.length === 0) return;

    const queryString = myReviews
      .map((review) => `isbn=${review.bookId}`)
      .join("&");

    const res = await fetch(`/api/books?${queryString}`);

    const books = await res.json();
    setBookList(books);
  };

  const getGoals = async () => {
    if (!session) return;
    const myRes = await fetch(
      `/api/goals?userEmail=${session.user.email}`
    );
    const myData = await myRes.json();

    setGoals(myData);
  }

  const getUserInfo = async () => {
    if (!session) return;

    const res = await fetch(`/api/users?email=${session.user.email}`);
    const data = await res.json();

    setUserInfo(data);
  };

  const handleGoals = async () => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail: session.user.email,
        year: currentYear,
        targetCount: goalCount,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    setGoals(data.goal);
    setShowGoalModal(false);
  };






  useEffect(() => {
    getMyReview();
    getGoals();
    getUserInfo();
  }, [session]);

  useEffect(() => {
    getBookInfo();
  }, [myReviews]);

  return (
    <div className={styles.journeyWrap}>

      <header className={styles.header}>
        <Link className={styles.backBtn} href={'/'}>
          <img src="/img/ic_back_btn.png" alt="뒤로가기" />
        </Link>

        <div className={styles.menuWrap}>
          <button
            className={styles.moreBtn}
            type="button"
            onClick={() => setMenu(!menu)}
          >
            <img src="/img/ic_more_btn.png" alt="메뉴" />
          </button>

          {menu && (
            <button
              className={styles.logoutMenu}
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              로그아웃
            </button>
          )}
        </div>

      </header>

      <section className={styles.profileSection}>
        <div className={styles.profileImg}>
          <img
            src={`/img/level_${userInfo?.growth?.level || 1}_${userInfo?.character || "w"}.png`}
            alt="캐릭터"
          />
        </div>

        <h2>{userInfo?.name}</h2>
        <p>LV.{userInfo?.growth?.level || "-"}</p>
      </section>

      <section className={styles.summaryBox}>
        <div>
          <span>올해 목표 권수</span>
          <strong>{targetCount}권</strong>
        </div>

        <div className={styles.line}></div>

        <div>
          <span>달성 권수</span>
          <strong>{thisYearCompletedReviews.length}권</strong>
        </div>
      </section>


      {goals === null ? (

        <div className={styles.emptyGoalCard}>
          <div className={styles.iconWrap}>
            <img
              src="/img/book_goals.png"
              alt="독서 목표"
            />
          </div>

          <h3>올해 목표를 설정해주세요</h3>

          <p>
            목표를 설정하면 나의 독서 여정이 시작돼요!
          </p>

          <button
            type="button"
            className={styles.goalBtn}
            onClick={() => setShowGoalModal(true)}
          >
            <span>+</span>
            올해 독서 목표 설정하기
          </button>
        </div>
      ) : (
        <>
          <section className={styles.goalSection}>
            <h3>독서 여정</h3>

            <div className={styles.dotList}>
              {[...Array(targetCount)].map((_, index) => {
                return (
                  <span
                    key={index}
                    className={
                      index < thisYearCompletedReviews.length ? styles.active : ""
                    }
                  ></span>
                );
              })}
            </div>
          </section>

          <section className={styles.readingSection}>
            <h3>현재 읽고 있는 책</h3>

            {readingReviews.length === 0 ? (
              <div className={styles.emptyBookBox}>
                <h4>아직 읽고 있는 책이 없어요</h4>
                <p>마음에 드는 책을 찾아 독서를 시작해보세요.</p>

                <Link href="/" className={styles.emptyLinkBtn}>
                  책 찾으러 가기
                </Link>
              </div>
            ) : (
              <div className={styles.readingCardWrap}>
                {readingReviews.map((item) => {
                  const book = bookList.find((book) => {
                    return book.isbn === item.bookId;
                  });

                  return (
                    <article className={styles.readingCard} key={item._id}>
                      <div className={styles.bookImg}>
                        <img src={book?.image} alt="" />
                      </div>

                      <div className={styles.bookInfo}>
                        <h4>{book?.title}</h4>
                        <p>{book?.author}</p>
                        <span>
                          <img src="/img/ic_calender.png" alt="" />
                          {item.startedAt?.slice(0, 10)}
                        </span>

                        <Link href={`/book/${item.bookId}`}>
                          <img src="/img/ic_completed_fff.png" alt="" />
                          완독하러 가기
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className={styles.completeSection}>
            <h3>완독 기록</h3>
            <p>읽은 책과 감상평을 확인해보세요.</p>

            {thisYearCompletedReviews.length === 0 ? (
              <div className={styles.emptyBookBox}>
                <h4>아직 완독한 책이 없어요</h4>
                <p>책을 완독하면 이곳에 기록이 쌓여요.</p>

                <Link href="/" className={styles.emptyLinkBtn}>
                  첫 완독 시작하기
                </Link>
              </div>
            ) : (
              <div className={styles.completeCardWrap}>
                {thisYearCompletedReviews.map((item) => {
                  const book = bookList.find((book) => {
                    return book.isbn === item.bookId;
                  });

                  return (
                    <article className={styles.completeCard} key={item._id}>
                      <div className={styles.bookImg}>
                        <img src={book?.image} alt="" />
                      </div>

                      <div className={styles.bookInfo}>
                        <h4>{book?.title}</h4>
                        <p>{book?.author}</p>
                        <span>
                          {"★".repeat(item.rating)}
                          {"☆".repeat(5 - item.rating)}
                          · {item.rating}점
                        </span>
                        <small>{item.completedAt?.slice(0, 10)}</small>
                      </div>

                      <Link href={`/review/${item._id}`} className={styles.detailBtn}>
                        ›
                      </Link>
                    </article>
                  );
                })}

                {pastCompletedReviews.length > 0 && (
                  <button
                    type="button"
                    className={styles.pastReviewBtn}
                    onClick={() => setShowPastReviews(!showPastReviews)}
                  >
                    {showPastReviews ? "지난 독서 기록 닫기" : "지난 독서 기록 보기"}
                  </button>
                )}

                {showPastReviews && (
                  <div className={styles.pastReviewList}>
                    {pastCompletedReviews.map((item) => {
                      const book = bookList.find((book) => {
                        return book.isbn === item.bookId;
                      });

                      return (
                        <article className={styles.completeCard} key={item._id}>
                          <div className={styles.bookImg}>
                            <img src={book?.image} alt="" />
                          </div>

                          <div className={styles.bookInfo}>
                            <h4>{book?.title}</h4>
                            <p>{book?.author}</p>
                            <span>
                              {"★".repeat(item.rating)}
                              {"☆".repeat(5 - item.rating)}
                              · {item.rating}점
                            </span>
                            <small>{item.completedAt?.slice(0, 10)}</small>
                          </div>

                          <Link href={`/review/${item._id}`} className={styles.detailBtn}>
                            ›
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}




      {showGoalModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.goalModal}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setShowGoalModal(false)}
            >
              ×
            </button>

            <img
              src="/img/ic_goals.png"
              alt="목표"
              className={styles.modalIcon}
            />

            <h3>올해 독서 목표 설정하기</h3>

            <div className={styles.countBox}>
              <button
                type="button"
                onClick={() => {
                  if (goalCount > 1) {
                    setGoalCount(goalCount - 1);
                  }
                }}
              >
                -
              </button>
              <div className={styles.goalCount}>
                <strong>{goalCount}</strong>
                <span>권</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (goalCount < 48) {
                    setGoalCount(goalCount + 1);
                  }
                }}
              >
                +
              </button>
            </div>

            <p className={styles.helpText}>
              권 수를 선택해주세요
            </p>

            <div className={styles.noticeBox}>
              <img src="/img/ic_plant.png" alt="" />

              <div>
                <strong>꾸준한 독서 습관이 큰 변화를 만들어요!</strong>
                <p>
                  하루 20~30분, 작은 습관이 더 나은
                  당신을 만들어줍니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleGoals}
            >
              목표 설정 완료
            </button>

            <button
              type="submit"
              className={styles.laterBtn}
              onClick={() => setShowGoalModal(false)}
            >
              나중에 설정할게요
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default JourneyDetailClient