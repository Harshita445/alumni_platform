export type VerificationStatus = "verified" | "pending" | "rejected";
export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

const ALLOWED_STUDENT_BATCHES = ["_be24", "_be25", "_be26", "_be27"];

export function isEligibleStudentEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  return (
    normalized.endsWith("@thapar.edu") &&
    ALLOWED_STUDENT_BATCHES.some((batch) => normalized.includes(batch))
  );
}

export function isThaparAlumniEmail(email: string) {
  return email.trim().toLowerCase().endsWith("@thapar.edu");
}

export function getInitialVerificationStatus(
  role: "student" | "alumni",
  email = ""
): VerificationStatus {
  if (role === "student") {
    return "verified";
  }

  return isThaparAlumniEmail(email) ? "verified" : "pending";
}

export function getInitialOnboardingStep(
  role: "student" | "alumni",
  verificationStatus: VerificationStatus
): OnboardingStep {
  if (role === "student") {
    return 0;
  }

  return verificationStatus === "verified" ? 0 : 0;
}

export function resolvePostAuthRoute(user: {
  role?: "student" | "alumni";
  verification_status?: VerificationStatus;
  onboarding_step?: number;
  profile?: {
    full_name?: string | null;
    company?: string | null;
  };
} | null) {
  if (!user) {
    return "/login";
  }

  if (user.role === "alumni") {
    if (user.verification_status === "pending") {
      return "/verification/pending";
    }

    if (user.verification_status === "rejected") {
      return "/verification/rejected";
    }
  }

  if (typeof user.onboarding_step === "number" && user.onboarding_step >= 5) {
    return "/dashboard";
  }

  return "/onboarding";
}

export function normalizeStoredUser(user: Record<string, unknown>) {
  const role = user.role === "alumni" ? "alumni" : "student";
  const verificationStatus =
    user.verification_status === "pending" ||
    user.verification_status === "rejected"
      ? user.verification_status
      : "verified";
  const onboardingStep =
    typeof user.onboarding_step === "number" && user.onboarding_step >= 0
      ? Math.min(user.onboarding_step, 5)
      : 0;

  return {
    ...user,
    role,
    verification_status: verificationStatus,
    onboarding_step: onboardingStep,
  };
}

export function parseGoalsToChips(value: string) {
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mergeMentorshipGoals(existing: string[]) {
  return [...new Set(existing || [])].join("; ");
}
