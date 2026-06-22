"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AlumniCard from "@/components/AlumniCard";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { Alumni, fetchAlumni } from "@/lib/api";

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    const loadAlumni = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAlumni(user.access_token);
        if (active) {
          setAlumni(result);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load alumni."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAlumni();

    return () => {
      active = false;
    };
  }, [user]);

  const filteredAlumni = useMemo(() => {
    return alumni.filter((alumniItem) => {
      const matchesCompany = alumniItem.company
        ?.toLowerCase()
        .includes(companyFilter.toLowerCase());
      const matchesRole = alumniItem.designation
        ?.toLowerCase()
        .includes(roleFilter.toLowerCase());

      return (
        matchesCompany !== false &&
        matchesRole !== false
      );
    });
  }, [alumni, companyFilter, roleFilter]);

  if (!user) {
    return (
      <main
        style={{
          maxWidth: "600px",
          margin: "80px auto",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "16px" }}>
          Log in to explore alumni
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "24px",
          }}
        >
          You need to be signed in to browse alumni profiles.
        </p>
        <button
          onClick={() => router.push("/login")}
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            padding: "14px 24px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}
        >
          Go to Login
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "var(--container-width)",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 64px)",
            marginBottom: "16px",
          }}
        >
          Explore Alumni
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Find mentors by company and role.
        </p>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div>
          <label style={labelStyle}>Company</label>
          <input
            placeholder="Google, Amazon..."
            value={companyFilter}
            onChange={(e) =>
              setCompanyFilter(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Role</label>
          <input
            placeholder="Software Engineer..."
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <p style={{ color: "var(--text-secondary)" }}>
          {filteredAlumni.length} alumni found
        </p>
        <button
          onClick={() => {
            setCompanyFilter("");
            setRoleFilter("");
          }}
          style={{
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-secondary)" }}>
          Loading alumni...
        </div>
      ) : error ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      ) : filteredAlumni.length === 0 ? (
        <EmptyState
          title="No alumni found"
          description="Try a different company or role."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredAlumni.map((alumniPerson) => (
            <AlumniCard
              key={alumniPerson.id}
              id={alumniPerson.id}
              name={alumniPerson.full_name || "Alumnus"}
              profileImage="/default-avatar.png"
              company={alumniPerson.company || "Independent"}
              role={alumniPerson.designation || "Alumni"}
            />
          ))}
        </div>
      )}
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  background: "var(--background)",
  color: "var(--text-primary)",
  outline: "none",
  fontSize: "15px",
  appearance: "none" as const,
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "var(--text-secondary)",
  fontSize: "14px",
};
