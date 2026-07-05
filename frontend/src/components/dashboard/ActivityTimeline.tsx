"use client";

type ActivityItem = {
  title: string;
  detail: string;
  time: string;
};

type ActivityTimelineProps = {
  items: ActivityItem[];
};

export default function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "999px",
              background: "var(--accent)",
              marginTop: "7px",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <strong>{item.title}</strong>
              <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{item.time}</span>
            </div>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)" }}>{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
