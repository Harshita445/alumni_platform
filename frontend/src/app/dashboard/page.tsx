"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AccessGateCard from "@/components/AccessGateCard";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import BookingCard from "@/components/dashboard/BookingCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ProgressRing from "@/components/dashboard/ProgressRing";
import QuickActionGrid from "@/components/dashboard/QuickActionGrid";
import SectionCard from "@/components/dashboard/SectionCard";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import StatCard from "@/components/dashboard/StatCard";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import { useAuth } from "@/hooks/useAuth";
import { BookingStatus, fetchDashboard, fetchMyBookings, fetchNotifications, type Booking } from "@/lib/api";
import { resolvePostAuthRoute } from "@/lib/onboarding";
import { BookOpen, BriefcaseBusiness, CalendarDays, Compass, LayoutDashboard, MessageSquareMore, Sparkles, UserRound } from "lucide-react";

type RecentBooking = {
  id: number;
  name: string;
  date: string;
  time: string;
  status: BookingStatus;
};

type Recommendation = {
  id: number;
  full_name: string;
  company?: string | null;
  designation?: string | null;
  score: number;
  reason: string;
};

type DashboardData = {
  pending_requests: number;
  upcoming_sessions: number;
  completed_sessions: number;
  saved_alumni?: number;
  total_students_helped?: number;
  recommendations?: Recommendation[];
  recent_bookings: RecentBooking[];
};

