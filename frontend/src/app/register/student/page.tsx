"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAdmissionYear,
  getGraduationYear,
  isThaparStudentEmail,
} from "@/lib/auth";
import { registerUser } from "@/lib/api";

export default function StudentRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [graduationYear, setGraduationYear] =
    useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const admissionYear = getAdmissionYear(email);

  useEffect(() => {
    if (!isThaparStudentEmail(email)) {
      setGraduationYear("");
      return;
    }

    const year = getAdmissionYear(email);

    if (!year) {
      return;
    }

    setGraduationYear(String(getGraduationYear(year)));
  }, [email]);

  const handleSubmit = async () => {
    setError(null);

    if (!isThaparStudentEmail(email)) {
      setError("Enter a valid Thapar student email.");
      return;
    }

    if (!name || !password) {
      setError("Name and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        email,
        password,
        role: "student",
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
        Student Registration
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
          placeholder="xyz_be24@thapar.edu"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
        />

        <input
          placeholder="Admission year"
          value={admissionYear ? String(admissionYear) : ""}
          readOnly
          style={inputStyle}
        />

        <input
          value={graduationYear}
          onChange={(e) =>
            setGraduationYear(e.target.value)
          }
          placeholder="Graduation year"
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

        {error ? <p style={errorStyle}>{error}</p> : null}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            ...buttonStyle,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "Registering..." : "Continue"}
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