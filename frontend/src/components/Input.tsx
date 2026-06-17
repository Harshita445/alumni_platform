type InputProps = {
  placeholder: string;
  type?: string;
};

export default function Input({
  placeholder,
  type = "text",
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        color: "var(--text-primary)",
        outline: "none",
      }}
    />
  );
}