export type BookingStatus =
  | "pending"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "rejected";

export interface BookingStatusEntry {
  status: BookingStatus;
  changed_at?: string | null;
  note?: string | null;
}

export interface Booking {
  id: number;
  student_id: number;
  alumni_id: number;
  session_type: string;
  date: string;
  time: string;
  status: BookingStatus;
  created_at?: string | null;
  message?: string | null;
  status_history?: BookingStatusEntry[];
}

export interface CreateBookingPayload {
  alumni_id: number;
  session_type: string;
  date: string;
  time: string;
  message?: string;
}