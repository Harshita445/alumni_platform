import type { Booking } from "@/types/Booking";

export const mockBookings: Booking[] = [
  {
    id: 1,
    alumni_id: 1,
    student_id: 101,
    session_type: "Resume Review",
    date: "2026-06-20",
    time: "18:00",
    status: "confirmed",
    message: "I would like help refining my resume for product roles.",
    status_history: [
      {
        status: "pending",
        changed_at: "2026-06-15T10:00:00.000Z",
        note: "Session requested",
      },
      {
        status: "confirmed",
        changed_at: "2026-06-16T08:30:00.000Z",
        note: "Accepted by alumni",
      },
    ],
  },
  {
    id: 2,
    alumni_id: 2,
    student_id: 101,
    session_type: "Career Guidance",
    date: "2026-06-10",
    time: "19:00",
    status: "completed",
    message: "Looking for guidance on interview prep and industry transitions.",
    status_history: [
      {
        status: "pending",
        changed_at: "2026-06-01T09:00:00.000Z",
        note: "Session requested",
      },
      {
        status: "completed",
        changed_at: "2026-06-03T12:15:00.000Z",
        note: "Session completed",
      },
    ],
  },
];