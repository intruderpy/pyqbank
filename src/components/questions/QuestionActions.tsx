"use client";

import { useState, useEffect } from "react";

export default function QuestionActions({ questionId, slug }: { questionId: number, slug: string | undefined | null }) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pyq_bookmarks") || "[]");
    setBookmarked(saved.includes(questionId));
  }, [questionId]);

  const toggleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem("pyq_bookmarks") || "[]");
    let newSaved;
    if (saved.includes(questionId)) {
      newSaved = saved.filter((id: number) => id !== questionId);
      setBookmarked(false);
    } else {
      newSaved = [...saved, questionId];
      setBookmarked(true);
    }
    localStorage.setItem("pyq_bookmarks", JSON.stringify(newSaved));
  };

  const handleShare = async () => {
    if (!slug) return;
    const url = `${window.location.origin}/question/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Practice this PYQ",
          text: "Check out this previous year question!",
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "flex-end" }}>
      <button 
        className="btn btn-sm" 
        style={{ background: "transparent", border: "1px solid var(--border-default)", color: bookmarked ? "var(--brand-accent)" : "var(--text-secondary)", cursor: "pointer", padding: "6px 12px", borderRadius: "6px" }}
        onClick={toggleBookmark}
      >
        {bookmarked ? "📌 Saved" : "📍 Save"}
      </button>
      {slug && (
        <button 
          className="btn btn-sm" 
          style={{ background: "transparent", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", padding: "6px 12px", borderRadius: "6px" }}
          onClick={handleShare}
        >
          📤 Share
        </button>
      )}
    </div>
  );
}
