import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <main className="page">
      <div className="wrap narrow">
        <p className="eyebrow">админка</p>
        <h1>Вход в смену</h1>
        <p>Пароль задаётся в ADMIN_PASSWORD.</p>
        <LoginForm />
      </div>
    </main>
  );
}
