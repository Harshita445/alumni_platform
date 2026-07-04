import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

interface AccessGateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  buttonLabel: string;
  onClick?: () => void;
  href?: string;
  buttonContent?: ReactNode;
}

export default function AccessGateCard({
  icon: Icon,
  title,
  description,
  bullets,
  buttonLabel,
  onClick,
  href,
  buttonContent,
}: AccessGateCardProps) {
  const content = (
    <>
      <div
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: "#EFE2D2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Icon size={40} color="#7A4B2E" />
      </div>

      <h1
        style={{
          fontSize: "40px",
          lineHeight: 1.08,
          marginBottom: "16px",
          color: "#2E1B12",
          fontFamily: "var(--font-heading), serif",
          letterSpacing: "-0.02em",
          textAlign: "center",
          width: "100%",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          fontSize: "18px",
          lineHeight: 1.7,
          color: "#6D5A4C",
          textAlign: "center",
          marginBottom: "24px",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {description}
      </p>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",
          maxWidth: "420px",
          marginBottom: "28px",
          paddingLeft: "24px",
        }}
      >
        {bullets.map((bullet) => (
          <li
            key={bullet}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              color: "#4D3A2F",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={16} color="#7A4B2E" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {buttonContent ?? (
        <button
          onClick={onClick}
          style={{
            width: "100%",
            height: "58px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #7A4B2E, #925B38)",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 600,
            boxShadow: "0 12px 28px rgba(122, 75, 46, 0.2)",
            transition: "transform 180ms ease, box-shadow 180ms ease",
            cursor: "pointer",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform = "translateY(-2px)";
            event.currentTarget.style.boxShadow =
              "0 16px 32px rgba(122, 75, 46, 0.24)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = "translateY(0)";
            event.currentTarget.style.boxShadow =
              "0 12px 28px rgba(122, 75, 46, 0.2)";
          }}
        >
          {buttonLabel}
        </button>
      )}
    </>
  );

  return (
    <main
      style={{
        minHeight: "calc(100vh - 180px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-70px",
          right: "-60px",
          width: "320px",
          height: "320px",
          backgroundImage:
            "radial-gradient(rgba(106, 68, 48, 0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-90px",
          left: "-90px",
          width: "360px",
          height: "360px",
          border: "1px solid rgba(106, 68, 48, 0.06)",
          borderTop: "none",
          borderRight: "none",
          borderRadius: "0 0 0 360px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <section
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "600px",
          minHeight: "420px",
          borderRadius: "28px",
          background: "#FBF7F2",
          border: "1px solid #E7D9CA",
          boxShadow: "0 20px 50px rgba(47, 33, 26, 0.08)",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {href ? (
          <a href={href} style={{ width: "100%" }}>
            {content}
          </a>
        ) : (
          content
        )}
      </section>
    </main>
  );
}
