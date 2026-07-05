"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { fetchPaymentSummary, fetchPendingAdminUsers, verifyAdminUser, type PendingAdminUser } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<PendingAdminUser[]>([]);
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<{
    total_gross?: number;
    total_platform_fee?: number;
    total_mentor_amount?: number;
    pending_count?: number;
    paid_count?: number;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "alumni") {
      return;
    }

    const loadPaymentSummary = async () => {
      try {
        const summary = await fetchPaymentSummary(user.access_token);
        setPaymentSummary(summary);
      } catch {
        setPaymentSummary(null);
      }
    };

    loadPaymentSummary();
  }, [router, user]);

  const loadPendingUsers = async () => {
    if (!adminKey.trim()) {
      setError("Enter the admin API key to fetch pending alumni.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const pendingUsers = await fetchPendingAdminUsers(adminKey.trim());
      setUsers(pendingUsers);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load pending users.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    if (!adminKey.trim()) {
      setError("Enter the admin API key before approving users.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      await verifyAdminUser(userId, adminKey.trim());
      setStatusMessage("Alumni account approved.");
      await loadPendingUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = useMemo(() => users.length, [users]);

  if (!user) {
    return null;
  }

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <h1 style={{ marginBottom: "12px" }}>Admin Verification Dashboard</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        Review pending alumni accounts and approve them manually using the configured admin key.
      </p>

      <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
        <label style={{ display: "grid", gap: "8px" }}>
          <span>Admin API Key</span>
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="Enter the configured admin key"
            style={{ padding: "12px 14px", borderRadius: "12px", border: "1px solid var(--border)" }}
          />
        </label>

        <button
          onClick={loadPendingUsers}
          disabled={loading}
          style={{
            width: "fit-content",
            padding: "12px 18px",
            borderRadius: "12px",
            border: "none",
            background: "var(--primary)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Load Pending Alumni"}
        </button>
      </div>

      {error ? <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p> : null}
      {statusMessage ? <p style={{ color: "var(--accent)", marginBottom: "16px" }}>{statusMessage}</p> : null}

      <section style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <MetricCard label="Gross volume" value={`₹${(paymentSummary?.total_gross ?? 0).toLocaleString("en-IN")}`} />
          <MetricCard label="Platform fees" value={`₹${(paymentSummary?.total_platform_fee ?? 0).toLocaleString("en-IN")}`} />
          <MetricCard label="Mentor payouts" value={`₹${(paymentSummary?.total_mentor_amount ?? 0).toLocaleString("en-IN")}`} />
          <MetricCard label="Pending payments" value={paymentSummary?.pending_count ?? 0} />
          <MetricCard label="Paid sessions" value={paymentSummary?.paid_count ?? 0} />
        </div>
      </section>

      <div style={{ display: "grid", gap: "16px" }}>
        {pendingCount === 0 ? (
          <div style={{ padding: "24px", border: "1px solid var(--border)", borderRadius: "16px", background: "var(--surface)" }}>
            No pending alumni accounts right now.
          </div>
        ) : null}

        {users.map((pendingUser) => (
          <div key={pendingUser.id} style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", background: "var(--surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <h2 style={{ marginBottom: "6px" }}>{pendingUser.display_name || pendingUser.email}</h2>
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>{pendingUser.email}</p>
                <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  Sign-in method: {pendingUser.auth_provider}
                </p>
              </div>
              <button
                onClick={() => handleApprove(pendingUser.id)}
                disabled={loading}
                style={{
                  padding: "10px 14px",
                  borderRadius: "999px",
                  border: "none",
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Approve Alumni
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "16px", background: "var(--surface)" }}>
      <p style={{ margin: "0 0 8px", color: "var(--text-secondary)" }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{value}</h2>
    </div>
  );
}
