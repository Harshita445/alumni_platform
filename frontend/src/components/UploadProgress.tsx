type UploadProgressProps = {
  progress: number;
  message?: string;
};

export default function UploadProgress({ progress, message }: UploadProgressProps) {
  if (progress <= 0) {
    return null;
  }

  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <div
        style={{
          width: "100%",
          height: "8px",
          borderRadius: "999px",
          background: "var(--surface-secondary)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(progress, 100)}%`,
            height: "100%",
            background: "var(--primary)",
            transition: "width 180ms ease-out",
          }}
        />
      </div>
      {message ? <p style={{ color: "var(--text-secondary)", margin: 0 }}>{message}</p> : null}
    </div>
  );
}
