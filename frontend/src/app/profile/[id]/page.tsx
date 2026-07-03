"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import {
  Alumni,
  Review,
  fetchAlumniDetails,
  fetchAlumniReviews,
} from "@/lib/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80";

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) {
      return;
    }

    let active = true;

    const loadAlumni = async () => {
      setError(null);

      try {
        const result = await fetchAlumniDetails(
          params.id,
          user?.access_token
        );

        if (active) {
          setAlumni(result);
        }

        if (active) {
          setReviewsLoading(true);
          setReviewsError(null);
        }

        try {
          const reviewResult = await fetchAlumniReviews(
            params.id,
            user?.access_token
          );

          if (active) {
            setReviews(reviewResult);
          }
        } catch (reviewErr: unknown) {
          if (active) {
            setReviewsError(
              reviewErr instanceof Error
                ? reviewErr.message
                : "Unable to load reviews."
            );
          }
        } finally {
          if (active) {
            setReviewsLoading(false);
          }
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this alumni profile."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAlumni();

    return () => {
      active = false;
    };
  }, [params.id, user]);

  if (loading) {
    return (
      <CenteredState
        title="Loading profile"
        message="Fetching the latest alumni details..."
      />
    );
  }

  if (error || !alumni) {
    return (
      <CenteredState
        title="Profile unavailable"
        message={error || "This alumni profile could not be found."}
      >
        <Link href="/search" style={primaryLinkStyle}>
          Back to Search
        </Link>
      </CenteredState>
    );
  }

  const displayName = alumni.full_name || "Alumnus";
  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / reviews.length
      : null;

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <Image
          src={alumni.profile_image || FALLBACK_IMAGE}
          alt={displayName}
          width={120}
          height={120}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "24px",
          }}
        />

        <h1 style={{ marginBottom: "12px" }}>
          {displayName}
        </h1>

        <p
          style={{
            color: "var(--accent)",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          {averageRating
            ? `${averageRating.toFixed(1)} / 5 from ${reviews.length} review${
                reviews.length === 1 ? "" : "s"
              }`
            : "No reviews yet"}
        </p>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "8px",
          }}
        >
          {alumni.designation || "Alumni"} -{" "}
          {alumni.company || "Independent"}
        </p>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "32px",
          }}
        >
          Class of {alumni.graduation_year || "N/A"}
        </p>

        <p
          style={{
            lineHeight: 1.8,
            marginBottom: "32px",
          }}
        >
          {alumni.bio || "No bio provided."}
        </p>

        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div>
            <p style={metaLabelStyle}>Branch</p>
            <strong>{alumni.branch || "Not specified"}</strong>
          </div>

          <div>
            <p style={metaLabelStyle}>LinkedIn</p>
            {alumni.linkedin_url ? (
              <a
                href={alumni.linkedin_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--primary)" }}
              >
                View profile
              </a>
            ) : (
              <span>Not specified</span>
            )}
          </div>

          {user?.role === "student" ? (
            <Link
              href={`/bookings?alumni_id=${alumni.id}`}
              style={primaryLinkStyle}
            >
              Book Session
            </Link>
          ) : !user ? (
            <Link href="/login" style={primaryLinkStyle}>
              Log in or sign up to book a session
            </Link>
          ) : null}
        </div>
      </div>

      <section
        style={{
          ...cardStyle,
          marginTop: "24px",
        }}
      >
        <h2 style={{ marginBottom: "16px" }}>Reviews</h2>

        {reviewsLoading ? (
          <p style={{ color: "var(--text-secondary)" }}>
            Loading reviews...
          </p>
        ) : reviewsError ? (
          <p style={{ color: "var(--danger)" }}>
            {reviewsError}
          </p>
        ) : reviews.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>
            No student reviews have been submitted yet.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {reviews.map((review) => (
              <article
                key={review.id}
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "8px",
                  }}
                >
                  <strong>{review.rating} / 5</strong>
                  <span style={{ color: "var(--text-secondary)" }}>
                    Student #{review.student_id}
                  </span>
                </div>

                {review.comment ? (
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                    }}
                  >
                    {review.comment}
                  </p>
                ) : (
                  <p style={{ color: "var(--text-secondary)" }}>
                    No comment provided.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CenteredState({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "80px auto",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "16px" }}>{title}</h1>
      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: children ? "24px" : 0,
        }}
      >
        {message}
      </p>
      {children}
    </main>
  );
}

const mainStyle = {
  maxWidth: "800px",
  margin: "0 auto",
  padding: "48px 24px 80px",
};

const cardStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  padding: "40px",
  boxShadow: "var(--shadow-sm)",
};

const metaLabelStyle = {
  color: "var(--text-secondary)",
  marginBottom: "4px",
};

const primaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--primary)",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: "var(--radius-md)",
  textDecoration: "none",
  minHeight: "44px",
  fontWeight: 500,
};
