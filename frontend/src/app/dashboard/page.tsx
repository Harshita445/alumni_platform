"use client";

import { useEffect, useState } from "react";

import { mockBookings } from "@/data/mockBookings";
import { mockAlumni } from "@/data/mockAlumni";

import { getRecommendations } from "@/lib/recommendations";

import AlumniCard from "@/components/AlumniCard";

export default function DashboardPage() {
  const [recommendations, setRecommendations] =
    useState<typeof mockAlumni>([]);

  useEffect(() => {
    const profile = JSON.parse(
      localStorage.getItem("student-profile") || "{}"
    );

    const recommendedAlumni = getRecommendations(
      profile.targetCompanies || []
    );

    setRecommendations(recommendedAlumni);
  }, []);

  const upcomingSessions = mockBookings.filter(
    (booking) => booking.status === "upcoming"
  );

  const completedSessions = mockBookings.filter(
    (booking) => booking.status === "completed"
  );

  return (
    <main
      style={{
        maxWidth: "var(--container-width)",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <div
        style={{
          marginBottom: "48px",
        }}
      >
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
          Manage your upcoming mentorship sessions,
          track your progress, and continue building
          meaningful alumni connections.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "56px",
        }}
      >
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
            Upcoming Sessions
          </p>

          <h2
            style={{
              fontSize: "40px",
            }}
          >
            {upcomingSessions.length}
          </h2>
        </div>

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
            Completed Sessions
          </p>

          <h2
            style={{
              fontSize: "40px",
            }}
          >
            {completedSessions.length}
          </h2>
        </div>

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
            Alumni Network
          </p>

          <h2
            style={{
              fontSize: "40px",
            }}
          >
            {mockAlumni.length}
          </h2>
        </div>
      </section>

      <section
        style={{
          marginBottom: "56px",
        }}
      >
        <h2
          style={{
            marginBottom: "24px",
          }}
        >
          Recommended Mentors
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {recommendations.length > 0 ? (
            recommendations.map((alumni) => (
              <AlumniCard
                key={alumni.id}
                id={alumni.id}
                name={alumni.name}
                profileImage={alumni.profileImage}
                company={alumni.company}
                role={alumni.role}
              />
            ))
          ) : (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                color: "var(--text-secondary)",
              }}
            >
              Add your target companies in onboarding to
              receive personalized mentor recommendations.
            </div>
          )}
        </div>
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
          <h2>Upcoming Sessions</h2>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {upcomingSessions.map((booking) => {
            const alumni = mockAlumni.find(
              (person) => person.id === booking.alumniId
            );

            return (
              <div
                key={booking.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "28px",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "24px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "var(--accent)",
                      marginBottom: "10px",
                    }}
                  >
                    {booking.sessionType}
                  </p>

                  <h3
                    style={{
                      marginBottom: "8px",
                    }}
                  >
                    {alumni?.name}
                  </h3>

                  <p
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {alumni?.role} · {alumni?.company}
                  </p>
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "8px",
                    }}
                  >
                    {booking.date}
                  </p>

                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "12px",
                    }}
                  >
                    {booking.time}
                  </p>

                  <span
                    style={{
                      display: "inline-block",
                      background:
                        "var(--surface-secondary)",
                      color: "var(--text-primary)",
                      padding: "8px 14px",
                      borderRadius: "999px",
                      fontSize: "14px",
                    }}
                  >
                    Upcoming
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}