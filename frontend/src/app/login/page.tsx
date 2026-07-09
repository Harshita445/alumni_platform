"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  GraduationCap,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { demoLogin, googleAuth, loginUser, resetDemoData } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { promptGoogleSignIn } from "@/lib/googleAuth";
import { resolvePostAuthRoute } from "@/lib/onboarding";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const demoFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN ?? process.env.ENABLE_DEMO_LOGIN;
  const isDemoLoginEnabled =
    typeof demoFlag === "boolean"
      ? demoFlag
      : String(demoFlag ?? "").toLowerCase() === "true";

  useEffect(() => {
    if (user) {
      router.replace(resolvePostAuthRoute(user));
    }
  }, [user, router]);

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

  const getLoginDestination = (storedUser: { role?: "student" | "alumni"; onboarding_step?: number }) => {
    if (storedUser.role === "student" && typeof storedUser.onboarding_step === "number" && storedUser.onboarding_step >= 5) {
      return "/dashboard";
    }

    return resolvePostAuthRoute(storedUser);
  };

  const handleGoogleSubmit = async (role: "student" | "alumni") => {
    setError(null);
    setIsSubmitting(true);

    try {
      await promptGoogleSignIn(role, async (credential) => {
        const storedUser = await googleAuth({
          role,
          email: "",
          id_token: credential,
        });
        login(storedUser);
        router.replace(getLoginDestination(storedUser));
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = await loginUser(email.trim().toLowerCase(), password);
      login(storedUser);
      router.replace(getLoginDestination(storedUser));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: "student" | "alumni") => {
    setError(null);
    setIsSubmitting(true);

    try {
      const storedUser = await demoLogin(role);
      login(storedUser);
      router.replace(getLoginDestination(storedUser));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Demo login failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoReset = async () => {
    setError(null);
    setIsResettingDemo(true);

    try {
      await resetDemoData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Demo data reset failed."
      );
    } finally {
      setIsResettingDemo(false);
    }
  };

  const fillDemoCredentials = (role: "student" | "alumni") => {
    setError(null);
    setEmail(role === "student" ? "student-demo@alumly.demo" : "alumni-demo@alumly.demo");
    setPassword(role === "student" ? "StudentDemo123!" : "AlumniDemo123!");
  };

  return (
    <main className="auth-page login-page">
      <div className="auth-bg-pattern auth-bg-pattern-one" aria-hidden="true" />
      <div className="auth-bg-pattern auth-bg-pattern-two" aria-hidden="true" />

      <section className="auth-card" aria-labelledby="login-heading">
        <aside className="auth-brand-panel" aria-hidden="true">
          <img
            src="/thapar-campus-hero.jpg"
            alt=""
            className="auth-campus-image"
          />
          <div className="auth-brand-overlay" />
          <div className="auth-brand-arch auth-brand-arch-top" />
          <div className="auth-brand-arch auth-brand-arch-bottom" />
          <div className="auth-brand-dots" />
          <div className="auth-brand-content">
            <div className="auth-brand-badge">
              <UsersRound size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>Welcome Back</span>
            </div>

            <h2>
              <span>Welcome</span>
              <span>back</span>
            </h2>

            <div className="auth-brand-divider">
              <span />
              <strong>{"\u2726"}</strong>
              <span />
            </div>

            <p className="auth-brand-lede">
              Sign in to continue your journey with the Alumly community.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-row">
                <div className="auth-feature-icon">
                  <ShieldCheck size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div>
                  <h3>Verified Alumni Network</h3>
                  <p>Connect with trusted professionals and industry experts.</p>
                </div>
              </div>

              <div className="auth-feature-row">
                <div className="auth-feature-icon">
                  <GraduationCap size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div>
                  <h3>Meaningful Mentorship</h3>
                  <p>Book 1:1 or group sessions tailored to your goals.</p>
                </div>
              </div>

              <div className="auth-feature-row">
                <div className="auth-feature-icon">
                  <MessageCircle size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div>
                  <h3>Engaged Community</h3>
                  <p>Ask questions, join discussions, and learn from alumni.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-header">
              <div className="auth-eyebrow">
                <LockKeyhole size={17} strokeWidth={2} aria-hidden="true" />
                <span>Login to your account</span>
              </div>
              <h1 id="login-heading">Login to your account</h1>
              <p>Continue your journey with the Alumly community.</p>
            </div>

            <div className="auth-credential-card">
              <div className="auth-credential-title">
                Demo credentials
              </div>
              <div className="auth-credential-line">
                Student: <strong>student-demo@alumly.demo</strong> / <strong>StudentDemo123!</strong>
              </div>
              <div className="auth-credential-line">
                Alumni: <strong>alumni-demo@alumly.demo</strong> / <strong>AlumniDemo123!</strong>
              </div>
              <div className="auth-credential-actions">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("student")}
                  className="auth-demo-button"
                  style={{ ...quickFillButtonStyle, minWidth: "140px" }}
                >
                  Use demo student
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("alumni")}
                  className="auth-demo-button"
                  style={{ ...quickFillButtonStyle, minWidth: "140px" }}
                >
                  Use demo alumni
                </button>
              </div>
            </div>

            <div className="auth-form-stack">
            <label className="auth-field">
              <span>College email</span>
              <div className="auth-input-wrap">
                <Mail size={21} strokeWidth={1.9} aria-hidden="true" />
                <input
                  type="email"
                  placeholder="Enter your college email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={21} strokeWidth={1.9} aria-hidden="true" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
              </div>
            </label>

            {error ? <p style={errorStyle}>{error}</p> : null}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="auth-primary-button"
              style={{
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {isDemoLoginEnabled ? (
              <>
                <div className="auth-separator" aria-hidden="true">
                  <span />
                  <strong>or</strong>
                  <span />
                </div>

                <div style={{ display: "grid", gap: "14px" }}>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("student")}
                    disabled={isSubmitting}
                    className="auth-demo-button"
                    style={{ ...demoButtonStyle, opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    <GraduationCap size={19} aria-hidden="true" />
                    Continue as Demo Student
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin("alumni")}
                    disabled={isSubmitting}
                    className="auth-demo-button"
                    style={{ ...demoButtonStyle, opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    <Briefcase size={19} aria-hidden="true" />
                    Continue as Demo Alumni
                  </button>

                </div>
              </>
            ) : null}

            <div className="auth-separator" aria-hidden="true">
              <span />
              <strong>or</strong>
              <span />
            </div>

            <div style={{ display: "grid", gap: "14px" }}>

              <button
                type="button"
                onClick={() => handleGoogleSubmit("student")}
                disabled={!isGoogleReady}
                className="auth-google-button"
                style={{
                  opacity: isGoogleReady ? 1 : 0.7,
                }}
              >
                <span className="google-mark" aria-hidden="true">G</span>
                Continue with Google (Student)
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSubmit("alumni")}
                disabled={!isGoogleReady}
                className="auth-google-button"
                style={{
                  opacity: isGoogleReady ? 1 : 0.7,
                }}
              >
                <span className="google-mark" aria-hidden="true">G</span>
                Continue with Google (Alumni)
              </button>
            </div>

            <div className="auth-footer">
              <span>New to Alumly?</span>
              <a href="/register">
                Create your account <span aria-hidden="true">-&gt;</span>
              </a>
            </div>
          </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const errorStyle = {
  color: "var(--danger)",
  margin: 0,
  fontSize: "14px",
  fontWeight: 600,
};

const demoButtonStyle = {
  minHeight: "60px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  border: "1px solid #E8D9CB",
  borderRadius: "16px",
  background: "#fff",
  color: "#4F3527",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.04)",
  transition: "transform .25s ease, box-shadow .25s ease",
};

const quickFillButtonStyle = {
  minHeight: "42px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  border: "1px solid #E8D9CB",
  borderRadius: "999px",
  background: "#FFFCF8",
  color: "#6E442B",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  padding: "0 16px",
  boxShadow: "0 8px 16px rgba(70, 45, 25, 0.04)",
};

const demoResetButtonStyle = {
  ...demoButtonStyle,
  minHeight: "48px",
  borderColor: "#d8c6b7",
  color: "#7f7067",
  fontSize: "14px",
  fontWeight: 600,
  boxShadow: "none",
};
