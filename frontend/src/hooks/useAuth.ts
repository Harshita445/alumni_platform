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
    const syncUser = () => {
      setUser(getStoredUser());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "current-user") {
        syncUser();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("current-user-changed", syncUser);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("current-user-changed", syncUser);
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
