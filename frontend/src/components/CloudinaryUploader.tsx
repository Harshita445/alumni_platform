"use client";

import { useMemo, useState, type ChangeEvent, type DragEvent } from "react";

import UploadPreview from "@/components/UploadPreview";
import UploadProgress from "@/components/UploadProgress";

export type CloudinaryUploaderProps = {
  label: string;
  accept?: string;
  onUpload: (file: File) => Promise<void>;
  initialPreview?: string | null;
  previewLabel?: string;
  previewShape?: "circle" | "rounded";
};

export default function CloudinaryUploader({
  label,
  accept,
  onUpload,
  initialPreview,
  previewLabel,
  previewShape = "rounded",
}: CloudinaryUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(initialPreview ?? null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const inputAccept = useMemo(() => accept || "image/*,.pdf", [accept]);

  const handleFile = async (file?: File | null) => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setStatusMessage("Uploading...");
    setProgress(10);

    try {
      if (file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
      }

      await onUpload(file);
      setProgress(100);
      setStatusMessage("Upload complete.");
    } catch (error) {
      setProgress(0);
      setStatusMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      window.setTimeout(() => setProgress(0), 1200);
    }
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    await handleFile(file);
  };

  const onInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <label style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{label}</label>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${isDragging ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "16px",
          padding: "20px",
          display: "grid",
          gap: "10px",
          justifyItems: "center",
          textAlign: "center",
          background: isDragging ? "rgba(106, 68, 48, 0.06)" : "var(--surface)",
        }}
      >
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          Drag and drop or click to choose a file.
        </p>
        <input type="file" accept={inputAccept} onChange={onInputChange} style={{ display: "none" }} id={`uploader-${label}`} />
        <label
          htmlFor={`uploader-${label}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "999px",
            padding: "10px 16px",
            background: "var(--primary)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Choose File
        </label>
        {isUploading ? <p style={{ margin: 0, color: "var(--text-secondary)" }}>Uploading…</p> : null}
      </div>
      <UploadPreview previewUrl={preview} label={previewLabel || label} shape={previewShape} />
      <UploadProgress progress={progress} message={statusMessage ?? undefined} />
    </div>
  );
}
