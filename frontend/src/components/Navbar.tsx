"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const isDemoUser = Boolean(
    user?.is_demo || user?.email?.endsWith("@alumly.local") || user?.email?.endsWith("@alumly.demo")
  );

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
        className="site-nav"
        style={{
          width: "100%",
          maxWidth: "1440px",
          margin: "0 auto",
          minHeight: "100px",
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
            src="/logo.png"
            alt="Alumly logo"
              style={{
                height: 52,
                width: "auto",
                objectFit: "contain",
                marginRight: 14,
              }}
            fontSize: "19px",
          }}
        >
          <Link href="/search">Explore Alumni</Link>
          <Link href="/community">Community</Link>
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/bookings">Bookings</Link>
              <Link href="/profile">Profile</Link>
              {user.role === "student" ? <Link href="/saved">Saved</Link> : null}
            </>
          ) : null}
        </div>

        <div
          className="site-nav-actions"
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            flex: "0 0 auto",
            fontSize: "17px",
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
              {isDemoUser ? (
                <span
                  title="You are exploring a demonstration account. Changes made in Demo Mode may be reset and some actions are intentionally disabled."
                  style={{
                    border: "1px solid rgba(106, 68, 48, 0.22)",
                    borderRadius: "999px",
                    background: "rgba(219, 197, 173, 0.62)",
                    color: "var(--primary)",
                    padding: "6px 10px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "help",
                  }}
                >
                  Demo Mode
                </span>
              ) : null}
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
                className="nav-register-link"
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
