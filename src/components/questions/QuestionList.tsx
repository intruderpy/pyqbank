"use client";

import { useState, useEffect } from "react";
import type { Question } from "@/types/database";
import { useLanguage } from "@/context/LanguageContext";
import QuestionActions from "./QuestionActions";
import "@/styles/questions.css";

type Mode = "qa" | "mcq" | "mock";
type Lang = "en" | "hi";

interface Props {
  questions: Question[];
  sessionLabel: string;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  hideLangToggle?: boolean; // kept for backwards compatibility but unused
}

export default function QuestionList({ questions, sessionLabel, onLoadMore, hasMore, loading }: Props) {
  const [mode, setMode] = useState<Mode>("qa");
  const { lang } = useLanguage();
  const [score, setScore] = useState({ correct: 0, attempted: 0 });
  const [mockIndex, setMockIndex] = useState(0);
  const [mockStarted, setMockStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // I9: Filter questions by difficulty
  const filteredQuestions = difficultyFilter === "all"
    ? questions
    : questions.filter((q) => q.difficulty === difficultyFilter);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === "mock" && mockStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit or finish logic here
            setMockStarted(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, mockStarted, timeLeft]);

  const startMockTest = (minutes: number) => {
    setScore({ correct: 0, attempted: 0 });
    setMockIndex(0);
    setTimeLeft(minutes * 60);
    setMockStarted(true);
  };

  // I13: Keyboard shortcuts for mock test mode
  useEffect(() => {
    if (mode !== "mock" || !mockStarted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setMockIndex(p => Math.min(filteredQuestions.length - 1, p + 1));
      if (e.key === "ArrowLeft") setMockIndex(p => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, mockStarted, filteredQuestions.length]);

  return (
    <div className="questions-wrapper">
      {/* ── Controls Bar ──────────────────────────────────── */}
      <div className="controls-bar">
        <div className="controls-left">
          <span className="session-label">{sessionLabel}</span>
          <span className="badge badge-primary">{filteredQuestions.length} Questions</span>
        </div>
        <div className="controls-right">
          {/* I9: Difficulty Filter */}
          <select
            className="toggle-btn"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "6px 10px", fontSize: "0.8rem", cursor: "pointer" }}
          >
            <option value="all">All Levels</option>
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
          {/* Mode Toggle */}
          <div className="toggle-group">
            <button
              className={`toggle-btn ${mode === "qa" ? "active" : ""}`}
              onClick={() => setMode("qa")}
            >📖 Study</button>
            <button
              className={`toggle-btn ${mode === "mcq" ? "active" : ""}`}
              onClick={() => setMode("mcq")}
            >🎯 Practice</button>
            <button
              className={`toggle-btn ${mode === "mock" ? "active" : ""}`}
              onClick={() => setMode("mock")}
            >⏱️ Mock Test</button>
          </div>
        </div>
      </div>

      {/* MCQ Score Bar */}
      {(mode === "mcq" || (mode === "mock" && mockStarted)) && (
        <div className="score-bar" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span>Score: <strong className="gradient-text">{score.correct}</strong> / {score.attempted}</span>
            {score.attempted > 0 && (
              <span className={`badge ${
                (score.correct / score.attempted) >= 0.7 ? "badge-success" : "badge-warning"
              }`} style={{ marginLeft: "12px" }}>
                {Math.round((score.correct / score.attempted) * 100)}% Accuracy
              </span>
            )}
          </div>
          {mode === "mock" && timeLeft > 0 && (
            <div style={{ color: timeLeft < 60 ? "var(--error)" : "var(--brand-primary)", fontWeight: "bold" }}>
              ⏳ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      )}

      {/* ── Question Cards ─────────────────────────────────── */}
      <div className="question-list">
        {mode === "mock" ? (
          !mockStarted ? (
            <div className="card" style={{ padding: "40px", textAlign: "center" }}>
              <h2>Start Mock Test</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
                Practice {filteredQuestions.length} questions in exam-like conditions.
              </p>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-outline" onClick={() => startMockTest(0)}>No Timer</button>
                <button className="btn btn-primary" onClick={() => startMockTest(10)}>10 Mins</button>
                <button className="btn btn-primary" onClick={() => startMockTest(20)}>20 Mins</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                <span>Question {mockIndex + 1} of {filteredQuestions.length}</span>
                <span style={{ cursor: "pointer", color: "var(--error)" }} onClick={() => setMockStarted(false)}>End Test</span>
              </div>
              <MCQCard
                key={filteredQuestions[mockIndex]?.id}
                question={filteredQuestions[mockIndex]}
                index={mockIndex}
                lang={lang}
                onAnswer={(isCorrect) =>
                  setScore((prev) => ({
                    correct: prev.correct + (isCorrect ? 1 : 0),
                    attempted: prev.attempted + 1,
                  }))
                }
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setMockIndex(p => Math.max(0, p - 1))}
                  disabled={mockIndex === 0}
                >← Previous</button>
                
                {mockIndex < filteredQuestions.length - 1 ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setMockIndex(p => Math.min(filteredQuestions.length - 1, p + 1))}
                  >Next →</button>
                ) : (
                  hasMore ? (
                    <button className="btn btn-primary" onClick={onLoadMore} disabled={loading}>Load More ↓</button>
                  ) : (
                    <button className="btn btn-outline" onClick={() => setMockStarted(false)}>Finish Review</button>
                  )
                )}
              </div>
            </div>
          )
        ) : (
          filteredQuestions.map((q, index) =>
            mode === "qa" ? (
              <QACard key={q.id} question={q} index={index} lang={lang} />
            ) : (
              <MCQCard
                key={q.id}
                question={q}
                index={index}
                lang={lang}
                onAnswer={(isCorrect) =>
                  setScore((prev) => ({
                    correct: prev.correct + (isCorrect ? 1 : 0),
                    attempted: prev.attempted + 1,
                  }))
                }
              />
            )
          )
        )}
      </div>

      {/* ── Load More ─────────────────────────────────────── */}
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <button
            id="load-more-btn"
            className="btn btn-outline btn-lg"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load 20 More Questions ↓"}
          </button>
        </div>
      )}
      {/* I15: Session Summary */}
      {!hasMore && filteredQuestions.length > 0 && score.attempted > 0 && (
        <div className="card" style={{ marginTop: "32px", padding: "24px", textAlign: "center" }}>
          <h3 style={{ marginBottom: "16px" }}>📊 Session Summary</h3>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
            <div><span style={{ fontSize: "1.5rem", fontWeight: 800 }} className="gradient-text">{score.attempted}</span><br /><span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Attempted</span></div>
            <div><span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--success)" }}>{score.correct}</span><br /><span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Correct</span></div>
            <div><span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--error)" }}>{score.attempted - score.correct}</span><br /><span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Wrong</span></div>
            <div><span style={{ fontSize: "1.5rem", fontWeight: 800 }} className="gradient-text">{score.attempted > 0 ? Math.round((score.correct / score.attempted) * 100) : 0}%</span><br /><span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Accuracy</span></div>
          </div>
        </div>
      )}

      {/* I8: Print Button */}
      {filteredQuestions.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()} style={{ opacity: 0.7 }}>
            🖨️ Print Questions
          </button>
        </div>
      )}
    </div>
  );
}

