"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(redirect);
      router.refresh();
    } else {
      setError("Galat password! Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="admin-body flex-between" style={{ justifyContent: 'center' }}>
      <div className="admin-container-sm w-full">
        <div className="admin-card p-8">
          <h1 className="text-white text-center mb-2" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⚙️ Admin Login</h1>
          <p className="text-muted text-center mb-4">PYQBank Dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="admin-form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="admin-input orange"
                style={{ padding: '0.75rem', fontSize: '1rem' }}
                autoFocus
              />
            </div>
            {error && (
              <div className="admin-alert error">
                ⚠️ {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="admin-btn admin-btn-primary admin-btn-lg"
            >
              {loading ? "Checking..." : "Login →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
