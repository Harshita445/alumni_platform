"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  Handshake,
  Link as LinkIcon,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { Playfair_Display } from "next/font/google";

import { promptGoogleSignIn } from "@/lib/googleAuth";
import { googleAuth, registerUser, saveStoredUser, updateProfile, type StoredUser } from "@/lib/api";
import { isThaparEmail } from "@/lib/auth";
import { resolvePostAuthRoute } from "@/lib/onboarding";
import styles from "./alumni-register.module.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-alumni-register-serif",
});

export default function AlumniRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function prepareGoogle() {
      const ready = await import("@/lib/googleAuth").then((mod) => mod.loadGoogleAuthScript());
      if (!ignore) {
        setIsGoogleReady(ready);
      }
    }

    prepareGoogle();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const isStudentEmail = email.trim().toLowerCase();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowLinkedIn(!isThaparEmail(isStudentEmail) && Boolean(isStudentEmail));
  }, [email]);

  const handleGoogleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await promptGoogleSignIn("alumni", async (credential) => {
        const storedUser = await googleAuth({
          role: "alumni",
          email: "",
          id_token: credential,
        });
        saveStoredUser(storedUser);
        router.push(resolvePostAuthRoute(storedUser));
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name || !email || !password) {
      setError("Name, email, and password are required.");
      return;
    }

    if (!isThaparEmail(email) && !linkedIn.trim()) {
      setError("Please add your LinkedIn profile URL so we can verify your alumni identity.");
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = await registerUser({
        email,
        password,
        role: "alumni",
      });

      await updateProfile(storedUser.access_token, {
        full_name: name,
        graduation_year: graduationYear ? Number(graduationYear) : undefined,
        company,
        designation,
        linkedin_url: linkedIn || undefined,
      });

      const nextUser: StoredUser = {
        ...storedUser,
        verification_status: isThaparEmail(email) ? "verified" : "pending",
        onboarding_step: 0,
      };

      saveStoredUser(nextUser);
      router.push(resolvePostAuthRoute(nextUser));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`${styles.page} ${playfair.variable}`}>
      <div className={styles.botanicalTop} aria-hidden="true" />
      <div className={styles.botanicalBottom} aria-hidden="true" />

      <section className={styles.shell} aria-labelledby="alumni-register-heading">
        <div className={styles.formSide}>
          <div className={styles.formCard}>
            <img src="/logo.png" alt="Alumly logo" className={styles.authLogo} />

            <div className={styles.kicker}>
              <Briefcase size={18} strokeWidth={1.8} />
              Alumni Registration
            </div>

            <h1 id="alumni-register-heading">
              Create your alumni account
            </h1>
            <p className={styles.supportingText}>
              Register your account first. We will verify trusted alumni profiles separately before onboarding begins.
            </p>

            <div className={styles.fields}>
              <label className={styles.inputWrap}>
                <User size={20} strokeWidth={1.8} aria-hidden="true" />
                <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              </label>

              <label className={styles.inputWrap}>
                <Mail size={20} strokeWidth={1.8} aria-hidden="true" />
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>

              <label className={styles.inputWrap}>
                <Lock size={20} strokeWidth={1.8} aria-hidden="true" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>

              <label className={styles.inputWrap}>
                <Calendar size={20} strokeWidth={1.8} aria-hidden="true" />
                <input placeholder="Graduation year" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} />
              </label>

              <label className={styles.inputWrap}>
                <Building2 size={20} strokeWidth={1.8} aria-hidden="true" />
                <input placeholder="Current company" value={company} onChange={(e) => setCompany(e.target.value)} />
              </label>

              <label className={styles.inputWrap}>
                <Briefcase size={20} strokeWidth={1.8} aria-hidden="true" />
                <input placeholder="Current designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
              </label>

              {showLinkedIn ? (
                <label className={`${styles.inputWrap} ${styles.linkedInField}`}>
                  <LinkIcon size={20} strokeWidth={1.8} aria-hidden="true" />
                  <input placeholder="https://linkedin.com/in/yourname" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} />
                </label>
              ) : null}
            </div>

            {error ? <p className={styles.errorText}>{error}</p> : null}

            <button onClick={handleSubmit} disabled={isSubmitting} className={styles.primaryButton}>
              <span>{isSubmitting ? "Creating account..." : "Create Account"}</span>
              <ArrowRight size={20} strokeWidth={1.9} aria-hidden="true" />
            </button>

            <div className={styles.separator} aria-hidden="true">
              <span />
              <strong>OR</strong>
              <span />
            </div>

            <button type="button" onClick={handleGoogleSubmit} disabled={!isGoogleReady} className={styles.googleButton}>
              <span className={styles.googleLabel}>
                <span className={styles.googleMark} aria-hidden="true">G</span>
                Continue with Google
              </span>
              <ArrowRight size={18} strokeWidth={1.9} aria-hidden="true" />
            </button>

            <p className={styles.signInPrompt}>
              Already have an account?{" "}
              <button type="button" onClick={() => router.push("/login")}>
                Sign in
              </button>
            </p>
          </div>
        </div>

        <aside className={styles.brandPanel}>
          <div className={styles.brandDots} aria-hidden="true" />
          <div className={styles.brandContent}>
            <div className={styles.badge}>
              <ShieldCheck size={16} strokeWidth={1.9} aria-hidden="true" />
              Verification First
            </div>

            <div className={styles.crest} aria-hidden="true">
              <GraduationCap size={26} strokeWidth={1.6} />
            </div>

            <h2>Your account stays secure</h2>

            <div className={styles.brandDivider} aria-hidden="true">
              <span />
              <strong>✦</strong>
              <span />
            </div>

            <p className={styles.brandIntro}>
              Thapar alumni accounts can begin onboarding immediately. Personal email accounts wait for a trusted verification review.
            </p>

            <div className={styles.featureStack}>
              <div className={styles.featureCard}>
                <span>
                  <ShieldCheck size={24} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div>
                  <h3>Trusted verification</h3>
                  <p>Manual verification ensures a trusted alumni network.</p>
                </div>
              </div>

              <div className={styles.featureCard}>
                <span>
                  <Lock size={24} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div>
                  <h3>Privacy first</h3>
                  <p>Your information is never shared without permission.</p>
                </div>
              </div>

              <div className={styles.featureCard}>
                <span>
                  <Handshake size={24} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div>
                  <h3>Built for mentorship</h3>
                  <p>Connect with students, mentor confidently, and grow your alumni network.</p>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => router.push("/login")} className={styles.backButton}>
              Back to login
              <ArrowLeft size={18} strokeWidth={1.9} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.campusLineArt} aria-hidden="true" />
        </aside>
      </section>
    </main>
  );
}
