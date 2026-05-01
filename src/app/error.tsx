"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: "500px" }}>
        <div style={{ fontSize: "5rem", marginBottom: "16px" }}>⚠️</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "24px", lineHeight: 1.7 }}>
          Kuch galat ho gaya. Please try again or go back to the homepage.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => reset()} className="btn btn-primary btn-lg">
            🔄 Try Again
          </button>
          <Link href="/" className="btn btn-outline btn-lg">
            🏠 Home
          </Link>
        </div>
      </div>
    </div>
  );
}
