# Web Security Pwnboard

A gamified personal dashboard for tracking your progress through [PortSwigger's Web Security Academy](https://portswigger.net/web-security). Built with Next.js, React, and Tailwind CSS.

Log labs, take quizzes with spaced repetition, earn XP, level up, and unlock achievements — all from a clean web interface.

## Features

- **Lab Tracker** — Browse all 267 labs across 30 topics. Mark them done with one click. Links directly to PortSwigger.
- **Quiz System** — 114 challenging questions with spaced repetition (SM-2 algorithm). Prioritizes your weak areas.
- **XP & Leveling** — Earn XP for labs and quizzes. 15 levels from "Script Kiddie" to "Pentest Legend".
- **Streak Tracking** — Daily streaks with multipliers up to 2x.
- **Achievements** — 45 badges including hidden ones. Progression, streaks, topic mastery, and style badges.
- **Skill Tree** — Interactive topic graph showing prerequisites and progress.
- **Learning Resources** — Curated links to PortSwigger docs, OWASP guides, cheat sheets, and tools per topic.
- **Stats Dashboard** — Charts, activity calendar, difficulty/category breakdowns.

## Screenshots

*Coming soon*

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/web-security-pwnboard.git
cd web-security-pwnboard

# Create your player state from template
cp state/player.template.json state/player.json

# Install dependencies
cd dashboard
npm install

# Start the dev server
npx next dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

1. **Labs** — Filter by topic or difficulty. Click "Open" to go to the PortSwigger lab. Click "Done" when you solve it.
2. **Quiz** — Pick a topic and number of questions. Wrong answers come back later via spaced repetition.
3. **Dashboard** — See your XP, streak, recent activity, and topic progress at a glance.
4. **Skill Tree** — Visualize the topic dependency graph and your progress through it.

## Skill Tree & Progression

The skill tree has an optional lock system based on topic prerequisites:

- **7 starter topics** are available immediately: SQL Injection, XSS, Authentication, Access Control, Command Injection, Information Disclosure, Path Traversal.
- **Remaining topics** unlock after completing Apprentice labs in prerequisite topics.
- **Advanced topics** (HTTP Request Smuggling, Web Cache Poisoning, etc.) gate behind Level 8.

> **Note:** PortSwigger's Web Security Academy itself has no restrictions — you can do any lab at any time. The lock system is a gamification layer for structured learning. If you prefer to do labs in any order, you can still log any lab from the Labs page regardless of lock status.

To disable locks entirely, set all topics to `starter: true` in `references/skill-tree.yaml`.

## XP System

| Action | XP |
|--------|-----|
| Apprentice lab | 100 |
| Practitioner lab | 250 |
| Expert lab | 500 |
| Quiz correct answer | 25 |
| Achievement unlocked | 50–200 |

Streak multiplier: 1x (days 1–2) → 1.2x (3–6) → 1.5x (7–13) → 1.75x (14–29) → 2x (30+)

## Project Structure

```
web-security-pwnboard/
├── dashboard/              # Next.js web app
│   ├── src/
│   │   ├── app/            # Pages (dashboard, labs, quiz, learn, skill-tree, achievements, stats)
│   │   ├── components/     # Reusable UI components
│   │   └── lib/            # State management, calculations, YAML loaders
│   └── package.json
├── references/             # YAML content (read-only)
│   ├── lab-catalog.yaml    # 267 labs with titles, topics, difficulty, URLs
│   ├── quiz-bank.yaml      # 114 quiz questions with explanations
│   ├── skill-tree.yaml     # Topic graph and prerequisites
│   ├── achievements.yaml   # 45 badge definitions
│   └── xp-tables.yaml     # Leveling and XP config
├── state/
│   ├── player.json         # Your progress (gitignored)
│   └── player.template.json # Clean starting state
├── SKILL.md                # Claude Code skill definition (optional)
└── README.md
```

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Recharts** — bar charts and radar charts
- **React Flow** (@xyflow/react) — skill tree graph
- **yaml** — YAML parsing for reference files

No database. All state is a single JSON file.

## Contributing

PRs welcome. Some ideas:

- Add more quiz questions
- Add lab writeup links
- Dark theme toggle
- Mobile responsive layout
- Export/import progress
- Leaderboard for teams

## License

MIT

## Acknowledgments

- [PortSwigger Web Security Academy](https://portswigger.net/web-security) for the incredible free training content
- Lab catalog sourced from PortSwigger's public lab listings
