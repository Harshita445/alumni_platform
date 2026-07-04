"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import {
  Alumni,
  AvailabilitySlot,
  Review,
  fetchAlumniDetails,
  fetchAlumniReviews,
  fetchAvailability,
  fetchMentorshipServices,
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
  const [services, setServices] = useState<{ service_type: string; price: number | null }[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
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
          const serviceResult = await fetchMentorshipServices(params.id, user?.access_token);
          if (active) {
            setServices(serviceResult.filter((item) => item.is_enabled).map((item) => ({ service_type: item.service_type, price: item.price ? Number(item.price) : null })));
            setSelectedService(serviceResult.find((item) => item.is_enabled)?.service_type || "");
          }

          const availabilityResult = await fetchAvailability(params.id, user?.access_token);
          if (active) {
            const upcoming = availabilityResult.filter((slot) => slot.day_of_week !== null && slot.day_of_week !== undefined);
            setAvailability(upcoming);
            if (upcoming.length > 0) {
              setSelectedTime(upcoming[0].start_time);
            }
          }

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

  const handleBookingRequest = async () => {
    if (!user || !alumni) {
      setError("Please log in to request a mentorship session.");
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      setError("Choose a session type, date, and time to continue.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          alumni_id: alumni.id,
          session_type: selectedService,
          date: selectedDate,
          time: selectedTime,
          message,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Unable to request this session.");
      }

      setSuccess("Your session request has been submitted and is awaiting mentor approval.");
      setMessage("");
      setSelectedDate("");
      setSelectedTime("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to request this session.");
    } finally {
      setSubmitting(false);
    }
  };

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
        </div>
      </div>

      <section style={{ ...cardStyle, marginTop: "24px" }}>
        <h2 style={{ marginBottom: "16px" }}>Mentorship Services</h2>
        {services.length > 0 ? (
          <div style={{ display: "grid", gap: "12px" }}>
            {services.map((service) => (
              <div key={service.service_type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }}>
                <span>{service.service_type}</span>
                <strong>{service.price ? `₹${service.price}` : "Free"}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>No mentorship services have been configured yet.</p>
        )}
      </section>

      <section style={{ ...cardStyle, marginTop: "24px" }}>
        <h2 style={{ marginBottom: "16px" }}>Availability Calendar</h2>
        {availability.length > 0 ? (
          <div style={{ display: "grid", gap: "12px" }}>
            {availability.map((slot) => (
              <div key={slot.id} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }}>
                <strong>{slot.day_of_week !== null && slot.day_of_week !== undefined ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][slot.day_of_week] : "Date"}</strong>
                <div style={{ color: "var(--text-secondary)", marginTop: "6px" }}>{slot.start_time} - {slot.end_time}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>This mentor has not shared availability yet.</p>
        )}
      </section>

      <section style={{ ...cardStyle, marginTop: "24px" }}>
        <h2 style={{ marginBottom: "16px" }}>Request a Session</h2>
        {user?.role === "student" ? (
          <div style={{ display: "grid", gap: "16px" }}>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={metaLabelStyle}>Session Type</span>
              <select value={selectedService} onChange={(event) => setSelectedService(event.target.value)} style={inputStyle}>
                {services.length > 0 ? services.map((service) => <option key={service.service_type} value={service.service_type}>{service.service_type}</option>) : <option value="">No services available</option>}
              </select>
            </label>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={metaLabelStyle}>Select a Date</span>
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={metaLabelStyle}>Selected Time</span>
              <input type="time" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={metaLabelStyle}>What would you like help with?</span>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share a little about your goals..." style={{ ...inputStyle, minHeight: "96px" }} />
            </label>
            {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
            {success ? <p style={{ color: "var(--success)" }}>{success}</p> : null}
            <button onClick={handleBookingRequest} disabled={submitting} style={{ ...primaryLinkStyle, width: "100%", cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "Submitting..." : "Request Session"}
            </button>
          </div>
        ) : !user ? (
          <Link href="/login" style={primaryLinkStyle}>Log in to request a session</Link>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>Only students can request mentorship sessions.</p>
        )}
      </section>

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

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  background: "var(--background)",
  color: "var(--text-primary)",
  fontSize: "15px",
  outline: "none",
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
