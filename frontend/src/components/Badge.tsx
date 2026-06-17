type BadgeProps = {
  text: string;
};

export default function Badge({ text }: BadgeProps) {
  return (
    <span
      style={{
        padding: "8px 12px",
        borderRadius: "999px",
        backgroundColor: "var(--surface-secondary)",
        color: "var(--text-secondary)",
        fontSize: "14px",
      }}
    >
      {text}
    </span>
  );
}