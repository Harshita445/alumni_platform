export type UserRole = "student" | "alumni";

export type VerificationStatus =
  | "verified"
  | "pending";

export type User = {
  id: string;

  role: UserRole;

  name: string;

  email: string;

  profileImage?: string;
};

export type StudentProfile = {
  admissionYear: number;

  graduationYear: number;

  department: string;

  targetCompanies: string[];

  desiredRoles: string[];

  goals: string;
};

export type AlumniProfile = {
  graduationYear: number;

  company: string;

  role: string;

  bio: string;

  linkedIn?: string;

  verificationStatus: VerificationStatus;
};