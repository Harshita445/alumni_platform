"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { createPayment, fetchMentorshipServices, fetchMyBookings } from "@/lib/api";
import { PLATFORM_FEE_PERCENT } from "@/config/platform";
import type { Booking } from "@/types/Booking";

export default function PaymentPage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [servicePrice, setServicePrice] = useState<number | null>(null);
  const [payment, setPayment] = useState<{ id?: number; gross_amount?: string | number; status?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!user?.access_token || !params.bookingId) {
      return;
    }

    let active = true;

    const loadBooking = async () => {
      const result = await fetchMyBookings(user.access_token);
      const nextBooking = result.find((item) => String(item.id) === params.bookingId);

      if (!active || !nextBooking) {
        return;
      }

      setBooking(nextBooking);

      try {
        const services = await fetchMentorshipServices(nextBooking.alumni_id, user.access_token);
        const match = services.find((service) => service.service_type === nextBooking.session_type);
        if (match?.price !== null && match?.price !== undefined) {
          setServicePrice(Number(match.price));
        }
      } catch {
        // fall back to default pricing if service lookup fails
      }
    };

    loadBooking();

    return () => {
      active = false;
    };
  }, [params.bookingId, user?.access_token]);

  const handleProceedToPayment = async () => {
    if (!user?.access_token || !booking?.id) {
      setFeedback({ type: "error", message: "Please sign in again to continue." });
      return;
    }

    if (!["approved", "awaiting_payment"].includes(booking.status)) {
      setFeedback({
        type: "error",
        message: "This booking is not ready for payment.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const paymentResult = await createPayment(user.access_token, booking.id);

      if (!paymentResult?.id) {
        throw new Error("Payment initialization failed.");
      }

      setPayment(paymentResult);

      const paymentConfirmationResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/payments/${paymentResult.id}/mark-paid`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!paymentConfirmationResponse.ok) {
        const errorBody = await paymentConfirmationResponse.json().catch(() => null);
        throw new Error(errorBody?.detail || "Payment confirmation failed.");
      }

      const confirmedPayment = await paymentConfirmationResponse.json();

      window.localStorage.setItem(
        "latest-payment",
        JSON.stringify({
          bookingId: booking.id,
          paymentId: confirmedPayment.id,
          message: confirmedPayment.id
            ? `Payment completed successfully. Reference #${confirmedPayment.id}.`
            : "Payment completed successfully.",
        })
      );
      router.push("/payment/confirmation");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "We could not start the payment flow right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) {
    return <div style={{ padding: "48px 24px" }}>Loading payment details...</div>;
  }

  const price = Number(payment?.gross_amount ?? servicePrice ?? 299) || 299;
  const platformFee = (price * PLATFORM_FEE_PERCENT) / 100;
  const total = price + platformFee;

  const bookingReadyForPayment = ["approved", "awaiting_payment"].includes(booking.status);

  return (
    <main style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "28px", padding: "32px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div>
            <p style={{ color: "var(--accent)", fontWeight: 700, marginBottom: "8px" }}>Secure checkout</p>
            <h1 style={{ marginBottom: "8px" }}>Complete your payment</h1>
            <p style={{ color: "var(--text-secondary)" }}>Payments are securely processed by Razorpay.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "8px", padding: "16px", borderRadius: "18px", background: "rgba(232, 240, 254, 0.9)", border: "1px solid rgba(90, 120, 234, 0.24)", color: "var(--text-primary)" }}>
              <strong style={{ display: "block", marginBottom: "8px" }}>Booking status:</strong>
              <p style={{ margin: 0, color: bookingReadyForPayment ? "var(--success)" : "var(--danger)", fontWeight: 700 }}>
                {booking.status === "approved" && "Approved — ready for payment"}
                {booking.status === "awaiting_payment" && "Awaiting payment — please complete checkout."}
                {booking.status === "paid" && "Paid — waiting for mentor confirmation."}
                {booking.status === "confirmed" && "Confirmed — session is scheduled."}
                {booking.status === "completed" && "Completed — session has finished."}
                {booking.status === "pending" && "Pending — awaiting mentor approval."}
                {booking.status === "cancelled" && "Cancelled — this booking cannot be paid."}
                {booking.status === "rejected" && "Rejected — this booking cannot be paid."}
              </p>
            </div>
          </div>

          <div style={{ padding: "10px 14px", borderRadius: "999px", background: "rgba(108, 122, 83, 0.16)", color: "var(--success)", fontWeight: 700 }}>Secure Payment</div>
        </div>

        <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
          <SummaryRow label="Mentor" value={booking.alumni_id ? `Alumni #${booking.alumni_id}` : "Mentor"} />
          <SummaryRow label="Session" value={booking.session_type} />
          <SummaryRow label="Date" value={booking.date} />
          <SummaryRow label="Time" value={booking.time} />
          <SummaryRow label="Duration" value="60 Minutes" />
          <SummaryRow label="Meeting Platform" value="Google Meet" />
          <SummaryRow label="Session Price" value={`₹${price}`} />
          <SummaryRow label="Platform Fee" value={`₹${platformFee}`} />
          <SummaryRow label="Included" value="Secure processing" />
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <p style={{ color: "var(--text-secondary)", marginBottom: "4px" }}>Total</p>
            <h2 style={{ fontSize: "32px", margin: 0 }}>₹{total}</h2>
          </div>
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={isSubmitting || !bookingReadyForPayment}
            style={{ background: "var(--primary)", color: "#fff", padding: "14px 22px", borderRadius: "16px", cursor: isSubmitting || !bookingReadyForPayment ? "not-allowed" : "pointer", opacity: isSubmitting || !bookingReadyForPayment ? 0.7 : 1 }}
          >
            {isSubmitting ? "Creating payment..." : "Proceed to Payment"}
          </button>
        </div>

        {!bookingReadyForPayment ? (
          <div
            style={{
              marginTop: "16px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "rgba(255, 205, 210, 0.24)",
              border: "1px solid rgba(211, 47, 47, 0.3)",
              color: "var(--danger)",
            }}
          >
            This booking is not currently ready for payment. Please wait until your mentor approves the request or checks the payment status.
          </div>
        ) : null}

        {feedback ? (
          <div
            role={feedback.type === "error" ? "alert" : "status"}
            style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "14px", background: feedback.type === "error" ? "rgba(122, 51, 40, 0.12)" : "rgba(108, 122, 83, 0.16)", color: feedback.type === "error" ? "var(--danger)" : "var(--success)" }}
          >
            {feedback.message}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: "16px" }}>
        <Link href="/dashboard" style={{ color: "var(--primary)", fontWeight: 600 }}>Back to dashboard</Link>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
