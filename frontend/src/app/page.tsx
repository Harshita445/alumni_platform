import Link from "next/link";
import {
  UsersRound,
  MessageCircle,
  FileText,
  Users,
  Calendar,
} from "lucide-react";

const features = [
  {
    Icon: MessageCircle,
    title: "1:1 Mentorship",
    description:
      "Learn from experienced alumni who've been where you are.",
  },
  {
    Icon: FileText,
    title: "Resume Reviews",
    description:
      "Get expert feedback and make your resume stand out.",
  },
  {
    Icon: Users,
    title: "Mock Interviews",
    description:
      "Practice real interviews and build confidence to succeed.",
  },
  {
    Icon: Calendar,
    title: "Career Guidance",
    description:
      "Receive personalized advice and make informed career decisions.",
  },
];

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
              gap: "10px",
              padding: "9px 16px",
              background: "var(--surface-secondary)",
              borderRadius: "999px",
              color: "var(--text-secondary)",
              marginBottom: "32px",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <UsersRound
              size={16}
              color="#8B5E3C"
              strokeWidth={2.4}
              aria-hidden="true"
            />
            Built for students. Powered by alumni.
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

        </div>

        <div
          style={{
            position: "relative",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-28px",
              right: "-30px",
              width: "110px",
              height: "150px",
              backgroundImage:
                "radial-gradient(rgba(139,94,60,0.18) 1.8px, transparent 1.8px)",
              backgroundSize: "16px 16px",
              zIndex: 0,
            }}
          />
          <img
            src="/thapar-campus-hero.jpg"
            alt="Thapar campus red residence building"
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              height: "auto",
              aspectRatio: "3 / 2",
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "32px",
              border: "1px solid rgba(139,94,60,0.14)",
              boxShadow: "0 18px 45px rgba(47, 33, 26, 0.12)",
            }}
          />
        </div>
      </section>

      <section
        style={{
          width: "100%",
          marginTop: "80px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "40px 48px",
            background: "#F7F1EB",
            border: "1px solid rgba(139,94,60,0.12)",
            borderRadius: "24px",
          }}
        >
          <h2
            style={{
              marginBottom: "40px",
              color: "#2D1B14",
              fontSize: "32px",
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: 0,
            }}
          >
            Everything you need to grow
          </h2>

          <div
            className="growth-feature-grid"
          >
            {features.map(({ Icon, title, description }, index) => (
              <div
                key={title}
                style={{
                  position: "relative",
                  textAlign: "center",
                }}
              >
                {index < features.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="growth-feature-divider"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: "-24px",
                      width: "1px",
                      height: "120px",
                      background: "rgba(139,94,60,0.12)",
                    }}
                  />
                ) : null}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    margin: "0 auto",
                    borderRadius: "999px",
                    background: "#EFE5DA",
                    color: "#8B5E3C",
                  }}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>

                <h3
                  style={{
                    marginTop: "16px",
                    color: "#2D1B14",
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    letterSpacing: 0,
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    maxWidth: "220px",
                    margin: "8px auto 0",
                    color: "#6A5648",
                    fontSize: "15px",
                    lineHeight: 1.7,
                  }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
