"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, LogOut, PencilLine } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function PendingVerificationPage() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <main className="auth-page">
      <div className="auth-bg-pattern auth-bg-pattern-one" aria-hidden="true" />
      <div className="auth-bg-pattern auth-bg-pattern-two" aria-hidden="true" />

      <section className="auth-card" style={{ maxWidth: "940px", minHeight: "680px" }}>
        <div className="auth-form-panel" style={{ padding: "48px 42px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", background: "rgba(122,75,46,0.12)", color: "var(--primary)", fontWeight: 700, marginBottom: "18px" }}>
            <Clock3 size={16} />
            Pending verification
          </div>
          <h1 style={{ fontSize: "clamp(32px, 4vw, 42px)", marginBottom: "12px" }}>
            Your account is pending verification
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "620px" }}>
            To maintain a trusted alumni network, every alumni registering with a personal email address is manually verified. Verification usually takes 24–48 hours.
          </p>

          <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
            <StatusRow icon={<CheckCircle2 size={18} />} title="Email Verified" />
            <StatusRow icon={<CheckCircle2 size={18} />} title="LinkedIn Submitted" />
            <StatusRow icon={<Clock3 size={18} />} title="Verification Pending" />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button type="button" onClick={() => router.push("/register/alumni")} className="auth-google-button" style={{ width: "auto", padding: "0 18px", gap: "8px" }}>
              <PencilLine size={16} />
              Edit LinkedIn
            </button>
            <button type="button" onClick={() => { logout(); router.push("/login"); }} className="auth-primary-button" style={{ width: "auto", padding: "0 18px" }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <aside className="auth-brand-panel" aria-hidden="true" style={{ minHeight: "100%" }}>
          <img src="/thapar-campus-hero.jpg" alt="" className="auth-campus-image" />
          <div className="auth-brand-overlay" />
          <div className="auth-brand-content" style={{ padding: "28px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", marginBottom: "16px" }}>
              <Clock3 size={16} />
              Reassuring review
            </div>
            <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>You are in good hands</h2>
            <p>Once approved, your onboarding will unlock automatically and you can start mentoring students right away.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function StatusRow({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderRadius: "16px", background: "#fffdf9", border: "1px solid var(--border)" }}>
      <span style={{ color: "var(--primary)" }}>{icon}</span>
      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{title}</span>
    </div>
  );
}
