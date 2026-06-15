import { Booking } from "@/types/Booking";

export const mockBookings: Booking[] = [
  {
    id: "1",
    alumniId: "1",
    studentId: "student-1",
    sessionType: "Resume Review",
    date: "2026-06-20",
    time: "18:00",
    status: "upcoming",
  },
  {
    id: "2",
    alumniId: "2",
    studentId: "student-1",
    sessionType: "Career Guidance",
    date: "2026-06-10",
    time: "19:00",
    status: "completed",
  },
];