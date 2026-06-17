import Link from "next/link";

export default function LoginPage() {
  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "80px auto",
        padding: "32px",
      }}
    >
      <h1 style={{ marginBottom: "24px" }}>
        Welcome back
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <input
          placeholder="College email"
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          style={inputStyle}
        />

        <button style={buttonStyle}>
          Login
        </button>

        <Link href="/register">
          Create account
        </Link>
      </div>
    </main>
  );
}

const inputStyle = {
  padding: "14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
};

const buttonStyle = {
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  padding: "16px",
  borderRadius: "var(--radius-md)",
};