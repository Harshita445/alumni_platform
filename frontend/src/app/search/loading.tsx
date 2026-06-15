export default function Loading() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid var(--border)",
            borderTop: "4px solid var(--primary)",
            borderRadius: "50%",
            margin: "0 auto 16px",
          }}
        />

        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Loading...
        </p>
      </div>
    </main>
  );
}