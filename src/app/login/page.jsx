// app/login/page.jsx

import { Suspense } from "react";
import LoginForm from "./component/LoginForm";
import styles from "./login.module.scss";

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <div className={styles.test}>
        [Test 계정]
        아이디 : kd / 비밀번호 : 1234
      </div>
    </main>
  );
}