"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAdmissionYear,
  getGraduationYear,
  isValidStudentEmail,
} from "@/lib/studentEmail";

export default function StudentRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [admissionYear, setAdmissionYear] =
    useState<number | null>(null);

  const [graduationYear, setGraduationYear] =
    useState("");

  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isValidStudentEmail(email)) {
      setAdmissionYear(null);
      setGraduationYear("");
      return;
    }

    const year = getAdmissionYear(email);

    if (!year) return;

    setAdmissionYear(year);

    setGraduationYear(
      String(getGraduationYear(year))
    );
  }, [email]);

  const handleSubmit = () => {
    if (!isValidStudentEmail(email)) {
      alert("Enter a valid Thapar email.");
      return;
    }

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      role: "student",
      admissionYear,
      graduationYear,
      profileImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    };

    localStorage.setItem(
      "current-user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "student-profile",
      JSON.stringify({
        graduationYear,
      })
    );

    router.push("/onboarding");
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
          value={admissionYear ?? ""}
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

        <button
          onClick={handleSubmit}
          style={buttonStyle}
        >
          Continue
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