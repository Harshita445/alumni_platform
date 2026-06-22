"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Badge from "@/components/Badge";
import { useAuth } from "@/hooks/useAuth";
import { BookingStatus, fetchDashboard } from "@/lib/api";

type RecentBooking = {
  id: number;
  name: string;
  date: string;
  time: string;
  status: BookingStatus;
};

type DashboardData = {
  pending_requests: number;
  upcoming_sessions: number;
  completed_sessions: number;
  saved_alumni?: number;
  total_students_helped?: number;
  recent_bookings: RecentBooking[];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchDashboard(
          user.access_token,
          user.role
        );

        if (active) {
          setDashboard(result);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return (
      <main
        style={{
          maxWidth: "600px",
          margin: "80px auto",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "16px" }}>
          Please log in to view your dashboard
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "24px",
          }}
        >
          Your personalized session summary is available after login.
        </p>
        <button
          onClick={() => router.push("/login")}
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            padding: "14px 24px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}
        >
          Go to Login
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "var(--container-width)",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <div style={{ marginBottom: "48px" }}>
        <p
          style={{
            color: "var(--accent)",
            marginBottom: "12px",
            fontWeight: 500,
          }}
        >
          Welcome back
        </p>
        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 64px)",
            marginBottom: "16px",
          }}
        >
          Your Dashboard
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: "600px",
            lineHeight: 1.7,
          }}
        >
          Manage your mentorship sessions, requests, and alumni connections.
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-secondary)" }}>
          Loading dashboard...
        </div>
      ) : error ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      ) : dashboard ? (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "56px",
            }}
          >
            <StatCard
              label="Pending Requests"
              value={dashboard.pending_requests}
            />
            <StatCard
              label="Upcoming Sessions"
              value={dashboard.upcoming_sessions}
            />
            <StatCard
              label="Completed Sessions"
              value={dashboard.completed_sessions}
            />
            {user.role === "student" ? (
              <StatCard
                label="Saved Alumni"
                value={dashboard.saved_alumni ?? 0}
              />
            ) : (
              <StatCard
                label="Students Helped"
                value={dashboard.total_students_helped ?? 0}
              />
            )}
          </section>

          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2>Recent Bookings</h2>
              <button
                onClick={() => router.push("/bookings")}
                style={{
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                Manage Bookings
              </button>
            </div>

            {dashboard.recent_bookings.length === 0 ? (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
                  color: "var(--text-secondary)",
                }}
              >
                No recent bookings yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "20px",
                }}
              >
                {dashboard.recent_bookings.map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      padding: "24px",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <h3>{booking.name}</h3>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                          }}
                        >
                          {booking.date} · {booking.time}
                        </p>
                      </div>
                      <Badge
                        text={booking.status}
                        tone={booking.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "28px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: "12px",
        }}
      >
        {label}
      </p>
      <h2 style={{ fontSize: "40px" }}>{value}</h2>
    </div>
  );
}