// ── Q&A Card ────────────────────────────────────────────────

function QACard({ question: q, index, lang }: { question: Question; index: number; lang: Lang }) {
  const [revealed, setRevealed] = useState(false);

  const text = lang === "hi" && q.question_text_hi ? q.question_text_hi : q.question_text_en;
  const explanation = lang === "hi" && q.explanation_hi ? q.explanation_hi : q.explanation_en;

  const answerMap = {
    a: lang === "hi" && q.option_a_hi ? q.option_a_hi : q.option_a_en,
    b: lang === "hi" && q.option_b_hi ? q.option_b_hi : q.option_b_en,
    c: lang === "hi" && q.option_c_hi ? q.option_c_hi : q.option_c_en,
    d: lang === "hi" && q.option_d_hi ? q.option_d_hi : q.option_d_en,
  };

  return (
    <div className="question-card card animate-fade-in" lang={lang === "hi" ? "hi" : "en"}>
      <div className="question-number">Q.{index + 1}</div>
      <p className="question-text">{text}</p>
      {q.image_url && (
        <img src={q.image_url} alt={`Question ${index + 1} diagram`} style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "12px", marginBottom: "12px" }} loading="lazy" />
      )}

      {!revealed ? (
        <button
          id={`reveal-btn-${q.id}`}
          className="reveal-btn btn btn-outline btn-sm"
          onClick={() => setRevealed(true)}
        >
          👁️ Reveal Answer
        </button>
      ) : (
        <div className="answer-reveal">
          <div className="correct-answer">
            <span className="answer-label">✅ Correct Answer:</span>
            <span className="answer-value">
              ({q.correct_option.toUpperCase()}) {answerMap[q.correct_option as keyof typeof answerMap]}
            </span>
          </div>
          {explanation && (
            <div className="explanation">
              <span className="explanation-label">💡 Explanation:</span>
              <p>{explanation}</p>
            </div>
          )}
          {q.difficulty && (
            <span className={`badge badge-${
              q.difficulty === "easy" ? "success" :
              q.difficulty === "medium" ? "warning" : "info"
            }`}>
              {q.difficulty === "easy" ? "🟢" : q.difficulty === "medium" ? "🟡" : "🔴"} {q.difficulty}
            </span>
          )}
        </div>
      )}
      <QuestionActions questionId={q.id} slug={q.slug} />
    </div>
  );
}

