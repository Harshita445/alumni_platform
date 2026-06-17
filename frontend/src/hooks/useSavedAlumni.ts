"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import {
  fetchSavedAlumni,
  removeSavedAlumni,
  saveAlumni,
} from "@/lib/api";

type SavedAlumniItem = {
  id: number;
  full_name?: string;
  company?: string;
  designation?: string;
  profile_image?: string;
};

export function useSavedAlumni() {
  const { user } = useAuth();
  const [savedAlumni, setSavedAlumni] =
    useState<SavedAlumniItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "student") {
      return;
    }

    const loadSaved = async () => {
      setLoading(true);
      setError(null);

      try {
        const saved = await fetchSavedAlumni(
          user.access_token
        );
        setSavedAlumni(saved);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load saved alumni."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, [user]);

  const refreshSaved = async () => {
    if (!user || user.role !== "student") {
      return;
    }

    const saved = await fetchSavedAlumni(
      user.access_token
    );
    setSavedAlumni(saved);
  };

  const toggleSave = async (alumniId: number) => {
    if (!user || user.role !== "student") {
      return;
    }

    try {
      if (
        savedAlumni.some(
          (item) => item.id === alumniId
        )
      ) {
        await removeSavedAlumni(
          user.access_token,
          alumniId
        );
      } else {
        await saveAlumni(
          user.access_token,
          alumniId
        );
      }
      await refreshSaved();
    } catch (err) {
      console.error(err);
    }
  };

  const savedIds = savedAlumni.map((item) => item.id);

  return {
    savedAlumni,
    savedIds,
    loading,
    error,
    isSaved: (id: number) =>
      savedIds.includes(id),
    toggleSave,
  };
}
