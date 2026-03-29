# Web Security Pwnboard

A gamified personal dashboard for tracking your progress through [PortSwigger's Web Security Academy](https://portswigger.net/web-security) — the industry-standard free resource for learning web application security.

Built with Next.js 16, React 19, and Tailwind CSS v4. No database, no accounts, no backend — just a local app that reads and writes a single JSON file.

## Why This Exists

PortSwigger's Web Security Academy has 267 labs across 30 vulnerability topics. It's an incredible resource, but there's no built-in way to track your progress, test your knowledge with spaced repetition, or gamify the journey. This project fills that gap.

## Features

### Lab Tracker
Browse all 267 labs organized by topic. Filter by difficulty (Apprentice / Practitioner / Expert) or topic. One-click to open any lab on PortSwigger, one-click to mark it done. Toggle completion on and off via the checkbox.

### AI-Assisted Learning
Every lab has an **"Ask AI"** button that copies a context-aware hint prompt to your clipboard and opens [claude.ai](https://claude.ai) in a new tab. Just paste and get a progressive hint without spoilers. Same for quiz questions — when you get one wrong, you can ask AI to explain it deeper.

### Quiz System
114 challenging multiple-choice questions across 12 topics. These aren't trivia — every wrong answer is a plausible misconception that tests real understanding. Topics include WAF bypass techniques, subtle code vulnerabilities, defense-bypass scenarios, and attack chain ordering.

The quiz engine uses the **SM-2 spaced repetition algorithm** — questions you get wrong come back sooner, questions you master fade into longer intervals. Over time, it zeroes in on your weak spots.

### XP, Levels & Streaks

| Action | XP |
|---|---|
| Apprentice lab | 100 |
| Practitioner lab | 250 |
| Expert lab | 500 |
| Quiz correct answer | 25 |
| Achievement unlocked | 50-200 |

15 levels from **Script Kiddie** (0 XP) to **Pentest Legend** (50,000 XP). Daily streaks multiply your XP:

| Streak | Multiplier |
|---|---|
| Days 1-2 | 1.0x |
| Days 3-6 | 1.2x |
| Days 7-13 | 1.5x |
| Days 14-29 | 1.75x |
| Days 30+ | 2.0x |

### Achievements
45 badges across 5 categories:

- **Progression** — First Blood, Getting Started, Halfway There, BSCP Ready, Completionist
- **Streaks** — Consistent (3d), Dedicated (7d), Relentless (30d), Obsessed (100d)
- **Style** — No Training Wheels, Speed Demon, Quiz Master, Deep Diver
- **Topic Mastery** — One badge per topic (SQLi Slayer, XSS Ninja, CSRF Crusher, etc.)
- **Hidden** — Surprise badges you discover by playing (Night Owl, Weekend Warrior, Comeback Kid, The Chainer)

### Skill Tree
Interactive graph built with React Flow. 30 topic nodes connected by prerequisite edges. Hover any node to see its description and unlock requirements. Nodes show live progress bars and completion counts.

### Learning Resources
Curated links per topic — PortSwigger documentation, OWASP guides, cheat sheets, and security tools. Filterable by category (server-side, client-side, advanced).

### Stats Dashboard
Activity calendar (GitHub-style), labs-per-week bar chart, topic mastery radar chart, breakdowns by difficulty and category, streak stats, and quiz mastery tracking.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or later

### Setup

```bash
git clone https://github.com/SrOracle837/web-security-pwnboard.git
cd web-security-pwnboard

# Initialize your player state
cp state/player.template.json state/player.json

# Install and run
cd dashboard
npm install
npx next dev
```

Open [http://localhost:3000](http://localhost:3000).

### Quick Start

1. Go to **Labs** — filter to a topic you want to start with
2. Click **Open** to launch the lab on PortSwigger
3. Solve it in Burp Suite
4. Click the **checkbox** to mark it done — earn XP
5. Take a **Quiz** to reinforce what you learned
6. Check your **Dashboard** to see progress

## Skill Tree & Progression

The skill tree implements an optional prerequisite system for structured learning:

- **7 starter topics** are unlocked immediately: SQL Injection, XSS, Authentication, Access Control, Command Injection, Information Disclosure, Path Traversal
- **Other topics** unlock after completing Apprentice labs in prerequisite topics
- **Advanced topics** (HTTP Request Smuggling, Web Cache Poisoning, Prototype Pollution, etc.) require Level 8

> **Note:** PortSwigger's Web Security Academy has no restrictions — you can do any lab at any time. The lock system is a gamification layer. You can log any lab from the Labs page regardless of lock status.

To disable locks, set all topics to `starter: true` in `references/skill-tree.yaml`.

## Architecture

```
web-security-pwnboard/
├── dashboard/                     # Next.js 16 web app
│   └── src/
│       ├── app/                   # 7 pages + 3 API routes
│       │   ├── page.tsx           # Dashboard — overview
│       │   ├── labs/              # Lab browser with logging
│       │   ├── quiz/              # Interactive quiz with SM-2
│       │   ├── learn/             # Curated resources
│       │   ├── skill-tree/        # React Flow graph
│       │   ├── achievements/      # Badge gallery
│       │   ├── stats/             # Analytics & charts
│       │   └── api/
│       │       ├── state/         # GET — read all state + references
│       │       ├── log/           # POST — log lab, DELETE — undo
│       │       └── quiz/          # POST — submit answer (SM-2)
│       ├── components/            # XPBar, TopicCard, FormattedText, etc.
│       └── lib/
│           ├── engine.ts          # Game logic (XP, achievements, streaks)
│           ├── calculations.ts    # Level math, progress helpers
│           ├── state.ts           # Read/write player.json
│           └── references.ts      # YAML file loaders
├── references/                    # Content (YAML, read-only)
│   ├── lab-catalog.yaml           # 267 labs
│   ├── quiz-bank.yaml             # 114 questions
│   ├── skill-tree.yaml            # 30 topics + prerequisites
│   ├── achievements.yaml          # 45 badges
│   └── xp-tables.yaml            # Levels, XP values, multipliers
├── state/
│   ├── player.json                # Your progress (gitignored)
│   └── player.template.json       # Fresh start template
└── SKILL.md                       # Claude Code skill (optional)
```

**No database.** All state lives in `state/player.json`. The YAML reference files are read-only content. API routes read/write the JSON file directly.

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | App Router, API routes, server components |
| [React 19](https://react.dev/) | UI components |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling — warm off-white theme |
| [Recharts](https://recharts.org/) | Bar charts, radar charts |
| [React Flow](https://reactflow.dev/) | Interactive skill tree graph |
| [yaml](https://www.npmjs.com/package/yaml) | YAML parsing for reference files |

## Customization

### Adding Quiz Questions

Edit `references/quiz-bank.yaml`. Follow the existing format:

```yaml
- id: sqli-013
  topic: sql-injection
  type: scenario
  difficulty: advanced
  question: "Your question here"
  options:
    - a: "Option A"
    - b: "Option B"
    - c: "Option C"
    - d: "Option D"
  answer: "b"
  explanation: "Why B is correct and others aren't..."
```

All four options should be plausible. Explanations should teach, not just confirm.

### Adding Topics

Edit `references/skill-tree.yaml` to add a new topic, then add its labs to `references/lab-catalog.yaml`.

### Changing the Theme

All colors are CSS custom properties in `dashboard/src/app/globals.css`. Swap the values for a different palette.

## Contributing

PRs welcome. Ideas for contribution:

- More quiz questions (especially for advanced topics)
- Lab writeup/solution links
- Dark theme toggle
- Mobile responsive layout
- Export/import progress (share with friends)
- Team leaderboards
- Integration with Burp Suite API

## License

MIT

## Acknowledgments

- [PortSwigger](https://portswigger.net/) for creating the Web Security Academy — the best free web security training on the internet
- Lab titles and URLs sourced from PortSwigger's public lab listings
- Built with [Claude Code](https://claude.ai/code)
