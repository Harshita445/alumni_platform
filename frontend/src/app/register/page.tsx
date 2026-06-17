import Link from "next/link";

export default function RegisterPage() {
  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "80px auto",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "48px",
          boxShadow: "var(--shadow-sm)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            marginBottom: "16px",
          }}
        >
          Join Alumly
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "40px",
            lineHeight: 1.7,
          }}
        >
          Choose how you'd like to join the community.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          <Link
            href="/register/student"
            style={cardStyle}
          >
            <h2
              style={{
                marginBottom: "12px",
              }}
            >
              🎓 I'm a Student
            </h2>

            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              Sign up using your Thapar email address
              and get personalized mentor
              recommendations.
            </p>
          </Link>

          <Link
            href="/register/alumni"
            style={cardStyle}
          >
            <h2
              style={{
                marginBottom: "12px",
              }}
            >
              🚀 I'm an Alumni
            </h2>

            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              Share your experience, mentor
              students, and grow your network.
            </p>
          </Link>
        </div>

        <p
          style={{
            marginTop: "32px",
            color: "var(--text-secondary)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

const cardStyle = {
  display: "block",
  background: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "32px",
  textDecoration: "none",
  color: "var(--text-primary)",
  transition: "0.2s ease",
};