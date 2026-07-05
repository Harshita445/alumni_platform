"use client";

import { useState } from "react";

import CloudinaryUploader from "@/components/CloudinaryUploader";
import { uploadResume } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function ResumeUploader({
  initialFileName,
}: {
  initialFileName?: string | null;
}) {
  const { user, login } = useAuth();
  const [fileName, setFileName] = useState(initialFileName ?? null);

  if (!user) {
    return null;
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <CloudinaryUploader
        label="Resume"
        accept="application/pdf"
        initialPreview={null}
        previewLabel="Resume"
        onUpload={async (file) => {
          const result = await uploadResume(user.access_token, file);
          setFileName(file.name);
          login({
            ...user,
            profile: {
              ...(user.profile || {}),
              resume_url: result.url,
              resume_public_id: result.public_id,
            },
          });
        }}
      />
      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.96rem" }}>
        Uploading a resume is optional but preferred for students to review your background more confidently.
      </p>
      {fileName ? <p style={{ margin: 0, color: "var(--text-secondary)" }}>Uploaded file: {fileName}</p> : null}
    </div>
  );
}
