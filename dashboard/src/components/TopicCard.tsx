"use client";

interface TopicCardProps {
  name: string;
  category: string;
  completed: number;
  total: number;
  percent: number;
}

const categoryBadge: Record<string, string> = {
  "server-side": "bg-danger/10 text-danger",
  "client-side": "bg-success/10 text-success",
  advanced: "bg-accent/10 text-accent",
};

const progressColor: Record<string, string> = {
  "server-side": "bg-danger",
  "client-side": "bg-success",
  advanced: "bg-accent",
};

export default function TopicCard({
  name,
  category,
  completed,
  total,
  percent,
}: TopicCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 hover:bg-surface-light transition-colors duration-150">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground truncate pr-2">
          {name}
        </h3>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
            categoryBadge[category] || "bg-subtle text-muted"
          }`}
        >
          {category.replace("-", " ")}
        </span>
      </div>

      <div className="w-full bg-subtle rounded-full h-1.5 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progressColor[category] || "bg-accent"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-[11px] text-muted">
          {completed}/{total} labs
        </span>
        <span
          className={`text-[11px] font-medium ${
            percent === 100 ? "text-success" : "text-muted"
          }`}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}
