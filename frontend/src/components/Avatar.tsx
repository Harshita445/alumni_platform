type AvatarProps = {
  name: string;
};

export default function Avatar({ name }: AvatarProps) {
  return (
    <div
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "var(--surface-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-primary)",
        fontWeight: 600,
      }}
    >
      {name.charAt(0)}
    </div>
  );
}