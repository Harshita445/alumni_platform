export type BookingStatus =
  | "pending"
  | "approved"
  | "awaiting_payment"
  | "paid"
  | "confirmed"
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
  message?: string | null;
  timezone?: string | null;
  meeting_link?: string | null;
  payment_id?: number | null;
  payment_status?: string | null;
  payment_gateway?: string | null;
  status_history?: BookingStatusEntry[];
  created_at?: string | null;
}

export interface CreateBookingPayload {
  alumni_id: number;
  session_type: string;
  date: string;
  time: string;
  message?: string;
}