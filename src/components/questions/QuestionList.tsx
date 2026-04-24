"use client";

import { useState } from "react";
import type { Question } from "@/types/database";
import "@/styles/questions.css";

type Mode = "qa" | "mcq";
type Lang = "en" | "hi";

interface Props {
  questions: Question[];
  sessionLabel: string;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export default function QuestionList({ questions, sessionLabel, onLoadMore, hasMore, loading }: Props) {
  const [mode, setMode] = useState<Mode>("qa");
  const [lang, setLang] = useState<Lang>("en");
  const [score, setScore] = useState({ correct: 0, attempted: 0 });

  return (
    <div className="questions-wrapper">
      {/* ── Controls Bar ──────────────────────────────────── */}
      <div className="controls-bar">
        <div className="controls-left">
          <span className="session-label">{sessionLabel}</span>
          <span className="badge badge-primary">{questions.length} Questions</span>
        </div>
        <div className="controls-right">
          {/* Language Toggle */}
          <div className="toggle-group">
            <button
              id="lang-en-btn"
              className={`toggle-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
            >EN</button>
            <button
              id="lang-hi-btn"
              className={`toggle-btn ${lang === "hi" ? "active" : ""}`}
              onClick={() => setLang("hi")}
            >हिं</button>
          </div>
          {/* Mode Toggle */}
          <div className="toggle-group">
            <button
              id="mode-qa-btn"
              className={`toggle-btn ${mode === "qa" ? "active" : ""}`}
              onClick={() => setMode("qa")}
            >📖 Q&amp;A</button>
            <button
              id="mode-mcq-btn"
              className={`toggle-btn ${mode === "mcq" ? "active" : ""}`}
              onClick={() => { setMode("mcq"); setScore({ correct: 0, attempted: 0 }); }}
            >🎯 Quiz</button>
          </div>
        </div>
      </div>

      {/* MCQ Score Bar */}
      {mode === "mcq" && (
        <div className="score-bar">
          <span>Score: <strong className="gradient-text">{score.correct}</strong> / {score.attempted}</span>
          {score.attempted > 0 && (
            <span className={`badge ${
              (score.correct / score.attempted) >= 0.7 ? "badge-success" : "badge-warning"
            }`}>
              {Math.round((score.correct / score.attempted) * 100)}% Accuracy
            </span>
          )}
        </div>
      )}

      {/* ── Question Cards ─────────────────────────────────── */}
      <div className="question-list">
        {questions.map((q, index) =>
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
      {!hasMore && questions.length > 0 && (
        <p style={{ textAlign: "center", marginTop: "32px", color: "var(--text-muted)" }}>
          ✅ All questions loaded
        </p>
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
    </div>
  );
}

// ── MCQ Card ────────────────────────────────────────────────

const OPTION_LABELS = ["a", "b", "c", "d"] as const;
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
    </div>
  );
}
