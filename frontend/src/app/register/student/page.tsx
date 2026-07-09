"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Handshake,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Playfair_Display } from "next/font/google";

import { googleAuth, registerUser, saveStoredUser, updateProfile, type StoredUser } from "@/lib/api";
import { isEligibleStudentEmail, resolvePostAuthRoute } from "@/lib/onboarding";
import { promptGoogleSignIn } from "@/lib/googleAuth";
import { isThaparEmail } from "@/lib/auth";
import styles from "../alumni/alumni-register.module.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-alumni-register-serif",
});

const alumniCandidatePattern = /_be2[3456](?:$|_)/i;

export default function StudentRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);

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

  const handleGoogleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await promptGoogleSignIn("student", async (credential) => {
        const storedUser = await googleAuth({
          role: "student",
          email: "",
          id_token: credential,
        });
        saveStoredUser(storedUser);

        if (!storedUser.email || !isEligibleStudentEmail(storedUser.email)) {
          setShowEligibilityModal(true);
          return;
        }

        router.push(resolvePostAuthRoute(storedUser));
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const localPart = normalizedEmail.split("@", 1)[0] || "";

    if (fullName.trim().length < 3) {
      return "Full name must be at least 3 characters.";
    }

    if (!isThaparEmail(normalizedEmail)) {
      return "Students must use a Thapar university email address.";
    }

    if (alumniCandidatePattern.test(localPart)) {
      return "This email looks like an alumni email. Please register as an alumni instead.";
    }

    // Username is no longer required for student registration.

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }

    if (password !== confirmPassword) {
      return "Passwords must match.";
    }

    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = await registerUser({
        email: email.trim().toLowerCase(),
        password,
        role: "student",
      });

      await updateProfile(storedUser.access_token, {
        full_name: fullName.trim(),
      });

      const nextUser: StoredUser = {
        ...storedUser,
        verification_status: "verified",
        onboarding_step: 0,
      };

      saveStoredUser(nextUser);
      setSuccess("Account created successfully! Please verify your email to activate your account.");
      router.push(resolvePostAuthRoute(nextUser));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`${styles.page} ${playfair.variable}`}>
      <div className={styles.botanicalTop} aria-hidden="true" />
      <div className={styles.botanicalBottom} aria-hidden="true" />

      <section className={styles.shell} aria-labelledby="student-register-heading">
        <div className={styles.formSide}>
          <div className={styles.formCard}>
            <img src="/logo.png" alt="Alumly logo" className={styles.authLogo} />

            <div className={styles.kicker}>
              <GraduationCap size={18} strokeWidth={1.8} />
              Student Registration
            </div>

            <h1 id="student-register-heading">
              Start your student journey
            </h1>
            <p className={styles.supportingText}>
              Join Alumly to connect with verified alumni, discover mentorship opportunities, and grow your professional network from your very first semester.
            </p>

            <div className={styles.fields}>
              <label className={styles.inputWrap}>
                <User size={20} strokeWidth={1.8} aria-hidden="true" />
                <input
                  name="name"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                />
              </label>

              <label className={styles.inputWrap}>
                <Mail size={20} strokeWidth={1.8} aria-hidden="true" />
                <input
                  name="email"
                  type="email"
                  placeholder="you@thapar.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </label>

              

              <label className={styles.inputWrap}>
                <Lock size={20} strokeWidth={1.8} aria-hidden="true" />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </label>

              <label className={styles.inputWrap}>
                <Lock size={20} strokeWidth={1.8} aria-hidden="true" />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </label>
            </div>

            {error ? <p className={styles.errorText}>{error}</p> : null}
            {success ? <p className={styles.successText}>{success}</p> : null}

            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className={styles.primaryButton}>
              <span>{isSubmitting ? "Creating account..." : "Create Student Account"}</span>
              <ArrowRight size={20} strokeWidth={1.9} aria-hidden="true" />
            </button>

            <div className={styles.separator} aria-hidden="true">
              <span />
              <strong>OR</strong>
              <span />
            </div>

            <button type="button" onClick={handleGoogleSubmit} disabled={!isGoogleReady || isSubmitting} className={styles.googleButton}>
              <span className={styles.googleLabel}>
                <span className={styles.googleMark} aria-hidden="true">G</span>
                Continue with Thapar Google
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
              Thapar Verified
            </div>

            <div className={styles.crest} aria-hidden="true">
              <GraduationCap size={26} strokeWidth={1.6} />
            </div>

            <h2>Your journey starts here</h2>

            <div className={styles.brandDivider} aria-hidden="true">
              <span />
              <strong>*</strong>
              <span />
            </div>

            <p className={styles.brandIntro}>
              Use your university email or your Thapar Google account to instantly unlock mentorship, opportunities, and a trusted student community.
            </p>

            <div className={styles.featureStack}>
              <div className={styles.featureCard}>
                <span>
                  <GraduationCap size={24} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div>
                  <h3>Verified student</h3>
                  <p>Only active students with a valid university email can access the platform.</p>
                </div>
              </div>

              <div className={styles.featureCard}>
                <span>
                  <Handshake size={24} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div>
                  <h3>Built for mentorship</h3>
                  <p>Connect with alumni, explore guidance, and build meaningful professional relationships.</p>
                </div>
              </div>

              <div className={styles.featureCard}>
                <span>
                  <Shield size={24} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div>
                  <h3>Private & secure</h3>
                  <p>Your personal information stays protected and is never shared without your permission.</p>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => router.push("/login")} className={styles.backButton}>
              Back to Login
              <ArrowLeft size={18} strokeWidth={1.9} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.campusLineArt} aria-hidden="true" />
        </aside>
      </section>

      {showEligibilityModal ? (
        <div style={modalBackdrop} role="dialog" aria-modal="true">
          <div style={modalCard}>
            <div style={modalIcon}>
              <Sparkles size={24} />
            </div>
            <h2>This account isn&apos;t eligible for Student Registration</h2>
            <p>We couldn&apos;t verify your account as a currently enrolled Thapar student. Student accounts require an official Thapar University email address from one of the currently enrolled undergraduate batches.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
              <span style={pill}>rahul_be24@thapar.edu</span>
              <span style={pill}>ananya_be25@thapar.edu</span>
              <span style={pill}>priya_be26@thapar.edu</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginTop: "24px" }}>
              <button type="button" onClick={() => setShowEligibilityModal(false)} style={secondaryButton}>Try Another Account</button>
              <button type="button" onClick={() => router.push("/register/alumni")} style={primaryButton}>Register as Alumni <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

const modalBackdrop = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(47, 32, 24, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  zIndex: 60,
};

const modalCard = {
  width: "100%",
  maxWidth: "560px",
  padding: "32px",
  borderRadius: "28px",
  background: "var(--surface)",
  boxShadow: "0 24px 60px rgba(47, 32, 24, 0.18)",
  textAlign: "center" as const,
};

const modalIcon = {
  display: "inline-flex",
  width: "56px",
  height: "56px",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "rgba(122,75,46,0.14)",
  color: "var(--primary)",
  marginBottom: "16px",
};

const pill = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(122,75,46,0.1)",
  color: "var(--primary)",
  fontSize: "14px",
};

const secondaryButton = {
  border: "1px solid var(--border)",
  background: "#fffdf9",
  color: "var(--text-primary)",
  padding: "12px 16px",
  borderRadius: "999px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const primaryButton = {
  border: "none",
  background: "var(--primary)",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: "999px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};
