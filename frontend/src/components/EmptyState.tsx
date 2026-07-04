type EmptyStateProps = {
  title: string;
  description: string;
  onClearFilters?: () => void;
};

export default function EmptyState({
  title,
  description,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(106, 68, 48, 0.04) 0%, rgba(106, 68, 48, 0.02) 100%)",
        border: "2px dashed var(--border)",
        borderRadius: "28px",
        padding: "80px 40px",
        textAlign: "center",
        margin: "60px 0",
      }}
    >
      <div
        style={{
          fontSize: "64px",
          marginBottom: "24px",
          opacity: 0.5,
        }}
      >
        🔍
      </div>

      <h3
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "12px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "16px",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: onClearFilters ? "32px" : 0,
          maxWidth: "500px",
          margin:
            onClearFilters ? "16px auto 32px" : "16px auto 0",
        }}
      >
        {description}
      </p>

      {onClearFilters && (
        <button
          onClick={onClearFilters}
          style={{
            padding: "14px 32px",
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--primary-hover)";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 12px 24px rgba(106, 68, 48, 0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--primary)";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}