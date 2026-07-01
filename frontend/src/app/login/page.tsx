"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { googleAuth, loginUser } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { promptGoogleSignIn } from "@/lib/googleAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

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

  const handleGoogleSubmit = async (role: "student" | "alumni") => {
    setError(null);

    try {
      await promptGoogleSignIn(role, async (credential) => {
        const storedUser = await googleAuth({
          role,
          email: "",
          id_token: credential,
        });
        login(storedUser);
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

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = await loginUser(email, password);
      login(storedUser);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={container}>
      <h1 style={title}>Welcome back</h1>

      <div style={form}>
        <input
          type="email"
          placeholder="College email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <div style={{ display: "grid", gap: "12px" }}>
          <button
            type="button"
            onClick={() => handleGoogleSubmit("student")}
            disabled={!isGoogleReady}
            style={{
              ...buttonStyle,
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              opacity: isGoogleReady ? 1 : 0.7,
            }}
          >
            Continue with Google as Student
          </button>

          <button
            type="button"
            onClick={() => handleGoogleSubmit("alumni")}
            disabled={!isGoogleReady}
            style={{
              ...buttonStyle,
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              opacity: isGoogleReady ? 1 : 0.7,
            }}
          >
            Continue with Google as Alumni
          </button>
        </div>

        <a href="/register" style={linkStyle}>
          Create account
        </a>
      </div>
    </main>
  );
}

const container = {
  maxWidth: "480px",
  margin: "80px auto",
  padding: "32px",
};

const title = {
  marginBottom: "24px",
};

const form = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "16px",
};

const inputStyle = {
  padding: "14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
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

const linkStyle = {
  color: "var(--primary)",
  textAlign: "center" as const,
};