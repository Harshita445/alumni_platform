"use client";

import { useMemo, useState } from "react";

import AlumniCard from "@/components/AlumniCard";
import EmptyState from "@/components/EmptyState";
import { mockAlumni } from "@/data/mockAlumni";

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

export default function SearchPage() {
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");

  const filteredAlumni = useMemo(() => {
    return mockAlumni.filter((alumni) => {
      const matchesCompany = alumni.company
        .toLowerCase()
        .includes(companyFilter.toLowerCase());

      const matchesRole = alumni.role
        .toLowerCase()
        .includes(roleFilter.toLowerCase());

      const matchesSession =
        sessionFilter === "" ||
        alumni.sessionTypes.includes(sessionFilter);

      return (
        matchesCompany &&
        matchesRole &&
        matchesSession
      );
    });
  }, [companyFilter, roleFilter, sessionFilter]);

  const sessionTypes = [
    ...new Set(
      mockAlumni.flatMap(
        (alumni) => alumni.sessionTypes
      )
    ),
  ];

  return (
    <main
      style={{
        maxWidth: "var(--container-width)",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <div
        style={{
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 64px)",
            marginBottom: "16px",
          }}
        >
          Explore Alumni
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Find mentors by company, role, and session type.
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
          <label style={labelStyle}>
            Company
          </label>

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
          <label style={labelStyle}>
            Role
          </label>

          <input
            placeholder="Software Engineer..."
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Session Type
          </label>

          <select
            value={sessionFilter}
            onChange={(e) =>
              setSessionFilter(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              All session types
            </option>

            {sessionTypes.map((session) => (
              <option
                key={session}
                value={session}
              >
                {session}
              </option>
            ))}
          </select>
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
        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          {filteredAlumni.length} alumni found
        </p>

        <button
          onClick={() => {
            setCompanyFilter("");
            setRoleFilter("");
            setSessionFilter("");
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

      {filteredAlumni.length === 0 ? (
        <EmptyState
          title="No alumni found"
          description="Try changing your filters."
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
          {filteredAlumni.map((alumni) => (
            <AlumniCard
              key={alumni.id}
              id={alumni.id}
              name={alumni.name}
              profileImage={alumni.profileImage}
              company={alumni.company}
              role={alumni.role}
            />
          ))}
        </div>
      )}
    </main>
  );
}