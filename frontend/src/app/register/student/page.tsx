"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";

import { googleAuth, saveStoredUser } from "@/lib/api";
import { isEligibleStudentEmail } from "@/lib/onboarding";
import { promptGoogleSignIn } from "@/lib/googleAuth";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

        router.push("/onboarding");
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-bg-pattern auth-bg-pattern-one" aria-hidden="true" />
      <div className="auth-bg-pattern auth-bg-pattern-two" aria-hidden="true" />

      <section className="auth-card" style={{ maxWidth: "940px" }}>
        <div className="auth-form-panel" style={{ padding: "40px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--primary)", fontWeight: 700, marginBottom: "16px" }}>
            <GraduationCap size={20} />
            Student registration
          </div>

          <h1 style={{ fontSize: "clamp(34px, 4vw, 46px)", marginBottom: "12px" }}>
            Continue with your Thapar Account
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "28px", maxWidth: "620px" }}>
            Access the student mentorship experience with the same Google identity you already use for your university services.
          </p>

          <button
            type="button"
            onClick={handleGoogleSubmit}
            disabled={!isGoogleReady || isSubmitting}
            className="auth-google-button"
            style={{ opacity: isGoogleReady && !isSubmitting ? 1 : 0.7 }}
          >
            <span className="google-mark" aria-hidden="true">G</span>
            Continue with your Thapar Account
          </button>

          <p style={{ marginTop: "16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
            Only currently enrolled undergraduate students with official Thapar University email addresses can register as students.
          </p>

          {error ? <p style={{ color: "var(--danger)", marginTop: "14px" }}>{error}</p> : null}
        </div>

        <aside className="auth-brand-panel" aria-hidden="true" style={{ minHeight: "100%" }}>
          <img src="/thapar-campus-hero.jpg" alt="" className="auth-campus-image" />
          <div className="auth-brand-overlay" />
          <div className="auth-brand-content" style={{ padding: "28px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", marginBottom: "16px" }}>
              <Sparkles size={16} />
              Premium onboarding
            </div>
            <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>A guided path to mentorship</h2>
            <p>We keep your identity simple, verify your batch, and start your onboarding instantly once you are eligible.</p>
          </div>
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
