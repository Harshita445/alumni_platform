export function getAdmissionYear(email: string) {
  const match = email.match(/_be(\d{2})@thapar\.edu$/i);

  if (!match) return null;

  return Number(`20${match[1]}`);
}

export function getGraduationYear(
  admissionYear: number
) {
  return admissionYear + 4;
}

export function isValidStudentEmail(
  email: string
) {
  return /.+_be\d{2}@thapar\.edu$/i.test(
    email
  );
}