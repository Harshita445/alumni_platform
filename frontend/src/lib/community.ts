export type CommunityPostType = "Question" | "Discussion" | "Event" | "Announcement" | "Opportunity" | "Resource";
export type CommunityCategory =
  | "Academics"
  | "Career Guidance"
  | "Placements"
  | "Internships"
  | "Higher Studies"
  | "Product Management"
  | "Software Engineering"
  | "Data Science"
  | "Consulting"
  | "Entrepreneurship"
  | "Resume Reviews"
  | "Interview Preparation"
  | "Campus"
  | "Networking"
  | "Technology"
  | "General"
  | "Community";

export type CommunityReactionType = "Helpful" | "Useful" | "Celebrate" | "Insightful";

export type CommunityAttachment = {
  id: number;
  name: string;
  url: string;
  type: "image" | "pdf" | "resume" | "link";
};

export type CommunityReply = {
  id: number;
  authorName: string;
  role: "student" | "alumni" | "admin";
  content: string;
  createdAt: string;
  replies?: CommunityReply[];
  mentions?: string[];
  isEdited?: boolean;
};

export type CommunityComment = CommunityReply;

export type CommunityReportReason = "Spam" | "Harassment" | "Offensive" | "Misinformation" | "Other";

export type CommunityReport = {
  id: number;
  targetType: "post" | "comment";
  targetId: number;
  reason: CommunityReportReason;
  reportedBy: string;
  createdAt: string;
};

