"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { uniqueCompanies } from "@/data/companies";

export default function AlumniRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [graduationYear, setGraduationYear] =
    useState("");

  const [company, setCompany] = useState("");

  const [role, setRole] = useState("");

  const [linkedIn, setLinkedIn] = useState("");

  const [bio, setBio] = useState("");

  const verified = email.endsWith(
    "@thapar.edu"
  );

  const handleSubmit = () => {
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      role: "alumni",
      profileImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    };

    localStorage.setItem(
      "current-user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "alumni-profile",
      JSON.stringify({
        graduationYear,
        company,
        role,
        linkedIn,
        bio,
        verificationStatus: verified
          ? "verified"
          : "pending",
      })
    );

    router.push("/profile");
  };

  return (
    <main style={container}>
      <h1 style={title}>
        Alumni Registration
      </h1>

      <div style={form}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
        />

        {!verified && (
          <>
            <input
              placeholder="Graduation year"
              value={graduationYear}
              onChange={(e) =>
                setGraduationYear(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <select
              value={company}
              onChange={(e) =>
                setCompany(e.target.value)
              }
              style={inputStyle}
            >
              <option value="">
                Select company
              </option>

              {uniqueCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              placeholder="Role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              style={inputStyle}
            />

            <input
              placeholder="LinkedIn URL"
              value={linkedIn}
              onChange={(e) =>
                setLinkedIn(e.target.value)
              }
              style={inputStyle}
            />

            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              style={{
                ...inputStyle,
                minHeight: "120px",
              }}
            />
          </>
        )}

        <button
          onClick={handleSubmit}
          style={buttonStyle}
        >
          Create Account
        </button>
      </div>
    </main>
  );
}

const container = {
  maxWidth: "600px",
  margin: "80px auto",
  padding: "24px",
};

const title = {
  marginBottom: "32px",
};

const form = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "16px",
};

const inputStyle = {
  padding: "14px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  background: "var(--surface)",
};

const buttonStyle = {
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  padding: "16px",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
};