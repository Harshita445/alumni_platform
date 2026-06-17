"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(245, 238, 229, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <nav
        style={{
          maxWidth: "var(--container-width)",
          margin: "0 auto",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Alumly
        </Link>

        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link href="/search">Explore</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/bookings">Bookings</Link>
          <Link href="/profile">Profile</Link>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {user ? (
            <>
              <span
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                {user.profile?.full_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
