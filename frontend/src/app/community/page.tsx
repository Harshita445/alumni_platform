"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import {
  communityCategories,
  communityTags,
  createCommunityNotification,
  getCommunityNotifications,
  getCommunityPosts,
  getCommunityReports,
  saveCommunityNotifications,
  saveCommunityPosts,
  saveCommunityReports,
  sortCommunityPosts,
  toggleCommunityBookmark,
  toggleCommunityReaction,
  addCommunityComment,
  type CommunityCategory,
  type CommunityPost,
  type CommunityPostType,
  type CommunityReactionType,
  type CommunityReportReason,
  type CommunityComment,
} from "@/lib/community";

const tabs: Array<"All" | CommunityPostType> = [
  "All",
  "Question",
  "Discussion",
  "Event",
  "Announcement",
  "Opportunity",
  "Resource",
];

const sortOptions = ["Latest", "Trending", "Most Liked", "Most Commented", "Newest", "Oldest"] as const;
const roleOptions = ["All", "student", "alumni", "admin"] as const;
const reactionOptions: CommunityReactionType[] = ["Helpful", "Useful", "Celebrate", "Insightful"];

const categoryStyles: Record<string, string> = {
  "Career Guidance": "#f4e4d3",
  Placements: "#f3dfc7",
  Internships: "#f9e5c7",
  "Higher Studies": "#e7e1d0",
  "Product Management": "#e7d8c4",
  "Software Engineering": "#f1d9c8",
  "Data Science": "#ebdccf",
  Consulting: "#e6d8c8",
  Entrepreneurship: "#f2e7cf",
  "Resume Reviews": "#e7dfcf",
  "Interview Preparation": "#f3e1d3",
  Community: "#e5d8c7",
};

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(() => getCommunityPosts());
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [activeCategory, setActiveCategory] = useState<CommunityCategory | "All">("All");
  const [activeRole, setActiveRole] = useState<(typeof roleOptions)[number]>("All");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("Latest");
  const [search, setSearch] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [composeDraft, setComposeDraft] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; id: number } | null>(null);
  const [reportReason, setReportReason] = useState<CommunityReportReason>("Spam");
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "Question" as CommunityPostType,
    category: "Software Engineering" as CommunityCategory,
    resourceUrl: "",
    resourceType: "PDF",
    eventDate: "",
    location: "",
    meetingLink: "",
    registrationLink: "",
    capacity: "",
    deadline: "",
    company: "",
    applicationLink: "",
  });

  const filteredPosts = useMemo(() => {
    const query = search.toLowerCase();

    const nextPosts = posts.filter((post) => {
      const matchesTab = activeTab === "All" || post.type === activeTab;
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      const matchesRole = activeRole === "All" || post.authorRole === activeRole;
      const haystack = `${post.title} ${post.content} ${post.category} ${post.type} ${post.authorName} ${post.company || ""} ${(post.tags || []).join(" ")}`.toLowerCase();
      const matchesSearch = haystack.includes(query);
      return matchesTab && matchesCategory && matchesRole && matchesSearch;
    });

    return sortCommunityPosts(nextPosts, sortBy);
  }, [activeCategory, activeRole, activeTab, posts, search, sortBy]);

  const handleCreatePost = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setShowComposer(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) {
      return;
    }

    const nextPost: CommunityPost = {
      id: Date.now(),
      title,
      content,
      type: form.type,
      category: form.category,
      authorName: user.profile?.full_name || user.email,
      authorRole: user.role === "alumni" ? "alumni" : (user.role as "student" | "alumni" | "admin") === "admin" ? "admin" : "student",
      authorCompany: user.profile?.company || undefined,
      graduationYear: user.profile?.graduation_year || undefined,
      createdAt: "just now",
      comments: [],
      reactions: { Helpful: 0, Useful: 0, Celebrate: 0, Insightful: 0 },
      repliesCount: 0,
      tags: selectedTags,
      resourceUrl: form.resourceUrl || undefined,
      resourceType: form.resourceType || undefined,
      eventDate: form.eventDate || undefined,
      location: form.location || undefined,
      meetingLink: form.meetingLink || undefined,
      registrationLink: form.registrationLink || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      registeredCount: 0,
      deadline: form.deadline || undefined,
      applicationLink: form.applicationLink || undefined,
      company: form.company || undefined,
      viewCount: 0,
      bookmarkedBy: [],
      isAdminAnnouncement: form.type === "Announcement" && (user.role as "student" | "alumni" | "admin") === "admin",
    };

    const updatedPosts = [nextPost, ...posts];
    setPosts(updatedPosts);
    saveCommunityPosts(updatedPosts);
    if (form.type === "Announcement" && (user.role as "student" | "alumni" | "admin") === "admin") {
      const notifications = getCommunityNotifications();
      saveCommunityNotifications([
        createCommunityNotification({
          type: "announcement",
          title: "New announcement posted",
          message: `${title} is now live in the community feed.`,
        }),
        ...notifications,
      ]);
    }
    setShowComposer(false);
    setSelectedTags([]);
    setComposeDraft("");
    setForm({
      title: "",
      content: "",
      type: "Question",
      category: "Software Engineering",
      resourceUrl: "",
      resourceType: "PDF",
      eventDate: "",
      location: "",
      meetingLink: "",
      registrationLink: "",
      capacity: "",
      deadline: "",
      company: "",
      applicationLink: "",
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const handleReaction = (postId: number, reaction: CommunityReactionType) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const currentReaction = posts.find((item) => item.id === postId)?.userReaction;
    const nextPosts = toggleCommunityReaction(posts, postId, reaction, currentReaction);
    setPosts(nextPosts);
    saveCommunityPosts(nextPosts);
  };

  const handleBookmark = (postId: number) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const nextPosts = toggleCommunityBookmark(posts, postId, user.email);
    setPosts(nextPosts);
    saveCommunityPosts(nextPosts);
  };

  const submitComment = (postId: number) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const content = (commentDrafts[postId] || "").trim();
    if (!content) {
      return;
    }

    const nextPosts = addCommunityComment(posts, postId, content, user.profile?.full_name || user.email, user.role === "alumni" ? "alumni" : (user.role as "student" | "alumni" | "admin") === "admin" ? "admin" : "student");
    setPosts(nextPosts);
    saveCommunityPosts(nextPosts);
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
  };

  const handleReport = () => {
    if (!reportTarget || !user) {
      return;
    }

    const reports = getCommunityReports();
    saveCommunityReports([
      {
        id: Date.now(),
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        reason: reportReason,
        reportedBy: user.email,
        createdAt: new Date().toISOString(),
      },
      ...reports,
    ]);
    setReportTarget(null);
  };

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fbf7f1 0%, #f4ebdf 100%)", padding: "32px 20px 72px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gap: "24px" }}>
        <section style={{ background: "rgba(255,255,255,0.86)", border: "1px solid var(--border)", borderRadius: "24px", padding: "28px 30px", boxShadow: "0 18px 45px rgba(81, 59, 34, 0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ maxWidth: "760px" }}>
              <p style={{ margin: 0, color: "var(--primary)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.85rem" }}>Alumly Community</p>
              <h1 style={{ margin: "10px 0 8px", fontSize: "clamp(2rem, 3vw, 2.8rem)", color: "var(--text-primary)" }}>Community</h1>
              <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "1rem" }}>
                Connect with students and alumni, ask questions, share experiences, and stay updated with events across the Thapar network.
              </p>
            </div>
            <button onClick={handleCreatePost} style={{ border: "none", background: "var(--primary)", color: "#fff", padding: "12px 18px", borderRadius: "999px", cursor: "pointer", fontWeight: 700 }}>
              + Create Post
            </button>
          </div>

          <div style={{ marginTop: "24px", display: "grid", gap: "14px" }}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search discussions, questions, events..."
              style={{ border: "1px solid var(--border)", borderRadius: "999px", padding: "14px 16px", fontSize: "1rem", background: "#fff" }}
            />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ border: activeTab === tab ? "1px solid var(--primary)" : "1px solid var(--border)", background: activeTab === tab ? "#fdf4e8" : "#fff", color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)", borderRadius: "999px", padding: "8px 14px", cursor: "pointer", fontWeight: 700 }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr) 300px", gap: "24px", alignItems: "start" }}>
          <aside style={{ display: "grid", gap: "16px" }}>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 30px rgba(81, 59, 34, 0.06)" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem" }}>Browse Topics</h3>
              <div style={{ display: "grid", gap: "8px" }}>
                {communityCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    style={{ textAlign: "left", border: activeCategory === category ? "1px solid var(--primary)" : "1px solid var(--border)", background: activeCategory === category ? "#fdf4e8" : "#fff", borderRadius: "12px", padding: "10px 12px", cursor: "pointer", color: "var(--text-primary)" }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div style={{ display: "grid", gap: "16px" }}>
            {filteredPosts.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px", textAlign: "center", color: "var(--text-secondary)" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)" }}>No matching posts found.</h3>
                <p style={{ margin: 0 }}>Try another search term or create the first conversation.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <article key={post.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 30px rgba(81, 59, 34, 0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ background: categoryStyles[post.category] || "#f3e5d4", color: "var(--text-primary)", padding: "6px 10px", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 700 }}>{post.category}</span>
                      <span style={{ background: "#f5efe7", color: "var(--text-primary)", padding: "6px 10px", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 700 }}>{post.type}</span>
                      {post.isPinned ? <span style={{ background: "#f6dfc8", color: "var(--text-primary)", padding: "6px 10px", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 700 }}>Pinned</span> : null}
                    </div>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{post.createdAt}</span>
                  </div>
                  <h3 style={{ margin: "0 0 10px", fontSize: "1.15rem" }}>{post.title}</h3>
                  <p style={{ margin: "0 0 14px", lineHeight: 1.65, color: "var(--text-secondary)" }}>{post.content}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                      <strong style={{ color: "var(--text-primary)" }}>{post.authorName}</strong> • {post.authorRole}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {post.type === "Event" && post.eventDate ? <span style={{ background: "#f8efe5", padding: "6px 10px", borderRadius: "999px" }}>{post.eventDate}</span> : null}
                      {post.type === "Resource" && post.resourceUrl ? <a href={post.resourceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 700 }}>Download Resource</a> : null}
                      <Link href={`/community/${post.id}`} style={{ color: "var(--primary)", fontWeight: 700 }}>View Discussion</Link>
                    </div>
                  </div>
                  <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap", color: "var(--text-secondary)" }}>
                    <span>👍 Helpful {post.reactions.Helpful}</span>
                    <span>❤️ Useful {post.reactions.Useful}</span>
                    <span>🎉 Great {post.reactions.Celebrate}</span>
                    <span>• {post.repliesCount ?? post.comments.length} replies</span>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside style={{ display: "grid", gap: "16px" }}>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 30px rgba(81, 59, 34, 0.06)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "1.03rem" }}>Trending Discussions</h3>
              <div style={{ display: "grid", gap: "10px", color: "var(--text-secondary)" }}>
                <div>Google SWE AMA</div>
                <div>Resume Review Thread</div>
                <div>Placement Preparation 2026</div>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 30px rgba(81, 59, 34, 0.06)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "1.03rem" }}>Upcoming Events</h3>
              <div style={{ display: "grid", gap: "10px", color: "var(--text-secondary)" }}>
                <div><strong style={{ color: "var(--text-primary)" }}>Microsoft Alumni Talk</strong><br />July 22</div>
                <div><strong style={{ color: "var(--text-primary)" }}>Thapar Alumni Meet</strong><br />August 10</div>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 30px rgba(81, 59, 34, 0.06)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "1.03rem" }}>Community Stats</h3>
              <div style={{ display: "grid", gap: "10px", color: "var(--text-secondary)" }}>
                <div><strong style={{ color: "var(--text-primary)" }}>Members</strong> 1.8k+</div>
                <div><strong style={{ color: "var(--text-primary)" }}>Questions Asked</strong> 240+</div>
                <div><strong style={{ color: "var(--text-primary)" }}>Discussions</strong> 90+</div>
                <div><strong style={{ color: "var(--text-primary)" }}>Events Hosted</strong> 18</div>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {showComposer ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,16,10,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 200 }}>
          <div style={{ width: "min(680px, 100%)", background: "#fff", borderRadius: "24px", padding: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginTop: 0 }}>Create a post</h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
              <input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Title" style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }} />
              <textarea required value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="What would you like to share?" rows={5} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", resize: "vertical" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as CommunityPostType }))} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }}>
                  <option value="Question">Question</option>
                  <option value="Discussion">Discussion</option>
                  <option value="Resource">Resource</option>
                  <option value="Event">Event</option>
                  <option value="Announcement">Announcement</option>
                </select>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as CommunityCategory }))} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }}>
                  {communityCategories.filter((category) => category !== "Community").map((category) => (<option key={category} value={category}>{category}</option>))}
                </select>
              </div>
              {form.type === "Resource" ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  <input value={form.resourceUrl} onChange={(event) => setForm((current) => ({ ...current, resourceUrl: event.target.value }))} placeholder="Resource URL" style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }} />
                  <input value={form.resourceType} onChange={(event) => setForm((current) => ({ ...current, resourceType: event.target.value }))} placeholder="Resource type (PDF, Drive, Link)" style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }} />
                </div>
              ) : null}
              {form.type === "Event" ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  <input value={form.eventDate} onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))} placeholder="Event date" style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }} />
                  <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }} />
                  <input value={form.meetingLink} onChange={(event) => setForm((current) => ({ ...current, meetingLink: event.target.value }))} placeholder="Meeting link" style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }} />
                  <input value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} placeholder="Capacity" type="number" style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px" }} />
                </div>
              ) : null}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button type="button" onClick={() => setShowComposer(false)} style={{ border: "1px solid var(--border)", background: "#fff", padding: "10px 14px", borderRadius: "999px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ border: "none", background: "var(--primary)", color: "#fff", padding: "10px 14px", borderRadius: "999px", cursor: "pointer" }}>Publish</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
