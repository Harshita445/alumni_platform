import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: "var(--container-width)",
        margin: "0 auto",
        padding: "72px 24px 120px",
      }}
    >
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "64px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "var(--surface-secondary)",
              borderRadius: "999px",
              color: "var(--text-secondary)",
              marginBottom: "32px",
              fontSize: "14px",
            }}
          >
            ● 500+ verified alumni from Thapar
          </div>

          <h1
            style={{
              fontSize: "72px",
              lineHeight: 1.05,
              letterSpacing: "-3px",
              marginBottom: "28px",
              maxWidth: "700px",
            }}
          >
            Connect with alumni who have walked your path.
          </h1>

          <p
            style={{
              fontSize: "22px",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: "620px",
              marginBottom: "40px",
            }}
          >
            Get career guidance, resume reviews, mock interviews,
            and mentorship from professionals who once studied at
            Thapar.
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "56px",
            }}
          >
            <Link
              href="/search"
              style={{
                background: "var(--primary)",
                color: "white",
                padding: "16px 28px",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
              }}
            >
              Find a mentor
            </Link>

            <Link
              href="/register"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "16px 28px",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
              }}
            >
              Join as alumni
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: "48px",
            }}
          >
            <Stat value="500+" label="Verified alumni" />
            <Stat value="120+" label="Companies" />
            <Stat value="4.9★" label="Average rating" />
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            borderRadius: "32px",
            padding: "24px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200"
            alt="Students networking"
            style={{
              width: "100%",
              height: "600px",
              objectFit: "cover",
              borderRadius: "24px",
            }}
          />
        </div>
      </section>
    </main>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "38px",
          marginBottom: "4px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </div>
    </div>
  );
}