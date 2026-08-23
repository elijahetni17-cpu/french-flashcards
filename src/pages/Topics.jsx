import { Link } from "react-router-dom";
import topics from "../data/topics.json";
import flashcards from "../data/flashcards.json";
import quizBank from "../data/quiz-bank.json";

const weightStyles = {
  high: { label: "High priority", dot: "bg-rose-400" },
  medium: { label: "Medium priority", dot: "bg-amber-400" },
  low: { label: "Lower priority", dot: "bg-emerald-400" }
};

export default function Topics() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Topics</h1>
        <p className="text-white/50 text-sm">
          Every grammar point and vocab set that shows up on past Basic French II papers.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {topics.map((t) => {
          const cardCount = flashcards.filter((c) => c.topicId === t.id).length;
          const quizCount = quizBank.filter((q) => q.topicId === t.id).length;
          const w = weightStyles[t.weight] || weightStyles.medium;
          return (
            <div key={t.id} className="glass rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-3xl">{t.icon}</span>
                  <div className="min-w-0">
                    <div className="font-display font-semibold">{t.title}</div>
                    <div className="text-xs text-white/40">{t.titleEn}</div>
                  </div>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full bg-white/5 border border-white/10`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${w.dot}`} />
                  {w.label}
                </span>
              </div>
              <p className="text-sm text-white/60">{t.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {t.examTags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1 mt-auto">
                <Link
                  to={`/flashcards/${t.id}`}
                  className="flex-1 text-center text-xs font-semibold px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 transition"
                >
                  🃏 {cardCount} cards
                </Link>
                <Link
                  to={`/duel/${t.id}`}
                  className="flex-1 text-center text-xs font-semibold px-3 py-2 rounded-full bg-amber-400/90 text-black hover:bg-amber-300 transition"
                >
                  ⚔️ {quizCount} Qs
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
