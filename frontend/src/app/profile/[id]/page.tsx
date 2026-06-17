import Image from "next/image";
import { notFound } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const { id } = params;
  const response = await fetch(
    `${API_BASE}/alumni/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    notFound();
  }

  const alumni = await response.json();

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Image
          src={
            alumni.profile_image ||
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
          }
          alt={alumni.full_name}
          width={120}
          height={120}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "24px",
          }}
        />

        <h1 style={{ marginBottom: "12px" }}>
          {alumni.full_name}
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "8px",
          }}
        >
          {alumni.designation} · {alumni.company}
        </p>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "32px",
          }}
        >
          Class of {alumni.graduation_year || "N/A"}
        </p>

        <p
          style={{
            lineHeight: 1.8,
            marginBottom: "32px",
          }}
        >
          {alumni.bio || "No bio provided."}
        </p>

        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              Branch
            </p>
            <strong>{alumni.branch || "Not specified"}</strong>
          </div>

          <div>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              LinkedIn
            </p>
            {alumni.linkedin_url ? (
              <a
                href={alumni.linkedin_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--primary)" }}
              >
                View profile
              </a>
            ) : (
              <span>Not specified</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
