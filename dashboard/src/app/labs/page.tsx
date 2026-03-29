"use client";

import { useEffect, useState, useCallback } from "react";

interface Lab {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  url?: string;
}

interface TopicDef {
  name: string;
  category: string;
}

interface APIData {
  player: {
    progress: Record<
      string,
      {
        apprentice?: { completed: string[] };
        practitioner?: { completed: string[] };
        expert?: { completed: string[] };
      }
    >;
  };
  skillTree: { topics: Record<string, TopicDef> };
  labCatalog: { labs: Lab[] };
}

const diffBadge: Record<string, string> = {
  apprentice: "bg-success/10 text-success",
  practitioner: "bg-accent/10 text-accent",
  expert: "bg-danger/10 text-danger",
};

export default function LabsPage() {
  const [data, setData] = useState<APIData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDiff, setSelectedDiff] = useState("all");
  const [showCompleted, setShowCompleted] = useState(true);
  const [logging, setLogging] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" } | null>(null);

  const fetchData = useCallback(() => {
    fetch("/api/state").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completedSet = new Set<string>();
  if (data) {
    for (const tp of Object.values(data.player.progress)) {
      for (const diff of ["apprentice", "practitioner", "expert"] as const) {
        for (const id of tp[diff]?.completed ?? []) completedSet.add(id);
      }
    }
  }

  async function handleLog(labId: string) {
    setLogging(labId);
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labId }),
      });
      const json = await res.json();
      if (res.ok) {
        const r = json.result;
        let msg = `+${r.xpEarned} XP`;
        if (r.streakMultiplier > 1) msg += ` (${r.streakMultiplier}x streak)`;
        if (r.leveledUp) msg += ` \u2014 Level up! ${r.newTitle}`;
        if (r.newAchievements.length > 0) msg += ` \u2014 ${r.newAchievements.length} badge(s)!`;
        setToast({ msg, type: "success" });
        fetchData();
      } else {
        setToast({ msg: json.error || "Failed", type: "info" });
      }
    } catch {
      setToast({ msg: "Network error", type: "info" });
    }
    setLogging(null);
    setTimeout(() => setToast(null), 4000);
  }

  if (!data) {
    return <div className="flex items-center justify-center h-full text-muted">Loading...</div>;
  }

  const topics = data.skillTree.topics;
  const labs = data.labCatalog.labs;

  const filtered = labs.filter((lab) => {
    if (selectedTopic !== "all" && lab.topic !== selectedTopic) return false;
    if (selectedDiff !== "all" && lab.difficulty !== selectedDiff) return false;
    if (!showCompleted && completedSet.has(lab.id)) return false;
    return true;
  });

  const grouped: Record<string, Lab[]> = {};
  for (const lab of filtered) {
    if (!grouped[lab.topic]) grouped[lab.topic] = [];
    grouped[lab.topic].push(lab);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm shadow-lg transition-all ${
          toast.type === "success" ? "bg-accent text-white" : "bg-card text-muted border border-border"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Labs</h1>
          <p className="text-sm text-muted mt-0.5">
            {completedSet.size}/{labs.length} completed
          </p>
        </div>
        <div className="w-48 bg-subtle rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full"
            style={{ width: `${Math.round((completedSet.size / labs.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="all">All Topics</option>
          {Object.entries(topics)
            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
            .map(([id, def]) => (
              <option key={id} value={id}>{def.name}</option>
            ))}
        </select>

        <select
          value={selectedDiff}
          onChange={(e) => setSelectedDiff(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="all">All Levels</option>
          <option value="apprentice">Apprentice</option>
          <option value="practitioner">Practitioner</option>
          <option value="expert">Expert</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="accent-accent rounded"
          />
          Show completed
        </label>

        <span className="text-xs text-muted ml-auto">{filtered.length} labs</span>
      </div>

      {/* Lab Groups */}
      {Object.entries(grouped)
        .sort(([a], [b]) => (topics[a]?.name ?? a).localeCompare(topics[b]?.name ?? b))
        .map(([topicId, topicLabs]) => {
          const topicDef = topics[topicId];
          const done = topicLabs.filter((l) => completedSet.has(l.id)).length;

          return (
            <div key={topicId} className="bg-card rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-border">
                <h2 className="text-sm font-medium text-foreground">
                  {topicDef?.name ?? topicId}
                </h2>
                <span className="text-xs text-muted">{done}/{topicLabs.length}</span>
              </div>

              <div className="divide-y divide-border/40">
                {topicLabs.map((lab) => {
                  const isDone = completedSet.has(lab.id);
                  return (
                    <div
                      key={lab.id}
                      className={`px-5 py-3 flex items-center gap-3 hover:bg-surface-light transition-colors ${
                        isDone ? "opacity-50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border ${
                        isDone ? "bg-success/20 border-success/40 text-success" : "border-border"
                      }`}>
                        {isDone && "\u2713"}
                      </div>

                      {/* Difficulty */}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${diffBadge[lab.difficulty]}`}>
                        {lab.difficulty.slice(0, 1).toUpperCase()}
                      </span>

                      {/* Title */}
                      <span className="flex-1 text-sm text-foreground truncate">{lab.title}</span>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {lab.url && (
                          <a
                            href={lab.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:text-accent-light transition-colors px-3 py-1.5 rounded-lg border border-accent/20 hover:border-accent/40"
                          >
                            Open
                          </a>
                        )}
                        {!isDone ? (
                          <button
                            onClick={() => handleLog(lab.id)}
                            disabled={logging === lab.id}
                            className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all disabled:opacity-40 font-medium"
                          >
                            {logging === lab.id ? "..." : "Done"}
                          </button>
                        ) : (
                          <span className="text-xs text-success/50 px-3">\u2713</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted">No labs match your filters.</div>
      )}
    </div>
  );
}
