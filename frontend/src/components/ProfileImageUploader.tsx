"use client";

import { useState } from "react";

import CloudinaryUploader from "@/components/CloudinaryUploader";
import { uploadProfilePicture } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileImageUploader({
  initialPreview,
}: {
  initialPreview?: string | null;
}) {
  const { user, login } = useAuth();
  const [preview, setPreview] = useState(initialPreview ?? user?.profile?.profile_picture_url ?? null);

  if (!user) {
    return null;
  }

  return (
    <CloudinaryUploader
      label="Profile picture"
      accept="image/jpeg,image/png,image/webp"
      initialPreview={preview}
      previewLabel="Profile preview"
      previewShape="circle"
      onUpload={async (file) => {
        const result = await uploadProfilePicture(user.access_token, file);
        setPreview(result.url);
        login({
          ...user,
          profile: {
            ...(user.profile || {}),
            profile_picture_url: result.url,
            profile_picture_public_id: result.public_id,
          },
        });
      }}
    />
  );
}