export type CommunityNotification = {
  id: number;
  type: "reply" | "mention" | "reaction" | "announcement" | "event" | "bookmark";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

export type CommunityPost = {
  id: number;
  title: string;
  content: string;
  type: CommunityPostType;
  category: CommunityCategory;
  authorName: string;
  authorRole: "student" | "alumni" | "admin";
  authorCompany?: string;
  graduationYear?: number;
  createdAt: string;
  comments: CommunityComment[];
  replies?: CommunityReply[];
  reactions: Record<CommunityReactionType, number>;
  userReaction?: CommunityReactionType | null;
  isPinned?: boolean;
  isLocked?: boolean;
  isArchived?: boolean;
  isHidden?: boolean;
  isAdminAnnouncement?: boolean;
  tags?: string[];
  attachments?: CommunityAttachment[];
  resourceUrl?: string;
  resourceType?: string;
  eventDate?: string;
  location?: string;
  meetingLink?: string;
  registrationLink?: string;
  capacity?: number;
  registeredCount?: number;
  repliesCount?: number;
  viewCount?: number;
  bookmarkedBy?: string[];
  company?: string;
  deadline?: string;
  applicationLink?: string;
  reportCount?: number;
};

const COMMUNITY_STORAGE_KEY = "alumly-community-posts";
const COMMUNITY_NOTIFICATIONS_KEY = "alumly-community-notifications";
const COMMUNITY_REPORTS_KEY = "alumly-community-reports";

export const communityCategories: CommunityCategory[] = [
  "Academics",
  "Career Guidance",
  "Placements",
  "Internships",
  "Higher Studies",
  "Product Management",
  "Software Engineering",
  "Data Science",
  "Consulting",
  "Entrepreneurship",
  "Resume Reviews",
  "Interview Preparation",
  "Campus",
  "Networking",
  "Technology",
  "General",
];

export const communityTags = ["React", "AI", "Google", "Internship", "Resume", "Backend", "Finance", "Product", "Placement", "Research"];

export type CommunitySortOption = "Latest" | "Trending" | "Most Liked" | "Most Commented" | "Newest" | "Oldest";

export const communitySeedPosts: CommunityPost[] = [
  {
    id: 1,
    title: "How should I prepare for Google STEP interviews?",
    content:
      "I am a final-year CS student and want to improve my confidence for the Google STEP process. I would love a few practical tips on DSA, system design, and how to structure my stories.",
    type: "Question",
    category: "Software Engineering",
    authorName: "Harshita",
    authorRole: "student",
    createdAt: "2 hours ago",
    comments: [
      {
        id: 101,
        authorName: "Aman Gupta",
        role: "alumni",
        content:
          "Focus on arrays, graphs, and dynamic programming first. Practice explaining your approach out loud like you would in an interview.",
        createdAt: "1 hour ago",
        replies: [],
      },
    ],
    reactions: { Helpful: 18, Useful: 11, Celebrate: 4, Insightful: 2 },
    repliesCount: 12,
    tags: ["Google", "Interview", "Backend"],
    viewCount: 184,
  },
  {
    id: 2,
    title: "Transitioning from Mechanical Engineering to Product Management",
    content:
      "I am exploring the shift from core engineering to product roles and would love to hear from alumni who made a similar change.",
    type: "Discussion",
    category: "Product Management",
    authorName: "Rahul",
    authorRole: "student",
    createdAt: "1 day ago",
    comments: [
      {
        id: 201,
        authorName: "Nisha Rao",
        role: "alumni",
        content:
          "A strong portfolio of case studies and product thinking helped me make the transition. Start small with a side project and document your decisions.",
        createdAt: "12 hours ago",
        replies: [],
      },
    ],
    reactions: { Helpful: 26, Useful: 15, Celebrate: 6, Insightful: 7 },
    repliesCount: 25,
    isPinned: true,
    tags: ["Product", "Career"],
    viewCount: 312,
  },
  {
    id: 3,
    title: "5 Things I Wish I Knew Before My First Internship",
    content:
      "A short guide based on my first internship experience at Google and what helped me stand out from day one.",
    type: "Opportunity",
    category: "Internships",
    authorName: "Aman Gupta",
    authorRole: "alumni",
    createdAt: "3 days ago",
    comments: [],
    reactions: { Helpful: 42, Useful: 20, Celebrate: 11, Insightful: 6 },
    repliesCount: 8,
    company: "Google",
    location: "Bengaluru",
    deadline: "July 20, 2026",
    applicationLink: "https://example.com/google-internship",
    tags: ["Internship", "Google"],
    viewCount: 98,
  },
  {
    id: 4,
    title: "Ultimate DSA Preparation Roadmap",
    content:
      "A free resource with weekly milestones for students preparing for internships and placements.",
    type: "Resource",
    category: "Software Engineering",
    authorName: "Alumni Desk",
    authorRole: "alumni",
    createdAt: "4 days ago",
    comments: [],
    reactions: { Helpful: 33, Useful: 18, Celebrate: 7, Insightful: 5 },
    repliesCount: 3,
    resourceUrl: "https://example.com/dsa-roadmap",
    resourceType: "PDF",
    tags: ["Resume", "Backend"],
    viewCount: 256,
  },
  {
    id: 5,
    title: "Google Alumni AMA",
    content:
      "Join us for a live AMA with senior engineers from Google on preparation, internships, and career conversations.",
    type: "Event",
    category: "Career Guidance",
    authorName: "Rahul Sharma",
    authorRole: "alumni",
    createdAt: "Today",
    comments: [],
    reactions: { Helpful: 15, Useful: 10, Celebrate: 2, Insightful: 4 },
    repliesCount: 6,
    eventDate: "July 28",
    location: "Online • Zoom",
    meetingLink: "https://meet.example.com/google-ama",
    registrationLink: "https://example.com/register-ama",
    capacity: 120,
    registeredCount: 45,
    tags: ["AI", "Networking"],
    viewCount: 176,
  },
  {
    id: 6,
    title: "Thapar Alumni Meet 2026",
    content:
      "The annual gathering for alumni, students, and mentors will open registration next week. Stay tuned for speaker announcements.",
    type: "Announcement",
    category: "Community",
    authorName: "Admin Team",
    authorRole: "admin",
    createdAt: "1 week ago",
    comments: [],
    reactions: { Helpful: 12, Useful: 6, Celebrate: 3, Insightful: 1 },
    repliesCount: 2,
    isPinned: true,
    isAdminAnnouncement: true,
    tags: ["Platform"],
    viewCount: 342,
  },
];

export function getCommunityPosts(): CommunityPost[] {
  if (typeof window === "undefined") {
    return communitySeedPosts;
  }

  try {
    const stored = window.localStorage.getItem(COMMUNITY_STORAGE_KEY);

    if (!stored) {
      window.localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(communitySeedPosts));
      return communitySeedPosts;
    }

    const parsed = JSON.parse(stored) as CommunityPost[];
    return parsed.map((post) => ({
      ...post,
      comments: post.comments || [],
      reactions: post.reactions || { Helpful: 0, Useful: 0, Celebrate: 0, Insightful: 0 },
      tags: post.tags || [],
      attachments: post.attachments || [],
    }));
  } catch {
    return communitySeedPosts;
  }
}

export function saveCommunityPosts(posts: CommunityPost[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(posts));
}

