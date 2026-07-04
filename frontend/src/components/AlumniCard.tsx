"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { useSavedAlumni } from "@/hooks/useSavedAlumni";
import styles from "./AlumniCard.module.css";

type Props = {
  id: number;
  name: string;
  profileImage: string;
  company: string;
  role: string;
};

export default function AlumniCard({
  id,
  name,
  profileImage,
  company,
  role,
}: Props) {
  const { user } = useAuth();
  const { toggleSave, isSaved, canSave } = useSavedAlumni();
  const saved = isSaved(id);

  return (
    <div className={styles.alumniCard}>
      {/* PROFILE SECTION */}
      <div className={styles.profileSection}>
        <div className={styles.profileImage}>
          <Image
            src={profileImage}
            alt={name}
            width={80}
            height={80}
            className={styles.profileImageElement}
          />
        </div>

        <div className={styles.profileInfo}>
          <h3 className={styles.profileName}>{name}</h3>
          <p className={styles.profileRole}>{role}</p>
          <p className={styles.profileCompany}>{company}</p>
        </div>
      </div>

      {/* ACTIONS SECTION */}
      <div className={styles.actionsSection}>
        {/* PRIMARY CTA: Book Session / View Profile */}
        <Link
          href={`/profile/${id}`}
          className={styles.primaryButton}
        >
          Book Session
        </Link>

        {/* SAVE BUTTON */}
        {canSave && (
          <button
            onClick={() => toggleSave(id)}
            aria-pressed={saved}
            className={`${styles.secondaryButton} ${
              saved ? styles.saved : ""
            }`}
          >
            {saved ? "✓ Saved" : "Save Alumnus"}
          </button>
        )}

        {/* LOGIN PROMPT */}
        {!user && (
          <Link
            href="/login"
            className={styles.secondaryButton}
          >
            Log in to book
          </Link>
        )}
      </div>
    </div>
  );
}
