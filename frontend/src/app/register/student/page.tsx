"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAdmissionYear,
  getGraduationYear,
  isThaparStudentEmail,
} from "@/lib/auth";
import {
  googleAuth,
  registerUser,
  saveStoredUser,
  updateProfile,
} from "@/lib/api";
import { promptGoogleSignIn } from "@/lib/googleAuth";

export default function StudentRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function prepareGoogle() {
      const ready = await import("@/lib/googleAuth").then((mod) => mod.loadGoogleAuthScript());
      if (!ignore) {
        setIsGoogleReady(ready);
      }
    }

    prepareGoogle();

    return () => {
      ignore = true;
    };
  }, []);

  const admissionYear = getAdmissionYear(email);
  const graduationYear =
    isThaparStudentEmail(email) && admissionYear
      ? String(getGraduationYear(admissionYear))
      : "";

  const handleGoogleSubmit = async () => {
    setError(null);

    try {
      await promptGoogleSignIn("student", async (credential) => {
        const storedUser = await googleAuth({
          role: "student",
          email: "",
          id_token: credential,
        });
        saveStoredUser(storedUser);
        router.push("/dashboard");
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed."
      );
    }
  };

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
      const registeredUser = await registerUser({
        email,
        password,
        role: "student",
      });

      const profile = await updateProfile(
        registeredUser.access_token,
        {
          full_name: name,
          graduation_year: Number(graduationYear),
        }
      );

      saveStoredUser({
        ...registeredUser,
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
          placeholder="Graduation year"
          readOnly
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

        <button
          type="button"
          onClick={handleGoogleSubmit}
          disabled={!isGoogleReady}
          style={{
            ...buttonStyle,
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            opacity: isGoogleReady ? 1 : 0.7,
          }}
        >
          Continue with Google
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
