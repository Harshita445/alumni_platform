"use client";

import { useEffect, useState } from "react";

import {
  clearStoredUser,
  getStoredUser,
  saveStoredUser,
  StoredUser,
} from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<StoredUser | null>(
    () => getStoredUser()
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "current-user") {
        setUser(getStoredUser());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function login(data: StoredUser) {
    saveStoredUser(data);
    setUser(data);
  }

  function logout() {
    clearStoredUser();
    setUser(null);
  }

  return {
    user,
    login,
    logout,
  };
}
