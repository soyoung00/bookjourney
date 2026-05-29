// app/login/page.jsx

import LoginForm from "./component/LoginForm";
import styles from "./login.module.scss";

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <LoginForm />
    </main>
  );
}