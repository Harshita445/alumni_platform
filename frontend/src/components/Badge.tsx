type BadgeProps = {
  text: string;
  tone?: "neutral" | "pending" | "approved" | "awaiting_payment" | "paid" | "confirmed" | "completed" | "cancelled" | "rejected";
};

export default function Badge({ text, tone = "neutral" }: BadgeProps) {
  const styles = {
    neutral: {
      backgroundColor: "var(--surface-secondary)",
      color: "var(--text-secondary)",
    },
    pending: {
      backgroundColor: "#F3E1C4",
      color: "#7A4B12",
    },
    approved: {
      backgroundColor: "#DDE6F2",
      color: "#31506F",
    },
    awaiting_payment: {
      backgroundColor: "#F3E1C4",
      color: "#7A4B12",
    },
    paid: {
      backgroundColor: "#E2E9D8",
      color: "#4F633A",
    },
    confirmed: {
      backgroundColor: "#E2E9D8",
      color: "#4F633A",
    },
    completed: {
      backgroundColor: "#E2E9D8",
      color: "#4F633A",
    },
    cancelled: {
      backgroundColor: "#E8DDD6",
      color: "#6F5C4F",
    },
    rejected: {
      backgroundColor: "#F0D8D2",
      color: "#7A3328",
    },
  };

  return (
    <span
      style={{
        padding: "8px 12px",
        borderRadius: "999px",
        ...styles[tone],
        fontSize: "14px",
        textTransform: "capitalize",
      }}
    >
      {text}
    </span>
  );
}
