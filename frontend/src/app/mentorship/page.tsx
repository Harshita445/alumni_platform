"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Compass, Sparkles } from "lucide-react";

import AccessGateCard from "@/components/AccessGateCard";
import { useAuth } from "@/hooks/useAuth";

export default function MentorshipPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <AccessGateCard
        icon={Sparkles}
        title="Unlock your mentorship journey"
        description="Discover alumni, request guidance, and keep every conversation organised in one place."
        bullets={[
          "Browse experienced mentors",
          "Book 1:1 sessions with confidence",
          "Track requests and upcoming meetings",
        ]}
        buttonLabel="Go to Login"
        href="/login"
      />
    );
  }

  const isStudent = user.role === "student";

  const actionCards = isStudent
    ? [
        {
          title: "Explore mentors",
          description: "Browse alumni by industry, role, and company to find the right match.",
          href: "/search",
          icon: Compass,
        },
        {
          title: "Book a session",
          description: "Reserve time for resume reviews, mock interviews, or career guidance.",
          href: "/bookings",
          icon: CalendarDays,
        },
        {
          title: "Track activity",
          description: "See upcoming sessions, completed conversations, and your recent requests.",
          href: "/dashboard",
          icon: BookOpen,
        },
      ]
    : [
        {
          title: "Manage services",
          description: "Shape your mentorship offerings and pricing for students who reach out.",
          href: "/profile",
          icon: Sparkles,
        },
        {
          title: "Review requests",
          description: "Accept, reject, or progress incoming mentorship requests from students.",
          href: "/bookings",
          icon: CalendarDays,
        },
        {
          title: "Keep your calendar current",
          description: "Share availability and stay on top of the sessions you have committed to.",
          href: "/profile",
          icon: BookOpen,
        },
      ];

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <section
        style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "1.15fr 0.85fr",
          alignItems: "stretch",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #fbf5eb 0%, #f4e2cd 100%)",
            border: "1px solid #ebd5bf",
            borderRadius: "28px",
            padding: "36px",
            boxShadow: "0 20px 50px rgba(47, 33, 26, 0.06)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(122, 75, 46, 0.12)",
              color: "#7A4B2E",
              fontWeight: 700,
              marginBottom: "18px",
            }}
          >
            <Sparkles size={16} />
            Mentorship Studio
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: 1.08,
              marginBottom: "14px",
              color: "#2E1B12",
            }}
          >
            {isStudent
              ? "Find the right mentor and book your next breakthrough"
              : "Guide students with a premium mentorship experience"}
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "17px",
              lineHeight: 1.75,
              marginBottom: "22px",
              maxWidth: "680px",
            }}
          >
            {isStudent
              ? "Move from discovery to a confirmed session in a few clicks. Explore alumni, request time, and stay organised as your mentoring journey unfolds."
              : "Share your expertise, manage incoming requests, and keep every student conversation polished and professional."}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href={isStudent ? "/search" : "/profile"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--primary)",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              {isStudent ? "Find a mentor" : "Manage mentorship"}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/bookings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.75)",
                color: "#4D3A2F",
                padding: "12px 18px",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 600,
                border: "1px solid rgba(122, 75, 46, 0.14)",
              }}
            >
              View bookings
            </Link>
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ marginBottom: "12px" }}>Why this hub exists</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "18px" }}>
            Mentorship should feel calm, high-trust, and easy to act on. This space brings the key actions together so the next step is always obvious.
          </p>
          <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "10px", color: "var(--text-secondary)" }}>
            <li>Discover alumni who match your goals.</li>
            <li>Send a clear request with context and intent.</li>
            <li>Keep sessions and follow-ups organised in one flow.</li>
          </ul>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: "18px",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {actionCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              style={{
                textDecoration: "none",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(122, 75, 46, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7A4B2E",
                }}
              >
                <Icon size={20} />
              </div>
              <h3 style={{ margin: 0 }}>{card.title}</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {card.description}
              </p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
