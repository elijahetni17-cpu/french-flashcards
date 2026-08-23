import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import topics from "../data/topics.json";
import flashcards from "../data/flashcards.json";
import quizBank from "../data/quiz-bank.json";
import { getQuizDuelStats } from "../lib/storage.js";

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(getQuizDuelStats());
  }, []);

  const highWeightTopics = topics.filter((t) => t.weight === "high");

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs font-mono mb-4">
            ⏰ Exam is tomorrow — focus mode
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold leading-tight mb-3">
            Basic French II, sorted.
          </h1>
          <p className="text-white/60 max-w-xl text-sm sm:text-base mb-6">
            {flashcards.length} flashcards and {quizBank.length} exam-style questions,
            built directly from UMaT's past papers (2015–2025) and this semester's lecture slides.
            No fluff — just what shows up on the paper.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/cram"
              className="px-5 py-2.5 rounded-full bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition"
            >
              ⚡ Open the Cram Sheet
            </Link>
            <Link
              to="/duel"
              className="px-5 py-2.5 rounded-full bg-white/10 border border-white/15 font-semibold text-sm hover:bg-white/15 transition"
            >
              ⚔️ Quiz Duel
            </Link>
            <Link
              to="/flashcards"
              className="px-5 py-2.5 rounded-full bg-white/10 border border-white/15 font-semibold text-sm hover:bg-white/15 transition"
            >
              🃏 Flashcards
            </Link>
          </div>
        </div>
      </section>

      {stats && stats.history.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Best score" value={stats.bestScore} />
          <StatCard label="Best accuracy" value={`${stats.bestAccuracy}%`} />
          <StatCard label="Best streak" value={stats.bestStreak} />
          <StatCard
            label="Fastest clean run"
            value={stats.fastestCleanRun ? `${stats.fastestCleanRun}s` : "—"}
          />
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">
            High-priority topics
          </h2>
          <Link to="/topics" className="text-xs text-white/50 hover:text-white">
            See all →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {highWeightTopics.map((t) => (
            <Link
              key={t.id}
              to={`/flashcards/${t.id}`}
              className="glass rounded-2xl p-4 flex items-start gap-3 hover:bg-white/[0.07] transition group"
            >
              <span className="text-2xl">{t.icon}</span>
              <div className="min-w-0">
                <div className="font-semibold text-sm group-hover:text-amber-200 transition">
                  {t.title}
                </div>
                <div className="text-xs text-white/50 mt-0.5 line-clamp-2">
                  {t.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg font-semibold mb-3">Tonight's game plan</h2>
        <ol className="space-y-2 text-sm text-white/70">
          <li className="flex gap-2">
            <span className="font-mono text-amber-300">1.</span>
            Skim the <Link to="/cram" className="text-amber-200 underline">Cram Sheet</Link> once, top to bottom — it's the compressed version of everything below.
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-amber-300">2.</span>
            Drill <Link to="/flashcards" className="text-amber-200 underline">Flashcards</Link> topic by topic, starting with 🔴 high-weight topics.
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-amber-300">3.</span>
            Run <Link to="/duel" className="text-amber-200 underline">Quiz Duel</Link> against your own best score until you clear each topic at 100%.
          </li>
        </ol>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="font-display text-2xl font-bold text-amber-200">{value}</div>
      <div className="text-[11px] text-white/50 mt-1">{label}</div>
    </div>
  );
}
