"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const [paymentDetails] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = window.localStorage.getItem("latest-payment");

    if (!stored) {
      return { message: "Payment details were not found. Please return to your dashboard and try again." };
    }

    try {
      return JSON.parse(stored) as {
        bookingId?: number;
        paymentId?: number;
        message?: string;
      };
    } catch {
      return { message: "Payment details could not be loaded. Please try again." };
    };
  });

  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: "24px" }}>
        <p style={{ color: "var(--accent)", fontWeight: 700, marginBottom: "8px" }}>Checkout complete</p>
        <h1 style={{ marginBottom: "8px" }}>Payment confirmed</h1>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Your session payment was recorded successfully. You can continue to the dashboard or return to your booking.
        </p>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "28px", padding: "32px", boxShadow: "var(--shadow-sm)", display: "grid", gap: "16px" }}>
        <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(108, 122, 83, 0.16)", color: "var(--success)" }}>
          <strong>Payment received</strong>
          <p style={{ margin: "6px 0 0", color: "inherit" }}>
            {paymentDetails?.message ?? "Your payment reference has been saved."}
          </p>
        </div>

        {paymentDetails?.paymentId ? (
          <div>
            <strong>Payment reference</strong>
            <p style={{ margin: "6px 0 0" }}>#{paymentDetails.paymentId}</p>
          </div>
        ) : null}

        {paymentDetails?.bookingId ? (
          <div>
            <strong>Booking ID</strong>
            <p style={{ margin: "6px 0 0" }}>#{paymentDetails.bookingId}</p>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
          <button type="button" onClick={() => router.push("/dashboard")} style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: "16px", padding: "14px 20px", cursor: "pointer", fontWeight: 600 }}>
            Go to dashboard
          </button>
          <button type="button" onClick={() => router.push("/bookings") } style={{ background: "transparent", color: "var(--primary)", border: "1px solid var(--border)", borderRadius: "16px", padding: "14px 20px", cursor: "pointer", fontWeight: 600 }}>
            View bookings
          </button>
        </div>
      </div>
    </main>
  );
}
