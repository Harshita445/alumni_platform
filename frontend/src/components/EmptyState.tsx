type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface)",
      }}
    >
      <h3
        style={{
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "var(--text-secondary)",
        }}
      >
        {description}
      </p>
    </div>
  );
}