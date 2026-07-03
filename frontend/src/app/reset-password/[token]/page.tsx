import ResetForm from "./ResetForm";

type Props = { params: { token: string } };

export default function ResetPasswordPage({ params }: Props) {
  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 24 }}>
      <h1>Reset password</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        Enter a new password for your account.
      </p>

      <ResetForm token={params.token} />
    </main>
  );
}
