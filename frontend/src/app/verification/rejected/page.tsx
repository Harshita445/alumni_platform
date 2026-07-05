"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, Undo2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function RejectedVerificationPage() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <main className="auth-page">
      <div className="auth-bg-pattern auth-bg-pattern-one" aria-hidden="true" />
      <div className="auth-bg-pattern auth-bg-pattern-two" aria-hidden="true" />

      <section className="auth-card" style={{ maxWidth: "940px", minHeight: "680px" }}>
        <div className="auth-form-panel" style={{ padding: "48px 42px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", background: "rgba(122,75,46,0.12)", color: "var(--primary)", fontWeight: 700, marginBottom: "18px" }}>
            <AlertCircle size={16} />
            Verification update
          </div>
          <h1 style={{ fontSize: "clamp(32px, 4vw, 42px)", marginBottom: "12px" }}>
            Verification could not be completed
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "620px" }}>
            We could not verify your alumni profile from the current details. Please review the information you submitted and resubmit when you are ready.
          </p>

          <div style={{ padding: "16px 18px", borderRadius: "16px", background: "#fffdf9", border: "1px solid var(--border)", marginBottom: "24px" }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Rejection reason</p>
            <p style={{ marginTop: "6px", marginBottom: 0 }}>LinkedIn profile could not be verified as a match to your submitted details.</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button type="button" onClick={() => router.push("/register/alumni")} className="auth-google-button" style={{ width: "auto", padding: "0 18px", gap: "8px" }}>
              <Undo2 size={16} />
              Update LinkedIn
            </button>
            <button type="button" onClick={() => { logout(); router.push("/login"); }} className="auth-primary-button" style={{ width: "auto", padding: "0 18px" }}>
              <RefreshCw size={16} />
              Resubmit Verification
            </button>
          </div>
        </div>

        <aside className="auth-brand-panel" aria-hidden="true" style={{ minHeight: "100%" }}>
          <img src="/thapar-campus-hero.jpg" alt="" className="auth-campus-image" />
          <div className="auth-brand-overlay" />
          <div className="auth-brand-content" style={{ padding: "28px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", marginBottom: "16px" }}>
              <AlertCircle size={16} />
              Supportive next step
            </div>
            <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>We are here to help</h2>
            <p>Small updates are often enough to get your profile verified, and you can try again right away.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
