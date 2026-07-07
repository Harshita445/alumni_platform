import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "96px 24px" }}>
      <section
        style={{
          border: "1px solid var(--border)",
          borderRadius: "24px",
          background: "var(--surface)",
          padding: "42px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <p style={{ margin: "0 0 10px", color: "var(--primary)", fontWeight: 800 }}>
          403 Unauthorized
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(36px, 6vw, 56px)" }}>
          This area is not available for your account type.
        </h1>
        <p style={{ margin: "18px 0 28px", fontSize: "18px" }}>
          Alumly keeps student and alumni tools separate so each role sees the right workflows.
        </p>
        <Link className="btn btn-primary" href="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
