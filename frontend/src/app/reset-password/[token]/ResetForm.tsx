"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmPasswordReset } from "@/lib/api";

export default function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await confirmPasswordReset(token, password);
      setSuccess("Password reset successful. You can now log in.");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: 20 }}>
      <label style={{ display: "block", marginBottom: 8 }}>New password</label>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6 }}
      />

      <label style={{ display: "block", marginBottom: 8 }}>Confirm password</label>
      <input
        type="password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6 }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 16px", borderRadius: 6 }}
        >
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </div>

      {error && (
        <div style={{ color: "var(--danger)", marginTop: 12 }}>{error}</div>
      )}

      {success && (
        <div style={{ color: "var(--success)", marginTop: 12 }}>{success}</div>
      )}
    </form>
  );
}
