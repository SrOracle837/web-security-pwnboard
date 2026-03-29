"use client";

import { useEffect, useState, useCallback } from "react";
import FormattedText from "@/components/FormattedText";

interface QuizQuestion {
  id: string;
  topic: string;
  type: string;
  difficulty: string;
  question: string;
  options?: { [key: string]: string }[];
  answer: string;
  explanation: string;
}

interface TopicDef { name: string; }

interface APIData {
  player: {
    quiz_state: {
      questions: Record<string, { ef: number; next_review: string | null }>;
    };
    stats: { total_quizzes: number };
  };
  skillTree: { topics: Record<string, TopicDef> };
  quizBank: { questions: QuizQuestion[] };
}

type Phase = "setup" | "question" | "answer" | "summary";

export default function QuizPage() {
  const [data, setData] = useState<APIData | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [results, setResults] = useState<{ questionId: string; correct: boolean; xp: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [copiedExplain, setCopiedExplain] = useState(false);

  function copyExplainPrompt(q: QuizQuestion) {
    const topicName = data?.skillTree.topics[q.topic]?.name ?? q.topic;
    const prompt = `I got this web security quiz question wrong and want to understand it deeply.\n\nTopic: ${topicName}\nQuestion: ${q.question}\nCorrect answer: ${q.answer}\n\nExplain why the correct answer is right, why each wrong answer fails, and give me a real-world example of this vulnerability. Help me build intuition so I don't get this wrong again.`;
    navigator.clipboard.writeText(prompt);
    window.open("https://claude.ai/new", "_blank");
    setCopiedExplain(true);
    setTimeout(() => setCopiedExplain(false), 2000);
  }

  const fetchData = useCallback(() => {
    fetch("/api/state").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function startQuiz() {
    if (!data) return;
    let pool = data.quizBank.questions;
    if (selectedTopic !== "all") pool = pool.filter((q) => q.topic === selectedTopic);

    const todayStr = new Date().toISOString().split("T")[0];
    const qs = data.player.quiz_state.questions;
    const due = pool.filter((q) => qs[q.id]?.next_review && qs[q.id].next_review! <= todayStr);
    const fresh = pool.filter((q) => !qs[q.id]);
    const rest = pool.filter((q) => !due.includes(q) && !fresh.includes(q));
    const ordered = [...due, ...fresh, ...rest];
    const shuffled = ordered.slice(0, Math.max(questionCount * 2, 20));
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQuestions(shuffled.slice(0, questionCount));
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setResults([]);
    setPhase("question");
  }

  async function submitAnswer() {
    if (!selectedAnswer || submitting) return;
    setSubmitting(true);
    const q = questions[currentIdx];
    const correct = selectedAnswer === q.answer;
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, quality: correct ? 4 : 1 }),
      });
      const json = await res.json();
      setResults((prev) => [...prev, { questionId: q.id, correct, xp: json.result?.xpEarned ?? 0 }]);
    } catch {
      setResults((prev) => [...prev, { questionId: q.id, correct, xp: 0 }]);
    }
    setSubmitting(false);
    setPhase("answer");
  }

  function nextQuestion() {
    if (currentIdx + 1 >= questions.length) { setPhase("summary"); fetchData(); }
    else { setCurrentIdx(currentIdx + 1); setSelectedAnswer(null); setPhase("question"); }
  }

  if (!data) return <div className="flex items-center justify-center h-full text-muted">Loading...</div>;

  const topics = data.skillTree.topics;
  const quizTopics = [...new Set(data.quizBank.questions.map((q) => q.topic))];

  // SETUP
  if (phase === "setup") {
    const dueCount = Object.values(data.player.quiz_state.questions).filter(
      (q) => q.next_review && q.next_review <= new Date().toISOString().split("T")[0]
    ).length;

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Quiz</h1>
          <p className="text-sm text-muted mt-0.5">Test your knowledge with spaced repetition</p>
        </div>

        <div className="bg-card rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-xs text-muted block mb-1.5">Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              <option value="all">All Topics (prioritizes weak areas)</option>
              {quizTopics.sort().map((t) => <option key={t} value={t}>{topics[t]?.name ?? t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1.5">Questions</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`text-sm px-4 py-2 rounded-lg transition-all ${
                    questionCount === n
                      ? "bg-accent text-white"
                      : "bg-subtle text-muted hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full text-sm py-3 bg-accent text-white rounded-xl hover:bg-accent-light transition-colors font-medium"
          >
            Start Quiz
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-success">{data.player.stats.total_quizzes}</div>
            <div className="text-[11px] text-muted">Answered</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-accent">
              {Object.values(data.player.quiz_state.questions).filter((q) => q.ef > 2.5).length}
            </div>
            <div className="text-[11px] text-muted">Mastered</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-warn">{dueCount}</div>
            <div className="text-[11px] text-muted">Due</div>
          </div>
        </div>
      </div>
    );
  }

  // QUESTION
  if (phase === "question") {
    const q = questions[currentIdx];
    const optionEntries: [string, string][] = [];
    if (q.options) {
      for (const opt of q.options) {
        for (const [key, val] of Object.entries(opt)) optionEntries.push([key, val]);
      }
    }

    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{currentIdx + 1}/{questions.length}</span>
          <div className="flex-1 bg-subtle rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>
          <span className="text-xs text-muted">{topics[q.topic]?.name ?? q.topic}</span>
        </div>

        <div className="bg-card rounded-2xl p-6">
          <div className="flex gap-2 mb-4">
            <span className="text-[10px] font-medium px-2 py-0.5 bg-accent/10 text-accent rounded-full">{q.type}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 bg-subtle text-muted rounded-full">{q.difficulty}</span>
          </div>

          <div className="text-sm text-foreground leading-relaxed mb-5">
            <FormattedText text={q.question} />
          </div>

          <div className="space-y-2">
            {optionEntries.map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelectedAnswer(key)}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all border ${
                  selectedAnswer === key
                    ? "bg-accent/10 border-accent text-foreground"
                    : "bg-card border-border text-foreground hover:border-accent/40 hover:bg-accent/5"
                }`}
              >
                <span className="font-medium text-accent mr-2">{key.toUpperCase()}.</span>
                <FormattedText text={val} />
              </button>
            ))}
          </div>

          <button
            onClick={submitAnswer}
            disabled={!selectedAnswer || submitting}
            className="w-full mt-5 text-sm py-3 bg-accent text-white rounded-xl hover:bg-accent-light transition-colors disabled:opacity-30 font-medium"
          >
            {submitting ? "Checking..." : "Submit"}
          </button>
        </div>
      </div>
    );
  }

  // ANSWER
  if (phase === "answer") {
    const q = questions[currentIdx];
    const lastResult = results[results.length - 1];
    const correct = lastResult?.correct ?? false;
    const optionEntries: [string, string][] = [];
    if (q.options) {
      for (const opt of q.options) {
        for (const [key, val] of Object.entries(opt)) optionEntries.push([key, val]);
      }
    }

    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{currentIdx + 1}/{questions.length}</span>
          <div className="flex-1 bg-subtle rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className={`bg-card rounded-2xl p-6 ${correct ? "ring-1 ring-success/30" : "ring-1 ring-danger/30"}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-sm font-medium ${correct ? "text-success" : "text-danger"}`}>
              {correct ? "\u2713 Correct" : "\u2717 Incorrect"}
            </span>
            {correct && <span className="text-xs text-success">+{lastResult?.xp ?? 25} XP</span>}
          </div>

          <div className="text-sm text-foreground mb-4">
            <FormattedText text={q.question} />
          </div>

          <div className="space-y-2 mb-5">
            {optionEntries.map(([key, val]) => (
              <div
                key={key}
                className={`px-4 py-2.5 rounded-xl text-sm ${
                  key === q.answer
                    ? "bg-success/10 text-success ring-1 ring-success/20"
                    : key === selectedAnswer && !correct
                    ? "bg-danger/10 text-danger line-through"
                    : "bg-subtle text-muted"
                }`}
              >
                <span className="font-medium mr-2">{key.toUpperCase()}.</span>
                <FormattedText text={val} />
              </div>
            ))}
          </div>

          <div className="bg-background rounded-xl p-4">
            <p className="text-xs font-medium text-accent mb-1">Explanation</p>
            <div className="text-xs text-muted leading-relaxed">
              <FormattedText text={q.explanation} />
            </div>
          </div>

          {!correct && (
            <button
              onClick={() => copyExplainPrompt(q)}
              className="w-full mt-3 text-xs py-2.5 text-muted border border-border rounded-xl hover:border-accent/30 hover:text-foreground transition-all"
            >
              {copiedExplain ? "Copied! Paste in Claude to learn more" : "Ask AI to explain this deeper"}
            </button>
          )}

          <button
            onClick={nextQuestion}
            className={`w-full ${!correct ? "mt-2" : "mt-5"} text-sm py-3 bg-accent text-white rounded-xl hover:bg-accent-light transition-colors font-medium`}
          >
            {currentIdx + 1 >= questions.length ? "See Results" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  // SUMMARY
  if (phase === "summary") {
    const correctCount = results.filter((r) => r.correct).length;
    const totalXP = results.reduce((s, r) => s + r.xp, 0);
    const percent = Math.round((correctCount / results.length) * 100);

    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className={`bg-card rounded-2xl p-8 text-center ${percent >= 80 ? "ring-1 ring-success/20" : ""}`}>
          <h2 className="text-lg font-semibold text-foreground mb-6">Quiz Complete</h2>

          <div className="flex justify-center gap-10 mb-6">
            <div>
              <div className={`text-3xl font-bold ${percent >= 80 ? "text-success" : percent >= 50 ? "text-accent" : "text-warn"}`}>{percent}%</div>
              <div className="text-xs text-muted mt-1">Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{correctCount}/{results.length}</div>
              <div className="text-xs text-muted mt-1">Correct</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">+{totalXP}</div>
              <div className="text-xs text-muted mt-1">XP</div>
            </div>
          </div>

          <button
            onClick={() => { setPhase("setup"); fetchData(); }}
            className="text-sm px-8 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-light transition-colors font-medium"
          >
            New Quiz
          </button>
        </div>

        <div className="bg-card rounded-2xl p-5">
          <p className="text-xs text-muted mb-3">Breakdown</p>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={r.correct ? "text-success" : "text-danger"}>{r.correct ? "\u2713" : "\u2717"}</span>
                <span className="text-muted flex-1 truncate text-xs">{questions[i]?.question?.slice(0, 60)}...</span>
                {r.correct && <span className="text-xs text-success">+{r.xp}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
