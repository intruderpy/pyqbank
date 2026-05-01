"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const pathname = usePathname();
  const { lang, toggleLang } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // I7: Persist theme preference
  useEffect(() => {
    const saved = localStorage.getItem("pyq_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("pyq_theme", next);
  };

  // Don't render global navbar on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <span>📚</span><span className="gradient-text">PYQBank</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-links">
            <SearchBar />
            <Link href="/exams" className={`nav-link ${pathname?.startsWith("/exams") ? "active" : ""}`}>
              Exams
            </Link>
            <Link href="/subjects" className={`nav-link ${pathname?.startsWith("/subjects") ? "active" : ""}`}>
              Subjects
            </Link>
            <Link href="/random" className={`nav-link ${pathname?.startsWith("/random") ? "active" : ""}`}>
              🎲 Random
            </Link>
            <Link href="/bookmarks" className={`nav-link ${pathname?.startsWith("/bookmarks") ? "active" : ""}`}>
              📌 Saved
            </Link>
            <button className="lang-toggle" onClick={toggleLang}>
              {lang === "en" ? "🇮🇳 हिंदी" : "🇬🇧 English"}
            </button>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="mobile-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button className="lang-toggle mobile-only" onClick={toggleLang}>
              {lang === "en" ? "हिं" : "EN"}
            </button>
            <button 
              className="hamburger" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="navbar-logo">📚 <span className="gradient-text">PYQBank</span></span>
              <button className="close-menu" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>
            
            <div className="mobile-menu-content">
              <div className="mobile-search-container">
                <SearchBar />
              </div>
              
              <Link href="/" className={`mobile-link ${pathname === "/" ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>
                🏠 Home
              </Link>
              <Link href="/exams" className={`mobile-link ${pathname?.startsWith("/exams") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>
                🏛️ Exams
              </Link>
              <Link href="/subjects" className={`mobile-link ${pathname?.startsWith("/subjects") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>
                📚 Subjects
              </Link>
              <Link href="/random" className={`mobile-link ${pathname?.startsWith("/random") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>
                🎲 Random Practice
              </Link>
              <Link href="/bookmarks" className={`mobile-link ${pathname?.startsWith("/bookmarks") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>
                📌 Saved Questions
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
