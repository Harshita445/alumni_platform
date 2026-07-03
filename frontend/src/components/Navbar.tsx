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
        background: "rgba(247, 241, 235, 0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <nav
        style={{
          width: "100%",
          maxWidth: "1440px",
          margin: "0 auto",
          minHeight: "100px",
          padding: "12px 52px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "36px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
            flex: "0 0 auto",
          }}
        >
          <img
            src="/logo.svg"
            alt="Alumly logo"
            style={{ height: 68, width: "auto" }}
          />
        </Link>

        <div
          style={{
            display: "flex",
            gap: "38px",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
            flex: "1 1 auto",
            fontSize: "16px",
          }}
        >
          <Link href="/search">Explore</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/bookings">Bookings</Link>
          <Link href="/profile">Profile</Link>
          {user ? <Link href="/admin">Admin</Link> : null}
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            flex: "0 0 auto",
            fontSize: "16px",
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
              <Link
                href="/register"
                style={{
                  minWidth: "108px",
                  padding: "12px 22px",
                  borderRadius: "10px",
                  background: "var(--primary)",
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
