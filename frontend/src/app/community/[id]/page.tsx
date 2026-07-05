"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";

import { getCommunityPosts, type CommunityPost } from "@/lib/community";

export default function CommunityPostPage() {
  const params = useParams();
  const post = useMemo(() => {
    const posts = getCommunityPosts();
    return posts.find((item) => item.id === Number(params.id)) ?? null;
  }, [params.id]);

  if (!post) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fbf7f1 0%, #f4ebdf 100%)", padding: "40px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", background: "#fff", borderRadius: "24px", padding: "28px", border: "1px solid var(--border)" }}>
          <h1 style={{ marginTop: 0 }}>Post not found</h1>
          <p style={{ color: "var(--text-secondary)" }}>The requested community post could not be found.</p>
          <Link href="/community" style={{ color: "var(--primary)", fontWeight: 700 }}>Back to community</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fbf7f1 0%, #f4ebdf 100%)", padding: "40px 20px 72px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gap: "18px" }}>
        <Link href="/community" style={{ color: "var(--primary)", fontWeight: 700 }}>← Back to Community</Link>
        <article style={{ background: "#fff", borderRadius: "24px", border: "1px solid var(--border)", padding: "28px", boxShadow: "0 16px 40px rgba(81, 59, 34, 0.08)" }}>
          <p style={{ margin: 0, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>{post.type}</p>
          <h1 style={{ margin: "10px 0 12px", fontSize: "2rem" }}>{post.title}</h1>
          <div style={{ color: "var(--text-secondary)", marginBottom: "14px" }}>
            <strong style={{ color: "var(--text-primary)" }}>{post.authorName}</strong> • {post.authorRole} • {post.createdAt}
          </div>
          <p style={{ lineHeight: 1.75, color: "var(--text-secondary)" }}>{post.content}</p>
          {post.resourceUrl ? (
            <a href={post.resourceUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "12px", color: "var(--primary)", fontWeight: 700 }}>Open resource</a>
          ) : null}
          {post.meetingLink ? (
            <a href={post.meetingLink} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "8px", color: "var(--primary)", fontWeight: 700 }}>Join event</a>
          ) : null}
        </article>

        <section style={{ background: "#fff", borderRadius: "24px", border: "1px solid var(--border)", padding: "28px" }}>
          <h2 style={{ marginTop: 0 }}>Replies</h2>
          {(post.comments || []).length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No replies yet. Be the first to contribute.</p>
          ) : (
            (post.comments || []).map((reply) => (
              <div key={reply.id} style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "14px" }}>
                <div style={{ fontWeight: 700 }}>{reply.authorName}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "8px" }}>{reply.createdAt}</div>
                <p style={{ margin: 0, lineHeight: 1.7, color: "var(--text-secondary)" }}>{reply.content}</p>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
