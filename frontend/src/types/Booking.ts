export interface Booking {
  id: string;

  alumniId: string;

  studentId: string;

  sessionType: string;

  date: string;

  time: string;

  status: "upcoming" | "completed" | "cancelled";
}