// ── MCQ Card ────────────────────────────────────────────────

const OPTION_CLASSES = ["opt-a", "opt-b", "opt-c", "opt-d"];

function MCQCard({
  question: q,
  index,
  lang,
  onAnswer,
}: {
  question: Question;
  index: number;
  lang: Lang;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const text = lang === "hi" && q.question_text_hi ? q.question_text_hi : q.question_text_en;
  const explanation = lang === "hi" && q.explanation_hi ? q.explanation_hi : q.explanation_en;

  const options = [
    { key: "a", text: lang === "hi" && q.option_a_hi ? q.option_a_hi : q.option_a_en },
    { key: "b", text: lang === "hi" && q.option_b_hi ? q.option_b_hi : q.option_b_en },
    { key: "c", text: lang === "hi" && q.option_c_hi ? q.option_c_hi : q.option_c_en },
    { key: "d", text: lang === "hi" && q.option_d_hi ? q.option_d_hi : q.option_d_en },
  ];

  const handleSelect = (key: string) => {
    if (selected) return; // already answered
    setSelected(key);
    onAnswer(key === q.correct_option);
  };

  const getOptionClass = (key: string, baseClass: string) => {
    if (!selected) return `mcq-option ${baseClass}`;
    if (key === q.correct_option) return `mcq-option ${baseClass} correct`;
    if (key === selected) return `mcq-option ${baseClass} wrong`;
    return `mcq-option ${baseClass} dimmed`;
  };

  return (
    <div className="question-card card animate-fade-in" lang={lang === "hi" ? "hi" : "en"}>
      <div className="question-number">Q.{index + 1}</div>
      <p className="question-text">{text}</p>

      <div className="mcq-options">
        {options.map(({ key, text: optText }, i) => (
          <button
            key={key}
            id={`q${q.id}-opt-${key}`}
            className={getOptionClass(key, OPTION_CLASSES[i])}
            onClick={() => handleSelect(key)}
            disabled={!!selected}
          >
            <span className="opt-label">{key.toUpperCase()}</span>
            <span className="opt-text">{optText}</span>
            {selected && key === q.correct_option && <span className="opt-icon">✅</span>}
            {selected && key === selected && key !== q.correct_option && <span className="opt-icon">❌</span>}
          </button>
        ))}
      </div>

      {selected && explanation && (
        <div className="explanation" style={{ marginTop: "16px" }}>
          <span className="explanation-label">💡 Explanation:</span>
          <p>{explanation}</p>
        </div>
      )}
      <QuestionActions questionId={q.id} slug={q.slug} />
    </div>
  );
}
