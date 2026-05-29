"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/app/levelup/levelup.module.scss"

function LevelUpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const level = searchParams.get("level");

    return (
        <main className={styles.levelUpPage}>
            <div className={styles.levelIcon}>
                <img src="/img/goals_clear.png" alt="레벨업" />
            </div>

            <h1>LEVEL UP!</h1>

            <p className={styles.levelText}>
                LV.<strong>{level}</strong> 달성!
            </p>

            <p className={styles.desc}>
                꾸준한 독서로 한 단계 성장했어요.
                <br />
                새로운 독서 여정을 계속 이어가보세요!
            </p>


            <button
                type="button"
                className={styles.journeyBtn}
                onClick={() => router.push("/journey")}
            >
                내 독서 여정 보러가기
            </button>
        </main>
    );
}

export default LevelUpPage;