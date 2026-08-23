# Basic French II — Exam Sprint

A dark, glassmorphic exam-prep app for UMaT's **Basic French II** course, rebuilt from
past exam papers (2015-2025) and this semester's lecture slides.

## What's inside

- **Flashcards** - 183 cards across 10 topics, each with an example sentence and translation.
- **Topics** - 10 grammar/vocab topics tagged by exam weight (high/medium), pulled directly
  from the pattern of past papers (time-telling, adjective agreement, passe compose, imparfait,
  futur simple, transport, prepositions, tools & PPE, negation & numbers, se presenter).
- **Quiz Duel** - beat-your-own-best-score mode. 15-question timed runs (or fewer if a topic
  has a smaller bank), full answer review after every run (what you picked, the correct answer,
  and why), tracked against your personal best score/accuracy/streak/fastest clean run via
  localStorage.
- **Cram Sheet** - a single-page, compressed summary for the night before the exam: the
  passe compose auxiliary rules, DR & MRS VANDERTRAMP, adjective agreement patterns, futur
  simple irregular stems, time-telling formulas, and the biggest preposition traps.

## Content sources

All flashcards and quiz questions are built from real UMaT Basic French II past papers
(May 2015, Aug 2021, Aug 2024 x2, Aug/Sep 2025) and Second Semester 2026 lecture slides
(weeks 2-7), plus supplementary assignments on adjectives, transport, tools, and the futur
simple. Every quiz question is tagged with its source paper in `src/data/quiz-bank.json`.

## Tech stack

- React 19 + Vite
- Tailwind CSS v4
- React Router (hash routing, works on any static host without server config)
- No backend - progress is stored locally in the browser (localStorage)

## Running locally

```bash
npm install
npm run dev
```

## Deploying to Vercel

Standard Vite + React static build - push to GitHub and import the repo in Vercel.
No environment variables or special config needed.
Build command: `npm run build`, output directory: `dist`.

## Content structure

All exam content lives in `src/data/*.json`:

| File | Purpose |
|---|---|
| topics.json | The 10 topics, their exam weight, and description |
| flashcards.json | 183 flashcards (front/back/example/translation/tags) |
| quiz-bank.json | 151 exam-style MCQs with explanations and source paper |
| conjugations.json | Full passe compose / imparfait / futur simple rule tables |
| adjectives.json | Adjective agreement patterns + profession gender forms |
| heure.json | Time-telling formulas and worked conversions |
| prepositions.json | a/au/aux/chez/en/dans/par rules |
| transport.json | Transport vocab and a-vs-en rules |
| outils-epi.json | Tools & PPE vocab with functions |
| se-presenter.json | Self-introduction Q&A and fiche d'identite template |
| negation-nombres.json | Negation word order + number spelling |
| cheat-sheet.json | The condensed cram-sheet sections |

Want to add more content before the exam? Just append to the relevant JSON file - every
page reads from these files directly.

Bonne chance !
