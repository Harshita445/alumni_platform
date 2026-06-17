"use client";

import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("current-user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  function login(data: any) {
    localStorage.setItem(
      "current-user",
      JSON.stringify(data)
    );

    setUser(data);
  }

  function logout() {
    localStorage.removeItem(
      "current-user"
    );

    setUser(null);
  }

  return {
    user,
    login,
    logout,
  };
}