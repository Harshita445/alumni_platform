import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap } from "lucide-react";
import { Playfair_Display } from "next/font/google";

import styles from "./register.module.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-register-serif",
});

export default function RegisterPage() {
  return (
    <main className={`${styles.page} ${playfair.variable}`}>
      <div className={styles.cornerDots} aria-hidden="true" />

      <section className={styles.container} aria-labelledby="register-heading">
        <div className={styles.header}>
          <h1 id="register-heading">Join Alumly</h1>

          <div className={styles.divider} aria-hidden="true">
            <span />
            <strong>✦</strong>
            <span />
          </div>

          <p>Choose how you would like to join the community.</p>
        </div>

        <div className={styles.roleGrid}>
          <Link href="/register/student" className={styles.roleCard}>
            <span className={styles.iconBadge} aria-hidden="true">
              <GraduationCap size={32} strokeWidth={1.75} />
            </span>

            <h2>Student</h2>
            <span className={styles.titleRule} aria-hidden="true" />

            <p>
              Sign up using your Thapar email address and get personalized
              mentor recommendations.
            </p>

            <span className={styles.cta}>
              Join as Student
              <ArrowRight size={19} strokeWidth={1.9} aria-hidden="true" />
            </span>
          </Link>

          <Link href="/register/alumni" className={styles.roleCard}>
            <span className={styles.iconBadge} aria-hidden="true">
              <Briefcase size={32} strokeWidth={1.75} />
            </span>

            <h2>Alumni</h2>
            <span className={styles.titleRule} aria-hidden="true" />

            <p>
              Share your experience, mentor students, and grow your network.
            </p>

            <span className={styles.cta}>
              Join as Alumni
              <ArrowRight size={19} strokeWidth={1.9} aria-hidden="true" />
            </span>
          </Link>
        </div>

        <footer className={styles.footer}>
          <div className={styles.divider} aria-hidden="true">
            <span />
            <strong>✦</strong>
            <span />
          </div>

          <p>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </footer>
      </section>
    </main>
  );
}
