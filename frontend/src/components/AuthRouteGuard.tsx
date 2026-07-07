"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { resolvePostAuthRoute } from "@/lib/onboarding";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/register/student",
  "/register/alumni",
  "/forgot-password",
  "/reset-password",
  "/search",
  "/community",
];
const PUBLIC_PREFIXES = ["/profile/"];
const VERIFICATION_PREFIXES = ["/verification/pending", "/verification/rejected"];
const STUDENT_ONLY_PREFIXES = ["/saved", "/payment"];
const ALUMNI_ONLY_PREFIXES = ["/admin"];

export default function AuthRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const isPublicPath =
      PUBLIC_PATHS.includes(pathname) ||
      PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
      VERIFICATION_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

    if (!user) {
      if (!isPublicPath) {
        router.replace("/login");
      }
      return;
    }

    if (pathname === "/login" || pathname === "/register" || pathname === "/register/student" || pathname === "/register/alumni") {
      router.replace(resolvePostAuthRoute(user));
      return;
    }

    if (user.role === "alumni" && user.verification_status === "pending" && pathname !== "/verification/pending") {
      router.replace("/verification/pending");
      return;
    }

    if (user.role === "alumni" && user.verification_status === "rejected" && pathname !== "/verification/rejected") {
      router.replace("/verification/rejected");
      return;
    }

    if (
      user.role === "student" &&
      ALUMNI_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    ) {
      router.replace("/403");
      return;
    }

    if (
      user.role === "alumni" &&
      STUDENT_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    ) {
      router.replace("/403");
      return;
    }

    const targetRoute = resolvePostAuthRoute(user);
    if ((pathname === "/dashboard" || pathname === "/onboarding") && targetRoute !== pathname) {
      router.replace(targetRoute);
    }
  }, [pathname, router, user]);

  return <>{children}</>;
}
