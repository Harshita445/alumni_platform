"use client";

import { useCallback, useEffect, useState } from "react";

import Badge from "@/components/Badge";
import {
  Booking,
  BookingStatus,
  Review,
  StoredUser,
  fetchAlumniReviews,
  fetchMyBookings,
  submitReview,
  updateBookingStatus,
} from "@/lib/api";

type BookingManagementProps = {
  user: StoredUser;
};

const actionButtonStyle = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 500,
};

export default function BookingManagement({
  user,
}: BookingManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<number>>(
    () => new Set()
  );
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const syncReviewedBookings = useCallback(
    async (bookingList: Booking[]) => {
      if (user.role !== "student") {
        setReviewedBookingIds(new Set());
        return;
      }

      const completedBookings = bookingList.filter(
        (booking) => booking.status === "completed"
      );
      const alumniIds = Array.from(
        new Set(
          completedBookings.map((booking) => booking.alumni_id)
        )
      );

      if (alumniIds.length === 0) {
        setReviewedBookingIds(new Set());
        return;
      }

      const reviewGroups = await Promise.all(
        alumniIds.map((alumniId) =>
          fetchAlumniReviews(alumniId, user.access_token)
        )
      );
      const currentUserReviews = reviewGroups
        .flat()
        .filter(
          (review: Review) => review.student_id === user.id
        );

      setReviewedBookingIds(
        new Set(
          currentUserReviews.map((review) => review.booking_id)
        )
      );
    },
    [user.access_token, user.id, user.role]
  );

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchMyBookings(user.access_token);
      setBookings(result);
      await syncReviewedBookings(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }, [syncReviewedBookings, user.access_token]);

  useEffect(() => {
    let active = true;

    const loadInitialBookings = async () => {
      try {
        const result = await fetchMyBookings(user.access_token);

        if (active) {
          setBookings(result);
        }

        await syncReviewedBookings(result);
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load bookings."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitialBookings();

    return () => {
      active = false;
    };
  }, [syncReviewedBookings, user.access_token]);

  const handleStatusChange = async (
    bookingId: number,
    status: BookingStatus
  ) => {
    setUpdatingId(bookingId);
    setError(null);

    try {
      const updatedBooking = await updateBookingStatus(
        user.access_token,
        bookingId,
        status
      );

      setBookings((current) =>
        current.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReviewSubmit = async (
    bookingId: number,
    rating: number,
    comment: string
  ) => {
    setReviewingId(bookingId);
    setError(null);

    try {
      await submitReview(user.access_token, {
        booking_id: bookingId,
        rating,
        comment: comment.trim() || undefined,
      });

      setReviewedBookingIds((current) => {
        const next = new Set(current);
        next.add(bookingId);
        return next;
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit review."
      );
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <section style={{ marginTop: "56px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "8px" }}>My Bookings</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Review session requests and keep booking status up to date.
          </p>
        </div>

        <button
          onClick={loadBookings}
          disabled={loading}
          style={{
            ...actionButtonStyle,
            background: "var(--surface)",
            color: "var(--text-primary)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            color: "#7A3328",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ color: "var(--text-secondary)" }}>
          Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            color: "var(--text-secondary)",
          }}
        >
          No bookings yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              user={user}
              updating={updatingId === booking.id}
              reviewed={reviewedBookingIds.has(booking.id)}
              reviewing={reviewingId === booking.id}
              onStatusChange={handleStatusChange}
              onReviewSubmit={handleReviewSubmit}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BookingCard({
  booking,
  user,
  updating,
  reviewed,
  reviewing,
  onStatusChange,
  onReviewSubmit,
}: {
  booking: Booking;
  user: StoredUser;
  updating: boolean;
  reviewed: boolean;
  reviewing: boolean;
  onStatusChange: (
    bookingId: number,
    status: BookingStatus
  ) => Promise<void>;
  onReviewSubmit: (
    bookingId: number,
    rating: number,
    comment: string
  ) => Promise<void>;
}) {
  const isAlumni = user.role === "alumni";
  const canAcceptOrReject =
    isAlumni && booking.status === "pending";
  const canComplete =
    isAlumni && booking.status === "upcoming";
  const canCancel =
    user.role === "student" &&
    (booking.status === "pending" ||
      booking.status === "upcoming");
  const canReview =
    user.role === "student" &&
    booking.status === "completed" &&
    !reviewed;
  const counterpartLabel = isAlumni
    ? `Student #${booking.student_id}`
    : `Alumni #${booking.alumni_id}`;

  return (
    <article
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
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3 style={{ marginBottom: "8px" }}>
            {booking.session_type}
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            {counterpartLabel}
          </p>
        </div>

        <Badge text={booking.status} tone={booking.status} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          color: "var(--text-secondary)",
          marginBottom:
            canAcceptOrReject || canComplete || canCancel
              ? "20px"
              : 0,
        }}
      >
        <span>{booking.date}</span>
        <span>{booking.time}</span>
      </div>

      {canAcceptOrReject || canComplete || canCancel ? (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {canAcceptOrReject ? (
            <>
              <BookingActionButton
                disabled={updating}
                label={updating ? "Updating..." : "Accept"}
                onClick={() =>
                  onStatusChange(booking.id, "upcoming")
                }
                variant="primary"
              />
              <BookingActionButton
                disabled={updating}
                label={updating ? "Updating..." : "Reject"}
                onClick={() =>
                  onStatusChange(booking.id, "rejected")
                }
              />
            </>
          ) : null}

          {canComplete ? (
            <BookingActionButton
              disabled={updating}
              label={
                updating ? "Updating..." : "Mark as Completed"
              }
              onClick={() =>
                onStatusChange(booking.id, "completed")
              }
              variant="primary"
            />
          ) : null}

          {canCancel ? (
            <BookingActionButton
              disabled={updating}
              label={updating ? "Updating..." : "Cancel"}
              onClick={() =>
                onStatusChange(booking.id, "cancelled")
              }
            />
          ) : null}
        </div>
      ) : null}

      {user.role === "student" &&
      booking.status === "completed" ? (
        reviewed ? (
          <p
            style={{
              color: "var(--success)",
              marginTop: "20px",
              fontWeight: 500,
            }}
          >
            Review submitted
          </p>
        ) : canReview ? (
          <ReviewForm
            bookingId={booking.id}
            submitting={reviewing}
            onSubmit={onReviewSubmit}
          />
        ) : null
      ) : null}
    </article>
  );
}

function ReviewForm({
  bookingId,
  submitting,
  onSubmit,
}: {
  bookingId: number;
  submitting: boolean;
  onSubmit: (
    bookingId: number,
    rating: number,
    comment: string
  ) => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        marginTop: "20px",
        paddingTop: "20px",
      }}
    >
      <h4 style={{ marginBottom: "12px" }}>Leave a Review</h4>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "14px",
        }}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            disabled={submitting}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background:
                rating === value
                  ? "var(--primary)"
                  : "var(--surface-secondary)",
              color:
                rating === value
                  ? "#fff"
                  : "var(--text-primary)",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {value}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        disabled={submitting}
        placeholder="Optional comment"
        rows={3}
        style={{
          width: "100%",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "var(--background)",
          color: "var(--text-primary)",
          padding: "12px 14px",
          resize: "vertical",
          marginBottom: "14px",
        }}
      />

      <BookingActionButton
        disabled={submitting}
        label={submitting ? "Submitting..." : "Submit Review"}
        onClick={() => onSubmit(bookingId, rating, comment)}
        variant="primary"
      />
    </div>
  );
}

function BookingActionButton({
  disabled,
  label,
  onClick,
  variant = "secondary",
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        ...actionButtonStyle,
        background:
          variant === "primary"
            ? "var(--primary)"
            : "var(--surface-secondary)",
        color:
          variant === "primary" ? "#fff" : "var(--text-primary)",
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}
