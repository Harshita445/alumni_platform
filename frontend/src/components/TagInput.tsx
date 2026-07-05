"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

export type TagInputProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  description?: string;
  error?: string | null;
  maxItems?: number;
};

export default function TagInput({
  label,
  value,
  onChange,
  placeholder = "Type and press Enter",
  description,
  error,
  maxItems,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = (rawValue: string) => {
    const nextValue = rawValue.trim();

    if (!nextValue) {
      return;
    }

    if (value.includes(nextValue)) {
      setDraft("");
      return;
    }

    if (maxItems && value.length >= maxItems) {
      setDraft("");
      return;
    }

    onChange([...value, nextValue]);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    }

    if (event.key === "Backspace" && !draft && value.length) {
      const updated = value.slice(0, -1);
      onChange(updated);
    }
  };

  const handleBlur = () => {
    if (draft.trim()) {
      addTag(draft);
    }
  };

  const helperText = useMemo(() => {
    if (error) {
      return error;
    }

    return description || "Press Enter or comma to add a tag.";
  }, [description, error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontWeight: 600, color: "var(--text-primary)" }}>{label}</label>

      <div
        style={{
          border: error ? "1px solid var(--danger)" : "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "10px 12px",
          background: "var(--background)",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {value.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              borderRadius: "999px",
              border: "1px solid rgba(122,75,46,0.24)",
              background: "rgba(122,75,46,0.12)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            <span>{tag}</span>
            <span aria-hidden="true">×</span>
          </button>
        ))}

        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            flex: 1,
            minWidth: "140px",
          }}
        />
      </div>

      <p style={{ margin: 0, fontSize: "13px", color: error ? "var(--danger)" : "var(--text-secondary)" }}>
        {helperText}
      </p>
    </div>
  );
}
