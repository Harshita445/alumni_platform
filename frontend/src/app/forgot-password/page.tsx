"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await requestPasswordReset(email);
      setSuccess(
        (res as any).token
          ? "Password reset token generated (dev). Check email or test output."
          : "If an account exists, a password reset email has been sent."
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 24 }}>
      <h1>Forgot your password?</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        Enter your account email and we’ll send a password reset link.
      </p>

      <form onSubmit={submit} style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6 }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 16px", borderRadius: 6 }}
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ padding: "10px 16px", borderRadius: 6 }}
          >
            Cancel
          </button>
        </div>
      </form>

      {error && (
        <div style={{ color: "var(--danger)", marginTop: 12 }}>{error}</div>
      )}

      {success && (
        <div style={{ color: "var(--success)", marginTop: 12 }}>{success}</div>
      )}
    </main>
  );
}
