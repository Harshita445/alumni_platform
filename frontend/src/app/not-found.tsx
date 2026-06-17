import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "64px",
            marginBottom: "16px",
          }}
        >
          404
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "24px",
          }}
        >
          This page could not be found.
        </p>

        <Link
          href="/"
          style={{
            background: "var(--primary)",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "var(--radius-md)",
          }}
        >
          Go home
        </Link>
      </div>
    </main>
  );
}