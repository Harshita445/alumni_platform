"use client";

import { useEffect, useState } from "react";

export function useSavedAlumni() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(
      "saved-alumni"
    );

    if (stored) {
      setSavedIds(JSON.parse(stored));
    }
  }, []);

  const toggleSave = (id: string) => {
    const updated = savedIds.includes(id)
      ? savedIds.filter((item) => item !== id)
      : [...savedIds, id];

    setSavedIds(updated);

    localStorage.setItem(
      "saved-alumni",
      JSON.stringify(updated)
    );
  };

  const isSaved = (id: string) =>
    savedIds.includes(id);

  return {
    savedIds,
    toggleSave,
    isSaved,
  };
}