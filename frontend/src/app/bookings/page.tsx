"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AccessGateCard from "@/components/AccessGateCard";
import BookingManagement from "@/components/BookingManagement";
import { useAuth } from "@/hooks/useAuth";
import { Alumni, createBooking, fetchAlumni } from "@/lib/api";
import { CalendarDays } from "lucide-react";

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "var(--text-secondary)",
  fontSize: "14px",
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

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "48px 24px 80px",
            color: "var(--text-secondary)",
          }}
        >
          Loading bookings...
        </main>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const requestedAlumniId = searchParams.get("alumni_id");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [alumniId, setAlumniId] = useState("");
  const [sessionType, setSessionType] =
    useState("Resume Review");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    const loadAlumni = async () => {
      try {
        const result = await fetchAlumni(user.access_token);
        if (!active) {
          return;
        }

        setAlumni(result);
        if (result.length > 0) {
          const requestedAlumnus = result.find(
            (item) => String(item.id) === requestedAlumniId
          );

          setAlumniId(
            String(requestedAlumnus?.id || result[0].id)
          );
        }
      } catch (err: unknown) {
        if (!active) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load alumni."
        );
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
  }, [requestedAlumniId, user]);

  const handleConfirm = async () => {
    if (!alumniId || !date || !time) {
      setError("Please complete all booking fields.");
      return;
    }

    if (!user) {
      setError("Please log in to book a session.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const booking = await createBooking(user.access_token, {
        alumni_id: Number(alumniId),
        session_type: sessionType,
        date,
        time,
        message: message.trim() || undefined,
      });

      localStorage.setItem(
        "latest-booking",
        JSON.stringify(booking)
      );
      router.push("/bookings/confirmation");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <AccessGateCard
        icon={CalendarDays}
        title="Login to book mentorship sessions"
        description="Request mentorship sessions and connect with experienced alumni."
        bullets={[
          "Request mentorship sessions",
          "Connect with alumni",
          "Manage upcoming meetings",
        ]}
        buttonLabel="Go to Login"
        onClick={() => router.push("/login")}
      />
    );
  }

  return (
    <main
      style={{
        maxWidth:
          user.role === "student"
            ? "900px"
            : "var(--container-width)",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <div
        style={{
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            marginBottom: "12px",
          }}
        >
          {user.role === "student"
            ? "Book a Session"
            : "My Bookings"}
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          {user.role === "student"
            ? "Schedule time with an alumnus for guidance, networking, or interview preparation."
            : "Manage incoming session requests and update active bookings."}
        </p>
      </div>

      {user.role === "student" ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "32px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {loading ? (
            <p>Loading available alumni...</p>
          ) : null}

          <div>
            <label style={labelStyle}>
              Choose an Alumnus
            </label>

            <select
              value={alumniId}
              onChange={(e) =>
                setAlumniId(e.target.value)
              }
              style={inputStyle}
            >
              {alumni.map((alumnus) => (
                <option
                  key={alumnus.id}
                  value={alumnus.id}
                >
                  {alumnus.full_name || "Alumnus"} -{" "}
                  {alumnus.company || "Independent"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Session Type
            </label>

            <select
              value={sessionType}
              onChange={(e) =>
                setSessionType(e.target.value)
              }
              style={inputStyle}
            >
              <option>Resume Review</option>
              <option>Mock Interview</option>
              <option>Career Guidance</option>
              <option>Networking Chat</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Select Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Select Time
            </label>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Message for the mentor
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Share your goals or the session outcomes you want"
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                background: "var(--background)",
                color: "var(--text-primary)",
                padding: "14px 16px",
                resize: "vertical",
              }}
            />
          </div>

          {error ? (
            <p
              style={{
                color: "var(--danger)",
                margin: 0,
              }}
            >
              {error}
            </p>
          ) : null}

          <button
            disabled={
              !alumniId || !date || !time || isSubmitting
            }
            onClick={handleConfirm}
            style={{
              background:
                !alumniId || !date || !time || isSubmitting
                  ? "var(--border)"
                  : "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              cursor:
                !alumniId || !date || !time || isSubmitting
                  ? "not-allowed"
                  : "pointer",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {isSubmitting ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      ) : null}

      <BookingManagement user={user} />
    </main>
  );
}
