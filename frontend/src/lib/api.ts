const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const STORAGE_KEY = "current-user";

export type UserProfile = {
  full_name?: string | null;
  branch?: string | null;
  graduation_year?: number | null;
  company?: string | null;
  designation?: string | null;
  bio?: string | null;
  linkedin_url?: string | null;
  profile_image?: string | null;
  target_companies?: string[];
  desired_roles?: string[];
};

export type Alumni = {
  id: number;
  full_name?: string | null;
  branch?: string | null;
  graduation_year?: number | null;
  company?: string | null;
  designation?: string | null;
  bio?: string | null;
  linkedin_url?: string | null;
  profile_image?: string | null;
};

export type BookingStatus =
  | "pending"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "rejected";

export type Booking = {
  id: number;
  student_id: number;
  alumni_id: number;
  session_type: string;
  date: string;
  time: string;
  status: BookingStatus;
  created_at?: string | null;
};

export type Review = {
  id: number;
  booking_id: number;
  student_id: number;
  alumni_id: number;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
};

export type StoredUser = {
  id: number;
  email: string;
  role: "student" | "alumni";
  access_token: string;
  token_type: string;
  profile?: UserProfile;
};

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: StoredUser) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("current-user-changed"));
}

export function clearStoredUser() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("current-user-changed"));
}

async function request(
  path: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;

    try {
      const errorBody = await response.json();

      if (errorBody?.detail) {
        errorMessage = errorBody.detail;
      }
    } catch {
      // ignore parse failures
    }

    throw new Error(errorMessage || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function registerUser(payload: {
  email: string;
  password: string;
  role: string;
}) {
  const tokenData = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const user = await fetchMe(tokenData.access_token);
  const profile = await fetchProfile(tokenData.access_token);

  const storedUser: StoredUser = {
    ...user,
    access_token: tokenData.access_token,
    token_type: tokenData.token_type,
    profile,
  };

  saveStoredUser(storedUser);

  return storedUser;
}

export async function googleAuth(payload: {
  role: string;
  email: string;
  name?: string;
  provider_id?: string;
  id_token?: string;
}) {
  const tokenData = await request("/auth/google", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const user = await fetchMe(tokenData.access_token);
  const profile = await fetchProfile(tokenData.access_token);

  const storedUser: StoredUser = {
    ...user,
    access_token: tokenData.access_token,
    token_type: tokenData.token_type,
    profile,
  };

  saveStoredUser(storedUser);

  return storedUser;
}

export async function loginUser(
  email: string,
  password: string
) {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;

    try {
      const errorBody = await response.json();
      if (errorBody?.detail) {
        errorMessage = errorBody.detail;
      }
    } catch {
      // ignore
    }

    throw new Error(errorMessage || "Login failed");
  }

  const tokenData = await response.json();

  const user = await fetchMe(tokenData.access_token);
  const profile = await fetchProfile(tokenData.access_token);

  const storedUser: StoredUser = {
    ...user,
    access_token: tokenData.access_token,
    token_type: tokenData.token_type,
    profile,
  };

  saveStoredUser(storedUser);

  return storedUser;
}

export async function fetchMe(
  token: string
): Promise<{ id: number; email: string; role: "student" | "alumni" }> {
  return request("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchProfile(
  token: string
): Promise<UserProfile> {
  return request("/profile/me", {
    headers: getAuthHeaders(token),
  });
}

export type PendingAdminUser = {
  id: number;
  email: string;
  role: "student" | "alumni";
  auth_provider: string;
  display_name?: string | null;
  is_verified: boolean;
  is_pending_verification: boolean;
};

export async function fetchPendingAdminUsers(adminKey: string) {
  return request("/auth/admin/pending", {
    headers: {
      "X-Admin-Key": adminKey,
    },
  }) as Promise<PendingAdminUser[]>;
}

export async function verifyAdminUser(userId: number, adminKey: string) {
  return request(`/auth/admin/verify?user_id=${userId}`, {
    method: "POST",
    headers: {
      "X-Admin-Key": adminKey,
    },
  });
}

export async function updateProfile(
  token: string,
  data: UserProfile
): Promise<UserProfile> {
  return request("/profile/me", {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function fetchAlumni(
  token?: string,
  filters: {
    company?: string;
    branch?: string;
    graduation_year?: number;
    search?: string;
  } = {}
): Promise<Alumni[]> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  return request(`/alumni${query ? `?${query}` : ""}`, {
    headers: token ? getAuthHeaders(token) : undefined,
  });
}

export async function fetchAlumniDetails(
  id: string | number,
  token?: string
): Promise<Alumni> {
  return request(`/alumni/${id}`, {
    headers: token ? getAuthHeaders(token) : undefined,
  });
}

export async function fetchSavedAlumni(token: string): Promise<Alumni[]> {
  return request("/saved/me", {
    headers: getAuthHeaders(token),
  });
}

export async function saveAlumni(token: string, alumniId: number) {
  return request(`/saved/${alumniId}`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
}

export async function removeSavedAlumni(
  token: string,
  alumniId: number
) {
  return request(`/saved/${alumniId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
}

export async function createBooking(
  token: string,
  data: {
    alumni_id: number;
    session_type: string;
    date: string;
    time: string;
  }
): Promise<Booking> {
  return request("/bookings", {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function fetchMyBookings(
  token: string
): Promise<Booking[]> {
  return request("/bookings/me", {
    headers: getAuthHeaders(token),
  });
}

export async function updateBookingStatus(
  token: string,
  bookingId: number,
  status: BookingStatus
): Promise<Booking> {
  return request(`/bookings/${bookingId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status }),
  });
}

export async function submitReview(
  token: string,
  data: {
    booking_id: number;
    rating: number;
    comment?: string;
  }
): Promise<{ message: string }> {
  return request("/reviews/", {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function fetchAlumniReviews(
  alumniId: string | number,
  token?: string
): Promise<Review[]> {
  return request(`/reviews/alumni/${alumniId}`, {
    headers: token ? getAuthHeaders(token) : undefined,
  });
}

export async function fetchDashboard(
  token: string,
  role: string
) {
  const path = role === "alumni"
    ? "/dashboard/alumni"
    : "/dashboard/student";

  return request(path, {
    headers: getAuthHeaders(token),
  });
}

export async function fetchNotifications(token: string) {
  return request("/notifications/me", {
    headers: getAuthHeaders(token),
  });
}

export async function markNotificationRead(
  token: string,
  notificationId: number
) {
  return request(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });
}

// Password reset helpers
export async function requestPasswordReset(email: string) {
  return request("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  }) as Promise<{ message: string; token?: string } | { message: string }>;
}

export async function confirmPasswordReset(token: string, new_password: string) {
  return request("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
  }) as Promise<{ message: string }>;
}
