export function isThaparStudentEmail(
  email: string
) {
  return /_be\d{2}@thapar\.edu$/i.test(email);
}

export function isThaparAlumniCandidateEmail(
  email: string
) {
  const localPart = (email.split("@")[0] || "").toLowerCase();
  return (
    email.toLowerCase().endsWith("@thapar.edu") &&
    /_be2[3456](?:$|_)/i.test(localPart)
  );
}

export function getAdmissionYear(
  email: string
) {
  const match = email.match(/_be(\d{2})/i);

  if (!match) return null;

  return 2000 + Number(match[1]);
}

export function getGraduationYear(
  admissionYear: number
) {
  return admissionYear + 4;
}

export function isThaparEmail(
  email: string
) {
  return email.endsWith("@thapar.edu");
}