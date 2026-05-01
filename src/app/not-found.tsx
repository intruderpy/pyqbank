import Link from "next/link";
import "@/styles/browse.css";

export default function NotFound() {
  return (
    <main>
      <div className="container" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <div style={{ fontSize: "5rem", marginBottom: "16px" }}>📚</div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "12px" }}>
            <span className="gradient-text">404</span> — Page Not Found
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "32px", lineHeight: 1.7 }}>
            Ye page nahi mila. Ho sakta hai URL galat ho ya ye page hata diya gaya ho.
            <br />Neeche se browse karo:
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-primary btn-lg">
              🏠 Home
            </Link>
            <Link href="/exams" className="btn btn-outline btn-lg">
              🏛️ Browse Exams
            </Link>
            <Link href="/subjects" className="btn btn-outline btn-lg">
              📚 Browse Subjects
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
