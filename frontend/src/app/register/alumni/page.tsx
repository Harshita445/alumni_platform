"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uniqueCompanies } from "@/data/companies";
import {
  registerUser,
  saveStoredUser,
  updateProfile,
} from "@/lib/api";

export default function AlumniRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [graduationYear, setGraduationYear] =
    useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!name || !email || !password) {
      setError("Name, email, and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = await registerUser({
        email,
        password,
        role: "alumni",
      });

      const profile = await updateProfile(
        storedUser.access_token,
        {
          full_name: name,
          graduation_year: graduationYear
            ? Number(graduationYear)
            : undefined,
          company,
          designation,
          linkedin_url: linkedIn,
          bio,
        }
      );

      saveStoredUser({
        ...storedUser,
        profile,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
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

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
        />

        <input
          placeholder="Graduation year"
          value={graduationYear}
          onChange={(e) =>
            setGraduationYear(e.target.value)
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
          placeholder="Designation"
          value={designation}
          onChange={(e) =>
            setDesignation(e.target.value)
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

        {error ? <p style={errorStyle}>{error}</p> : null}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            ...buttonStyle,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
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

const errorStyle = {
  color: "var(--danger)",
  margin: 0,
};
