const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const STORAGE_KEY = "current-user";

export type StoredUser = {
  id: number;
  email: string;
  role: "student" | "alumni";
  access_token: string;
  token_type: string;
  profile?: {
    full_name?: string;
    branch?: string;
    graduation_year?: number;
    company?: string;
    designation?: string;
    bio?: string;
    linkedin_url?: string;
  };
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
}

export function clearStoredUser() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
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
): Promise<any> {
  return request("/profile/me", {
    headers: getAuthHeaders(token),
  });
}

export async function updateProfile(
  token: string,
  data: any
) {
  return request("/profile/me", {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function fetchAlumni(token?: string) {
  return request("/alumni", {
    headers: token ? getAuthHeaders(token) : undefined,
  });
}

export async function fetchAlumniDetails(
  id: string | number,
  token?: string
) {
  return request(`/alumni/${id}`, {
    headers: token ? getAuthHeaders(token) : undefined,
  });
}

export async function fetchSavedAlumni(token: string) {
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
) {
  return request("/bookings", {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
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
