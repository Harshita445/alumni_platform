import Link from "next/link";

export default function Navbar() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,

        zIndex: 100,

        background: "rgba(245, 238, 229, 0.9)",

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
          }}
        >
          <Link href="/search">Explore</Link>

          <Link href="/dashboard">Dashboard</Link>

          <Link href="/bookings">Bookings</Link>

          <Link href="/profile/1">Profile</Link>
        </div>
      </nav>
    </header>
  );
}