type NotificationItem = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const targetRoute = resolvePostAuthRoute(user);
    if (targetRoute !== "/dashboard") {
      router.replace(targetRoute);
      return;
    }

    let active = true;

    const loadDashboard = async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      try {
        const [result, bookingResult, notificationResult] = await Promise.all([
          fetchDashboard(user.access_token, user.role),
          fetchMyBookings(user.access_token),
          fetchNotifications(user.access_token),
        ]);

        if (active) {
          setDashboard(result);
          setBookings(bookingResult);
          setNotifications(notificationResult);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard."
          );
        }
      } finally {
        if (active && showLoading) {
          setLoading(false);
        }
      }
    };

    void loadDashboard(true);

    const pollingId = window.setInterval(() => {
      void loadDashboard(false);
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(pollingId);
    };
  }, [user]);

  if (!user) {
    return (
      <AccessGateCard
        icon={LayoutDashboard}
        title="Login to access your dashboard"
        description="Track mentorship sessions, manage your activity, and stay connected with the alumni network."
        bullets={[
          "View your activity",
          "Track mentorship sessions",
          "Manage your profile",
        ]}
        buttonLabel="Go to Login"
        onClick={() => router.push("/login")}
      />
    );
  }

  const quickActions = useMemo(() => {
    if (user.role === "student") {
      return [
        { label: "Browse Alumni", href: "/search", icon: Compass, description: "Find mentors" },
        { label: "Bookings", href: "/bookings", icon: CalendarDays, description: "Track sessions" },
        { label: "Saved", href: "/saved", icon: Sparkles, description: "Saved mentors" },
        { label: "Community", href: "/community", icon: MessageSquareMore, description: "Join conversations" },
      ];
    }

    return [
      { label: "Requests", href: "/bookings", icon: BookOpen, description: "Review requests" },
      { label: "Schedule", href: "/bookings", icon: CalendarDays, description: "Today's sessions" },
      { label: "Profile", href: "/profile", icon: UserRound, description: "Update profile" },
      { label: "Earnings", href: "/payments", icon: BriefcaseBusiness, description: "Track payouts" },
    ];
  }, [user.role]);

  const profileCompletion = useMemo(() => {
    const fields = [
      user.profile?.full_name,
      user.profile?.branch || user.profile?.graduation_year,
      user.profile?.company,
      user.profile?.designation,
      user.profile?.bio,
      user.profile?.skills?.length,
      user.profile?.career_interests?.length,
      user.profile?.goals,
      user.profile?.target_companies?.length,
      user.profile?.resume_url,
    ].filter(Boolean).length;
    return Math.min(100, Math.round((fields / 10) * 100));
  }, [user.profile]);

  const upcomingBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === "confirmed" || booking.status === "approved" || booking.status === "awaiting_payment").slice(0, 3);
  }, [bookings]);

  const pendingBookings = useMemo(() => {
    return bookings.filter((booking) => booking.status === "pending").slice(0, 3);
  }, [bookings]);

  const activityItems = useMemo(() => {
    return [
      {
        title: user.role === "student" ? "Booking request submitted" : "New session request received",
        detail: dashboard?.recent_bookings?.[0]?.name ? `Connected with ${dashboard.recent_bookings[0].name}` : "Latest booking activity",
        time: "Just now",
      },
      {
        title: notifications[0]?.message ? "Notification update" : "Stay on top of your dashboard",
        detail: notifications[0]?.message || "Your dashboard is automatically synced with the latest activity.",
        time: notifications[0]?.created_at ? new Date(notifications[0].created_at).toLocaleDateString() : "Today",
      },
    ];
  }, [dashboard?.recent_bookings, notifications, user.role]);

  return (
    <main
      style={{
        maxWidth: "var(--container-width)",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <DashboardHeader user={user} unreadCount={notifications.filter((item) => !item.is_read).length} />
      <WelcomeCard
        user={user}
        ctaHref={user.role === "student" ? "/search" : "/bookings"}
        ctaLabel={user.role === "student" ? "Browse mentors" : "Review requests"}
        title={user.role === "student" ? "Your next mentor moment is waiting" : "Your mentorship desk is ready"}
        subtitle={user.role === "student" ? "Track upcoming sessions, pending requests, and fresh recommendations from your alumni network." : "Review incoming requests, keep your sessions moving, and stay close to your students."}
      />

      {loading ? (
        <div style={{ display: "grid", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {[1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)}
          </div>
          <div style={{ display: "grid", gap: "16px" }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : error ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      ) : dashboard ? (
        <>
          <QuickActionGrid items={quickActions} />

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <StatCard label="Pending Requests" value={dashboard.pending_requests} accent="var(--accent)" />
            <StatCard label="Upcoming Sessions" value={dashboard.upcoming_sessions} accent="#31506F" />
            <StatCard label="Completed Sessions" value={dashboard.completed_sessions} accent="#4F633A" />
            <StatCard label={user.role === "student" ? "Saved Alumni" : "Students Helped"} value={user.role === "student" ? dashboard.saved_alumni ?? 0 : dashboard.total_students_helped ?? 0} accent="#7A4B2E" />
          </section>

          <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)", alignItems: "start" }}>
            <div style={{ display: "grid", gap: "24px" }}>
              <SectionCard title={user.role === "student" ? "Upcoming sessions" : "Today's schedule"} subtitle="Live bookings synced from the backend.">
                {upcomingBookings.length > 0 ? (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} role={user.role} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={CalendarDays} title="No upcoming sessions" description="Your next mentoring session will appear here as soon as it is confirmed." ctaLabel="Browse mentors" ctaHref="/search" />
                )}
              </SectionCard>

              {user.role === "student" && dashboard.recommendations?.length ? (
                <SectionCard title="Recommended alumni" subtitle="Matched to your profile and interests.">
                  <div style={{ display: "grid", gap: "12px" }}>
                    {dashboard.recommendations.map((item) => (
                      <div key={item.id} style={{ border: "1px solid var(--border)", borderRadius: "16px", padding: "14px 16px", background: "rgba(255,248,239,0.72)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                          <strong>{item.full_name}</strong>
                          <span style={{ color: "var(--accent)", fontWeight: 700 }}>{item.score.toFixed(1)} match</span>
                        </div>
                        <p style={{ margin: "6px 0 0", color: "var(--text-secondary)" }}>{item.designation || "Alumni"}{item.company ? ` · ${item.company}` : ""}</p>
                        <p style={{ margin: "6px 0 0", color: "var(--text-secondary)" }}>{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ) : null}

              <SectionCard title="Recent activity" subtitle="The latest updates from your account.">
                <ActivityTimeline items={activityItems} />
              </SectionCard>
            </div>

            <div style={{ display: "grid", gap: "24px" }}>
              <SectionCard title="Profile completion" subtitle="Keep your profile discoverable.">
                <ProgressRing progress={profileCompletion} label="Profile ready" />
              </SectionCard>

              <SectionCard title="Notifications" subtitle="Unread items are highlighted.">
                {notifications.length > 0 ? (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {notifications.slice(0, 4).map((notification) => (
                      <div key={notification.id} style={{ border: "1px solid var(--border)", borderRadius: "14px", padding: "12px 14px", background: notification.is_read ? "transparent" : "rgba(255,244,229,0.85)" }}>
                        <p style={{ margin: 0, color: "var(--text-primary)" }}>{notification.message}</p>
                        <p style={{ margin: "6px 0 0", color: "var(--text-secondary)", fontSize: "13px" }}>{new Date(notification.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={MessageSquareMore} title="No notifications yet" description="You will see important booking and payment updates here." />
                )}
              </SectionCard>

              <SectionCard title="Pending requests" subtitle="Needs your attention.">
                {pendingBookings.length > 0 ? (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {pendingBookings.map((booking) => (
                      <div key={booking.id} style={{ border: "1px solid var(--border)", borderRadius: "14px", padding: "12px 14px" }}>
                        <strong>{booking.session_type}</strong>
                        <p style={{ margin: "6px 0 0", color: "var(--text-secondary)" }}>{booking.date} · {booking.time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={BookOpen} title="All clear" description="There are no pending requests right now." />
                )}
              </SectionCard>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