export function getCommunityNotifications(): CommunityNotification[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(COMMUNITY_NOTIFICATIONS_KEY);
    return stored ? (JSON.parse(stored) as CommunityNotification[]) : [];
  } catch {
    return [];
  }
}

export function saveCommunityNotifications(notifications: CommunityNotification[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMMUNITY_NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function createCommunityNotification(
  notification: Omit<CommunityNotification, "id" | "createdAt" | "isRead">
): CommunityNotification {
  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    isRead: false,
    ...notification,
  };
}

export function getCommunityReports(): CommunityReport[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(COMMUNITY_REPORTS_KEY);
    return stored ? (JSON.parse(stored) as CommunityReport[]) : [];
  } catch {
    return [];
  }
}

export function saveCommunityReports(reports: CommunityReport[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COMMUNITY_REPORTS_KEY, JSON.stringify(reports));
}

export function sortCommunityPosts(posts: CommunityPost[], sortBy: CommunitySortOption): CommunityPost[] {
  const nextPosts = [...posts];

  return nextPosts.sort((a, b) => {
    if (sortBy === "Most Liked") {
      return (Object.values(b.reactions).reduce((sum, value) => sum + value, 0)) - (Object.values(a.reactions).reduce((sum, value) => sum + value, 0));
    }
    if (sortBy === "Most Commented") {
      return (b.repliesCount ?? b.comments.length) - (a.repliesCount ?? a.comments.length);
    }
    if (sortBy === "Oldest") {
      return a.id - b.id;
    }
    if (sortBy === "Trending") {
      return (b.viewCount ?? 0) - (a.viewCount ?? 0);
    }
    if (sortBy === "Latest" || sortBy === "Newest") {
      return b.id - a.id;
    }
    return 0;
  });
}

export function addCommunityComment(
  posts: CommunityPost[],
  postId: number,
  content: string,
  authorName: string,
  authorRole: "student" | "alumni" | "admin",
  parentId?: number,
  mentions: string[] = []
): CommunityPost[] {
  return posts.map((post) => {
    if (post.id !== postId) {
      return post;
    }

    const createComment = (): CommunityComment => ({
      id: Date.now(),
      authorName,
      role: authorRole,
      content,
      createdAt: "just now",
      replies: [],
      mentions,
      isEdited: false,
    });

    const appendReply = (comments: CommunityComment[]): CommunityComment[] =>
      comments.map((comment) => {
        if (comment.id === parentId) {
          return { ...comment, replies: [...(comment.replies || []), createComment()] };
        }

        return { ...comment, replies: appendReply(comment.replies || []) };
      });

    const nextComments = parentId ? appendReply(post.comments) : [...post.comments, createComment()];
    const countReplies = (comments: CommunityComment[]): number =>
      comments.reduce((total, comment) => total + 1 + countReplies(comment.replies || []), 0);

    return {
      ...post,
      comments: nextComments,
      repliesCount: countReplies(nextComments),
    };
  });
}

export function toggleCommunityReaction(
  posts: CommunityPost[],
  postId: number,
  reaction: CommunityReactionType,
  currentReaction?: CommunityReactionType | null
): CommunityPost[] {
  return posts.map((post) => {
    if (post.id !== postId) {
      return post;
    }

    const nextReactions = { ...post.reactions };
    const previousReaction = currentReaction ?? post.userReaction;

    if (previousReaction && previousReaction !== reaction) {
      nextReactions[previousReaction] = Math.max(0, (nextReactions[previousReaction] || 0) - 1);
    }

    if (previousReaction === reaction) {
      nextReactions[reaction] = Math.max(0, (nextReactions[reaction] || 0) - 1);
      return { ...post, reactions: nextReactions, userReaction: null };
    }

    nextReactions[reaction] = (nextReactions[reaction] || 0) + 1;
    return { ...post, reactions: nextReactions, userReaction: reaction };
  });
}

export function toggleCommunityBookmark(posts: CommunityPost[], postId: number, userKey: string): CommunityPost[] {
  return posts.map((post) => {
    if (post.id !== postId) {
      return post;
    }

    const currentBookmarks = post.bookmarkedBy || [];
    const nextBookmarks = currentBookmarks.includes(userKey)
      ? currentBookmarks.filter((item) => item !== userKey)
      : [...currentBookmarks, userKey];

    return { ...post, bookmarkedBy: nextBookmarks };
  });
}
