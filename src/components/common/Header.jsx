"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./header.module.scss";

function Header() {
  const router = useRouter();

  const handleLogoClick = (e) => {
    e.preventDefault();
    router.push(`/?reset=${Date.now()}`);
  };

  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={styles.logo}
        onClick={handleLogoClick}
      >
        <span>Book</span>Journey
      </Link>

      <Link href="/journey" className={styles.userBtn}>
        <img src="/img/ic_profile.svg" alt="독서기록" />
      </Link>
    </header>
  );
}

export default Header;