"use client";

import React, { useState } from "react";
import styles from "@/app/join/join.module.scss";
import { useRouter } from "next/navigation";

function JoinForm() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [character, setCharacter] = useState("w");

    const handleJoin = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                password,
                character,
                growth: {
                    level: 1,
                },
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        router.push("/login?signup=success");
    };

    return (
        <div className={styles.joinWrap}>
            <header className={styles.header}>
                <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => router.back()}
                >
                    <img src="/img/ic_back_btn.png" alt="뒤로가기" />
                </button>

                <h1>회원가입</h1>
            </header>

            <form className={styles.joinForm} onSubmit={handleJoin}>
                <div className={styles.inputWrap}>
                    <h2>이름</h2>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className={styles.inputWrap}>
                    <h2>아이디</h2>

                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className={styles.inputWrap}>
                    <h2>비밀번호</h2>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className={styles.characterSection}>
                    <h2>독서 메이트 선택</h2>

                    <p>
                        선택한 캐릭터와 함께 독서 레벨을 성장시켜보세요.
                    </p>

                    <div className={styles.characterList}>
                        <button
                            type="button"
                            className={`${styles.characterBtn} ${character === "w" ? styles.active : ""
                                }`}
                            onClick={() => setCharacter("w")}
                        >
                            <img
                                src="/img/level_1_w.png"
                                alt="캐릭터 w"
                            />
                        </button>

                        <button
                            type="button"
                            className={`${styles.characterBtn} ${character === "m" ? styles.active : ""
                                }`}
                            onClick={() => setCharacter("m")}
                        >
                            <img
                                src="/img/level_1_m.png"
                                alt="캐릭터 m"
                            />
                        </button>

                        <button
                            type="button"
                            className={`${styles.characterBtn} ${character === "p" ? styles.active : ""
                                }`}
                            onClick={() => setCharacter("p")}
                        >
                            <img
                                src="/img/level_1_p.png"
                                alt="캐릭터 p"
                            />
                        </button>
                    </div>
                </div>

                <button type="submit" className={styles.completeBtn}>
                    완료
                </button>
            </form>
        </div>
    );
}

export default JoinForm;