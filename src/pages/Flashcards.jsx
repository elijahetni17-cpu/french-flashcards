import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import topics from "../data/topics.json";
import allCards from "../data/flashcards.json";
import { markFlashcard, getFlashcardProgress } from "../lib/storage.js";

export default function Flashcards() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const cards = useMemo(
    () => (topicId ? allCards.filter((c) => c.topicId === topicId) : allCards),
    [topicId]
  );

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionKnown, setSessionKnown] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const [deck, setDeck] = useState(cards);

  useEffect(() => {
    setDeck(cards);
    setIndex(0);
    setFlipped(false);
    setSessionKnown(0);
    setSessionTotal(0);
  }, [cards]);

  const topic = topics.find((t) => t.id === topicId);
  const card = deck[index];

  function handleFlip() {
    setFlipped((f) => !f);
  }

  function handleKnow(known) {
    if (!card) return;
    markFlashcard(card.id, known);
    setSessionTotal((n) => n + 1);
    if (known) setSessionKnown((n) => n + 1);
    goNext();
  }

  function goNext() {
    setFlipped(false);
    if (index + 1 < deck.length) {
      setIndex((i) => i + 1);
    } else {
      setIndex(0);
    }
  }

  function goPrev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + deck.length) % deck.length);
  }

  function shuffle() {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
  }

  if (!card) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-white/60">
        No cards found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            {topic ? (
              <>
                <span>{topic.icon}</span> {topic.title}
              </>
            ) : (
              "All Flashcards"
            )}
          </h1>
          <p className="text-white/50 text-sm">
            {index + 1} / {deck.length} · {sessionKnown}/{sessionTotal} known this session
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={topicId || ""}
            onChange={(e) => navigate(e.target.value ? `/flashcards/${e.target.value}` : "/flashcards")}
            className="glass rounded-full px-3 py-1.5 text-xs bg-transparent outline-none"
          >
            <option value="" className="bg-neutral-900">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id} className="bg-neutral-900">
                {t.icon} {t.title}
              </option>
            ))}
          </select>
          <button
            onClick={shuffle}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition"
          >
            🔀 Shuffle
          </button>
        </div>
      </div>

      <div className="card-flip max-w-xl mx-auto" onClick={handleFlip}>
        <div className={`card-flip-inner relative w-full h-72 sm:h-80 cursor-pointer ${flipped ? "flipped" : ""}`}>
          <div className="card-face absolute inset-0 glass rounded-3xl p-6 sm:p-8 flex flex-col">
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wide mb-4">
              Front · tap to flip
            </div>
            <div className="flex-1 flex items-center justify-center text-center">
              <p className="font-display text-xl sm:text-2xl font-semibold leading-snug">
                {card.front}
              </p>
            </div>
            {card.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {card.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="card-face card-face-back absolute inset-0 glass rounded-3xl p-6 sm:p-8 flex flex-col bg-gradient-to-br from-violet-500/10 to-sky-500/10">
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wide mb-3">
              Back
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <p className="font-display text-lg sm:text-xl font-semibold leading-snug text-amber-200">
                {card.back}
              </p>
              {card.example && (
                <div className="text-sm text-white/70 border-t border-white/10 pt-3 w-full">
                  <p className="italic">"{card.example}"</p>
                  {card.exampleTranslation && (
                    <p className="text-white/40 text-xs mt-1">{card.exampleTranslation}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={goPrev}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm transition"
        >
          ← Prev
        </button>
        <button
          onClick={() => handleKnow(false)}
          className="px-4 py-2 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 hover:bg-rose-500/30 text-sm font-semibold transition"
        >
          ✗ Still learning
        </button>
        <button
          onClick={() => handleKnow(true)}
          className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/30 text-sm font-semibold transition"
        >
          ✓ I know this
        </button>
        <button
          onClick={goNext}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm transition"
        >
          Next →
        </button>
      </div>

      {topic && (
        <div className="text-center">
          <Link to={`/duel/${topic.id}`} className="text-xs text-amber-200 hover:underline">
            Ready to test yourself? Try Quiz Duel on {topic.title} →
          </Link>
        </div>
      )}
    </div>
  );
}
