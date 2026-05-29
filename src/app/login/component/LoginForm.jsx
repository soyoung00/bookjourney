// app/login/_components/LoginForm.jsx

"use client";

import styles from "../login.module.scss";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");

    const isSignupSuccess = searchParams.get("signup") === "success";

    const handleLogin = async (e) => {
        e.preventDefault();

        const res = await signIn("credentials", {
            userId,
            password,
            redirect: false,
        });

        if (res.error) {
            alert("아이디 또는 비밀번호가 올바르지 않습니다.");
            return;
        }

        router.push("/");
    };

    return (
            <section className={styles.loginBox}>
                <h1 className={styles.logo}>
                    <span>Book</span>Journey
                </h1>

                {isSignupSuccess && (
                    <p className={styles.successText}>
                        회원가입이 완료되었습니다.
                    </p>
                )}

                <form className={styles.loginForm} onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">
                        로그인
                    </button>
                </form>

                <button
                    type="button"
                    className={styles.signupBtn}
                    onClick={() => router.push("/join")}
                >
                    회원가입
                </button>
            </section>
    );
}

export default LoginForm;