import React, { useState, useMemo, useRef, useEffect } from "react";

const STARTER_DECK = [
  { front: "le chat", back: "the cat" },
  { front: "manger", back: "to eat" },
  { front: "la maison", back: "the house" },
  { front: "aujourd'hui", back: "today" },
  { front: "parler", back: "to speak" },
  { front: "beaucoup", back: "a lot / many" },
  { front: "le travail", back: "work / job" },
  { front: "comprendre", back: "to understand" },
  { front: "toujours", back: "always" },
  { front: "l'ami / l'amie", back: "the friend" },
];

const STORAGE_KEY = "french-flashcards-deck";

let nextId = 1;
function makeCard(front, back) {
  return { id: nextId++, front, back, box: 1 };
}

function loadSavedDeck() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const maxId = parsed.reduce((m, c) => Math.max(m, c.id), 0);
        nextId = maxId + 1;
        return parsed;
      }
    }
  } catch (e) {
    // ignore corrupted or missing storage, fall back to starter deck
  }
  return null;
}

export default function FrenchFlashcards() {
  const [cards, setCards] = useState(
    () => loadSavedDeck() || STARTER_DECK.map((c) => makeCard(c.front, c.back))
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      // storage full or unavailable, fail silently
    }
  }, [cards]);
  const [currentId, setCurrentId] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showManage, setShowManage] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const lastIdRef = useRef(null);

  const mastered = cards.filter((c) => c.box >= 4).length;

  function pickNext(deck, excludeId) {
    const pool = deck.filter((c) => c.id !== excludeId);
    const source = pool.length > 0 ? pool : deck;
    const weights = source.map((c) => 5 - c.box);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < source.length; i++) {
      r -= weights[i];
      if (r <= 0) return source[i].id;
    }
    return source[source.length - 1].id;
  }

  const current = useMemo(() => {
    if (currentId === null) return null;
    return cards.find((c) => c.id === currentId) || null;
  }, [cards, currentId]);

  if (currentId === null && cards.length > 0) {
    const id = pickNext(cards, null);
    setCurrentId(id);
    lastIdRef.current = id;
  }

  function handleFlip() {
    if (!current) return;
    setFlipped((f) => !f);
  }

  function handleAnswer(gotIt) {
    if (!current) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === current.id
          ? { ...c, box: gotIt ? Math.min(c.box + 1, 4) : 1 }
          : c
      )
    );
    setReviewed((n) => n + 1);
    if (gotIt) setCorrect((n) => n + 1);
    const nextPool = cards.map((c) =>
      c.id === current.id ? { ...c, box: gotIt ? Math.min(c.box + 1, 4) : 1 } : c
    );
    const nextId2 = pickNext(nextPool, current.id);
    lastIdRef.current = nextId2;
    setCurrentId(nextId2);
    setFlipped(false);
  }

  function handleAddCard(e) {
    e.preventDefault();
    const f = newFront.trim();
    const b = newBack.trim();
    if (!f || !b) return;
    const card = makeCard(f, b);
    setCards((prev) => [...prev, card]);
    setNewFront("");
    setNewBack("");
    if (currentId === null) setCurrentId(card.id);
  }

  function handleDelete(id) {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (currentId === id) {
        setFlipped(false);
        if (next.length > 0) {
          const nid = pickNext(next, null);
          setCurrentId(nid);
        } else {
          setCurrentId(null);
        }
      }
      return next;
    });
  }

  const accent = "#D9A441";
  const brick = "#B5533C";
  const board = "#24352B";
  const chalk = "#F3EFE3";
  const chalkDim = "#C9C4B3";
  const page = "#FAFAF8";
  const ink = "#2C2C2A";
  const inkSoft = "#6B6A63";
  const line = "#E4E2D9";

  return (
    <div
      style={{
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: page,
        minHeight: "100%",
        padding: "32px 20px 40px",
        boxSizing: "border-box",
        color: ink,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600&display=swap');
        .ff-card-inner { transition: transform 0.45s cubic-bezier(.4,.2,.2,1); transform-style: preserve-3d; }
        .ff-face { backface-visibility: hidden; }
        .ff-back { transform: rotateY(180deg); }
        .ff-btn { cursor: pointer; border: none; font-family: Inter, sans-serif; font-weight: 600; transition: opacity 0.15s, transform 0.1s; }
        .ff-btn:active { transform: scale(0.97); }
        .ff-btn:hover { opacity: 0.88; }
        .ff-text-btn { background: none; cursor: pointer; font-family: Inter, sans-serif; }
        .ff-input { font-family: Inter, sans-serif; font-size: 14px; padding: 9px 12px; border-radius: 8px; border: 1px solid ${line}; outline: none; }
        .ff-input:focus { border-color: ${accent}; }
      `}</style>

      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: inkSoft,
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            French vocabulary
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, fontSize: 13, color: inkSoft }}>
            <span>{cards.length} words</span>
            <span>{mastered} mastered</span>
            <span>{reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0}% this session</span>
          </div>
        </div>

        {current ? (
          <>
            <div
              onClick={handleFlip}
              style={{
                perspective: 1200,
                cursor: "pointer",
                marginBottom: 20,
              }}
            >
              <div
                className="ff-card-inner"
                style={{
                  position: "relative",
                  width: "100%",
                  height: 260,
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="ff-face"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: board,
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    boxSizing: "border-box",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: chalkDim,
                      marginBottom: 14,
                    }}
                  >
                    French
                  </p>
                  <p
                    style={{
                      fontFamily: "Caveat, cursive",
                      fontSize: 52,
                      fontWeight: 700,
                      color: chalk,
                      margin: 0,
                      textAlign: "center",
                      lineHeight: 1.15,
                    }}
                  >
                    {current.front}
                  </p>
                  <p style={{ fontSize: 12, color: chalkDim, marginTop: 18 }}>
                    tap to reveal
                  </p>
                </div>

                <div
                  className="ff-face ff-back"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: board,
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    boxSizing: "border-box",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: chalkDim,
                      marginBottom: 14,
                    }}
                  >
                    English
                  </p>
                  <p
                    style={{
                      fontFamily: "Caveat, cursive",
                      fontSize: 46,
                      fontWeight: 700,
                      color: chalk,
                      margin: 0,
                      textAlign: "center",
                      lineHeight: 1.15,
                    }}
                  >
                    {current.back}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="ff-btn"
                onClick={() => handleAnswer(false)}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  borderRadius: 10,
                  background: "#FBEFEC",
                  color: brick,
                  fontSize: 14,
                }}
              >
                Still learning
              </button>
              <button
                className="ff-btn"
                onClick={() => handleAnswer(true)}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  borderRadius: 10,
                  background: accent,
                  color: "#3A2A0A",
                  fontSize: 14,
                }}
              >
                Got it
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              color: inkSoft,
              fontSize: 14,
              border: `1px dashed ${line}`,
              borderRadius: 16,
              marginBottom: 20,
            }}
          >
            No words yet. Add your first one below.
          </div>
        )}

        <div style={{ marginTop: 32, borderTop: `1px solid ${line}`, paddingTop: 16 }}>
          <button
            className="ff-text-btn"
            onClick={() => setShowManage((s) => !s)}
            style={{
              border: "none",
              background: "none",
              color: inkSoft,
              fontSize: 13,
              fontWeight: 500,
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {showManage ? "Hide word list" : "Manage words"}
          </button>

          {showManage && (
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 14 }}>
                <button
                  className="ff-text-btn"
                  onClick={() => {
                    if (window.confirm("Reset to the starter word list? This clears your saved words.")) {
                      const fresh = STARTER_DECK.map((c) => makeCard(c.front, c.back));
                      setCards(fresh);
                      setCurrentId(null);
                      setFlipped(false);
                    }
                  }}
                  style={{ border: "none", color: inkSoft, fontSize: 12, padding: 0, textDecoration: "underline" }}
                >
                  Reset to starter list
                </button>
              </div>
              <form
                onSubmit={handleAddCard}
                style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
              >
                <input
                  className="ff-input"
                  placeholder="French word"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  style={{ flex: "1 1 140px" }}
                />
                <input
                  className="ff-input"
                  placeholder="English meaning"
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  style={{ flex: "1 1 140px" }}
                />
                <button
                  className="ff-btn"
                  type="submit"
                  style={{
                    padding: "9px 16px",
                    borderRadius: 8,
                    background: board,
                    color: chalk,
                    fontSize: 13,
                  }}
                >
                  Add
                </button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cards.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "#F1EFE6",
                      fontSize: 13,
                    }}
                  >
                    <span>
                      <strong>{c.front}</strong>
                      <span style={{ color: inkSoft }}> — {c.back}</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: inkSoft }}>
                        box {c.box}/4
                      </span>
                      <button
                        className="ff-text-btn"
                        onClick={() => handleDelete(c.id)}
                        style={{ border: "none", color: brick, fontSize: 12, padding: 0 }}
                      >
                        remove
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}