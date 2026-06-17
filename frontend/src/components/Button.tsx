
type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
}: ButtonProps) {
  const styles = {
    primary: {
      backgroundColor: "var(--primary)",
      color: "#FFFFFF",
    },
    secondary: {
      backgroundColor: "var(--surface-secondary)",
      color: "var(--text-primary)",
    },
  };

  return (
    <button
      type={type}
      style={{
        ...styles[variant],
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "12px 20px",
        cursor: "pointer",
        fontWeight: 500,
        transition: "0.2s ease",
      }}
    >
      {children}
    </button>
  );
}