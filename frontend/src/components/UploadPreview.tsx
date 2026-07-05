import Image from "next/image";

type UploadPreviewProps = {
  previewUrl?: string | null;
  label: string;
  shape?: "circle" | "rounded";
};

export default function UploadPreview({ previewUrl, label, shape = "rounded" }: UploadPreviewProps) {
  if (!previewUrl) {
    return null;
  }

  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <p style={{ margin: 0, color: "var(--text-secondary)" }}>{label}</p>
      <Image
        src={previewUrl}
        alt={label}
        width={160}
        height={160}
        style={{ width: "160px", height: "160px", objectFit: "cover", borderRadius: shape === "circle" ? "50%" : "16px", border: "1px solid var(--border)" }}
      />
    </div>
  );
}
