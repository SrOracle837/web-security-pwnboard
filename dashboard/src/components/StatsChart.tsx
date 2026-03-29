"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import type { TopicProgress } from "@/lib/calculations";

interface LabsPerWeekProps {
  activityLog: { date: string; xp: number }[];
}

export function LabsPerWeekChart({ activityLog }: LabsPerWeekProps) {
  const weekMap: Record<string, number> = {};
  for (const entry of activityLog) {
    const d = new Date(entry.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    weekMap[key] = (weekMap[key] || 0) + 1;
  }

  const data = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([week, count]) => ({ week: week.slice(5), labs: count }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted">
        No activity yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "#9c9590" }}
          axisLine={{ stroke: "#e5e0d8" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#9c9590" }}
          axisLine={{ stroke: "#e5e0d8" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#faf8f5",
            border: "1px solid #ddd8d0",
            borderRadius: 12,
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        />
        <Bar dataKey="labs" fill="#c0533e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TopicRadarProps {
  topics: TopicProgress[];
}

export function TopicRadarChart({ topics }: TopicRadarProps) {
  const data = topics
    .filter((t) => t.total > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 8)
    .map((t) => ({
      topic: t.name.length > 12 ? t.name.slice(0, 12) + "..." : t.name,
      mastery: t.percent,
    }));

  if (data.length < 3) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted">
        Complete 3+ topics to see radar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={data}>
        <PolarGrid stroke="#ddd8d0" />
        <PolarAngleAxis
          dataKey="topic"
          tick={{ fontSize: 9, fill: "#9c9590" }}
        />
        <Radar
          dataKey="mastery"
          stroke="#c0533e"
          fill="#c0533e"
          fillOpacity={0.1}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
