import React, { useState, useEffect, useMemo } from "react";
import { COURSE } from "./data/courseData";

const STORAGE_KEY = "french-course-progress-v2";

// ---------------------------------------------------------------- palette
const C = {
  forest: "#1B3A2B",
  brass: "#C9962C",
  brassDim: "#E4C989",
  ox: "#8C3A2E",
  oxSoft: "#FBEFEC",
  page: "#FAFAF8",
  ink: "#232320",
  inkSoft: "#6B6A63",
  line: "#E4E2D9",
  chalk: "#F3EFE3",
  chalkDim: "#C9C4B3",
  greenTint: "#EEF3EC",
};

const FONTS_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');";

// ---------------------------------------------------------------- storage
function loadProgress() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { boxes: {}, scores: {} };
}
function saveProgress(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (e) {}
}

// ---------------------------------------------------------------- helpers
function boxOf(boxes, id) {
  return boxes[id] || 1;
}
function pickWeighted(pool, boxes, excludeId) {
  var candidates = pool.filter(function (c) { return c.id !== excludeId; });
  var source = candidates.length > 0 ? candidates : pool;
  var weights = source.map(function (c) { return 5 - boxOf(boxes, c.id); });
  var total = weights.reduce(function (a, b) { return a + b; }, 0);
  var r = Math.random() * total;
  for (var i = 0; i < source.length; i++) {
    r -= weights[i];
    if (r <= 0) return source[i];
  }
  return source[source.length - 1];
}
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}
function mention(pct) {
  if (pct >= 80) return { label: "Très Bien" };
  if (pct >= 70) return { label: "Bien" };
  if (pct >= 60) return { label: "Assez Bien" };
  if (pct >= 50) return { label: "Passable" };
  return { label: "Insuffisant" };
}

// ------------------------------------------------- bilingual speech engine
// SpeakerButton takes `segments`: an array of { text, lang: 'fr' | 'en' }.
// Each segment is spoken with the correct voice/accent, queued in order, so
// French phrases and English explanations are never read in the wrong accent.
var voiceCache = [];
function primeVoices() {
  try {
    if (!("speechSynthesis" in window)) return;
    voiceCache = window.speechSynthesis.getVoices() || [];
    window.speechSynthesis.onvoiceschanged = function () {
      voiceCache = window.speechSynthesis.getVoices() || [];
    };
  } catch (e) {}
}
function stripHints(text) {
  return text.replace(/\([^)]*\)/g, "").replace(/_{2,}/g, "").trim();
}
function pickVoice(langPrefix) {
  for (var i = 0; i < voiceCache.length; i++) {
    var v = voiceCache[i];
    if (v.lang && v.lang.toLowerCase().indexOf(langPrefix) === 0) return v;
  }
  return null;
}
function speakQueue(segments) {
  try {
    if (!("speechSynthesis" in window)) return;
    if (voiceCache.length === 0) voiceCache = window.speechSynthesis.getVoices() || [];
    window.speechSynthesis.cancel();
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      if (!seg || !seg.text) continue;
      var isFr = seg.lang !== "en";
      var clean = isFr ? stripHints(seg.text) : seg.text.trim();
      if (!clean) continue;
      var utter = new SpeechSynthesisUtterance(clean);
      utter.lang = isFr ? "fr-FR" : "en-US";
      utter.rate = isFr ? 0.88 : 1;
      var voice = pickVoice(isFr ? "fr" : "en");
      if (voice) utter.voice = voice;
      window.speechSynthesis.speak(utter);
    }
  } catch (e) {}
}

// ---------------------------------------------------------------- helpers
function allCardsOf(topic) {
  var out = [];
  topic.subtopics.forEach(function (st) {
    st.concepts.forEach(function (c) {
      c.cards.forEach(function (card) { out.push(card); });
    });
  });
  return out;
}
function allCardsEverywhere() {
  var out = [];
  COURSE.forEach(function (t) { out = out.concat(allCardsOf(t)); });
  return out;
}
function masteryOf(topic, boxes) {
  var cards = allCardsOf(topic);
  if (cards.length === 0) return 0;
  var mastered = cards.filter(function (c) { return boxOf(boxes, c.id) >= 4; }).length;
  return Math.round((mastered / cards.length) * 100);
}
function flattenSlides(subtopic) {
  var out = [];
  subtopic.concepts.forEach(function (c) {
    c.slides.forEach(function (s) { out.push({ concept: c, slide: s }); });
  });
  return out;
}

// ---------------------------------------------------------------- small UI atoms
function SpeakerButton(props) {
  var segments = props.segments;
  var dark = props.dark;
  return (
    <button
      onClick={function (e) {
        e.stopPropagation();
        speakQueue(segments);
      }}
      aria-label="Listen"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: dark ? "1px solid rgba(255,255,255,0.25)" : "1px solid " + C.line,
        background: dark ? "rgba(255,255,255,0.08)" : "#fff",
        color: dark ? C.chalk : C.forest,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
        <path d="M16.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M19 6a8.5 8.5 0 010 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      </svg>
    </button>
  );
}

function CourseCodeBadge({ code }) {
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: C.brass,
        background: "rgba(201,150,44,0.12)",
        padding: "3px 8px",
        borderRadius: 5,
      }}
    >
      {code}
    </span>
  );
}

function Seal({ pct }) {
  var m = mention(pct);
  return (
    <div
      style={{
        width: 132,
        height: 132,
        borderRadius: "50%",
        margin: "0 auto",
        background: "radial-gradient(circle at 35% 30%, " + C.brassDim + ", " + C.brass + " 60%, #9c7620 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 18px rgba(201,150,44,0.35), inset 0 2px 4px rgba(255,255,255,0.4)",
        border: "3px solid rgba(255,255,255,0.5)",
      }}
    >
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 700, color: "#3A2A0A" }}>{pct}%</div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: "#3A2A0A", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
        {m.label}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, style, variant, disabled }) {
  var v = variant || "brass";
  var bg = v === "brass" ? C.brass : v === "forest" ? C.forest : "transparent";
  var color = v === "outline" ? C.ox : "#fff";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={Object.assign(
        {
          border: v === "outline" ? "1.5px solid " + C.line : "none",
          background: bg,
          color: color,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          padding: "13px 22px",
          borderRadius: 10,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1,
        },
        style || {}
      )}
    >
      {children}
    </button>
  );
}

function TopBar({ crumb, onBack }) {
  return (
    <div className="stack-h" style={{ "--g": "10px", alignItems: "center", marginBottom: 22 }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{ border: "none", background: "none", cursor: "pointer", color: C.inkSoft, fontSize: 20, padding: 4, lineHeight: 1 }}
          aria-label="Back"
        >
          ←
        </button>
      )}
      <div style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 500 }}>{crumb}</div>
    </div>
  );
}

// ---------------------------------------------------------------- HOME
function Home({ onPick }) {
  var items = [
    {
      key: "topics",
      title: "Study a Topic",
      desc: "Work through one week's material — lecture, retention drill, or quiz.",
      icon: (
        <path d="M4 5.5A1.5 1.5 0 015.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13zM20 5.5A1.5 1.5 0 0018.5 4H12v16h6.5a1.5 1.5 0 001.5-1.5v-13z" stroke="currentColor" strokeWidth="1.6" fill="none" />
      ),
    },
    {
      key: "general",
      title: "General Quiz",
      desc: "A mixed sitting drawing questions across every topic covered so far.",
      icon: (
        <path d="M12 3l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4L7.5 17l.9-5L4.8 8.3l5-.7L12 3z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      ),
    },
    {
      key: "flashtest",
      title: "Flashcard Memorization Test",
      desc: "Random flashcards from everything taught so far — see what you can still recall.",
      icon: (
        <React.Fragment>
          <rect x="3" y="6" width="14" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <rect x="7" y="9" width="14" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.6" fill={C.page} />
        </React.Fragment>
      ),
    },
  ];
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 34 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "0.14em", color: C.brass, textTransform: "uppercase", marginBottom: 10 }}>
          CE 141 · Basic French
        </div>
        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 34, margin: 0, color: C.forest }}>
          What would you like to work on?
        </h1>
      </div>
      <div className="stack-v" style={{ "--g": "14px" }}>
        {items.map(function (it) {
          return (
            <button
              key={it.key}
              onClick={function () { onPick(it.key); }}
              className="stack-h"
              style={{ "--g": "16px", alignItems: "center", textAlign: "left", padding: "20px 20px", borderRadius: 14, border: "1px solid " + C.line, background: "#fff", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 10, background: C.greenTint, color: C.forest, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24">{it.icon}</svg>
              </div>
              <div>
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: C.ink }}>{it.title}</div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{it.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- TOPIC LIST
function TopicList({ boxes, onPick, onBack }) {
  return (
    <div>
      <TopBar crumb="Home / Study a Topic" onBack={onBack} />
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, color: C.forest, marginTop: 0 }}>Course catalog</h2>
      <div className="stack-v" style={{ "--g": "10px" }}>
        {COURSE.map(function (t) {
          var pct = masteryOf(t, boxes);
          return (
            <button
              key={t.id}
              onClick={function () { onPick(t.id); }}
              className="stack-h"
              style={{ "--g": "14px", alignItems: "center", textAlign: "left", padding: "16px 16px", borderRadius: 12, border: "1px solid " + C.line, background: "#fff", cursor: "pointer" }}
            >
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "conic-gradient(" + C.brass + " " + pct * 3.6 + "deg, " + C.line + " 0deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: C.forest }}>
                  {pct}%
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="stack-h" style={{ "--g": "8px", alignItems: "center", marginBottom: 3 }}>
                  <CourseCodeBadge code={t.code} />
                  <span style={{ fontSize: 11.5, color: C.inkSoft }}>{t.week}</span>
                </div>
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16.5, color: C.ink }}>{t.title}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 1 }}>{t.subtitle}</div>
              </div>
              <div style={{ color: C.inkSoft, fontSize: 18 }}>›</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- TOPIC MENU
function TopicMenu({ topic, boxes, onMode, onBack }) {
  var pct = masteryOf(topic, boxes);
  return (
    <div>
      <TopBar crumb={"Home / Study a Topic / " + topic.code} onBack={onBack} />
      <div className="stack-h" style={{ "--g": "8px", alignItems: "center", marginBottom: 6 }}>
        <CourseCodeBadge code={topic.code} />
        <span style={{ fontSize: 12, color: C.inkSoft }}>{topic.week}</span>
      </div>
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 26, color: C.forest, margin: "4px 0 2px" }}>{topic.title}</h2>
      <p style={{ color: C.inkSoft, fontSize: 14, marginTop: 0, marginBottom: 24 }}>{topic.subtitle}</p>

      <div className="stack-v" style={{ "--g": "12px" }}>
        <ModeCard title="Lecture Class" desc="A step-by-step walkthrough of each subtopic, taught point by point." onClick={function () { onMode("lecture"); }} />
        <ModeCard title="Test Retention" desc="Flip through this topic's flashcards — weaker cards resurface more often." onClick={function () { onMode("retention"); }} />
        <ModeCard title="Quiz" desc="9 graded questions in the style of your actual exam papers." onClick={function () { onMode("quiz"); }} />
      </div>
      <div style={{ marginTop: 26, padding: "12px 16px", background: C.greenTint, borderRadius: 10, fontSize: 12.5, color: C.forest }}>
        Mastery so far: <strong>{pct}%</strong> of this topic's flashcards are in your top retention box.
      </div>
    </div>
  );
}
function ModeCard({ title, desc, onClick }) {
  return (
    <button onClick={onClick} style={{ textAlign: "left", padding: "18px 18px", borderRadius: 12, border: "1px solid " + C.line, background: "#fff", cursor: "pointer" }}>
      <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 17, color: C.ink }}>{title}</div>
      <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 3 }}>{desc}</div>
    </button>
  );
}

// ---------------------------------------------------------------- LECTURE MODE (linear teaching, no flip)
function Lecture({ topic, onExit }) {
  var [subIdx, setSubIdx] = useState(null);
  var subtopic = subIdx === null ? null : topic.subtopics[subIdx];
  var flat = subtopic ? flattenSlides(subtopic) : [];
  var [idx, setIdx] = useState(0);
  var [done, setDone] = useState(false);

  if (subIdx === null) {
    return (
      <div>
        <TopBar crumb={topic.code + " / Lecture Class"} onBack={onExit} />
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: C.forest, marginTop: 0 }}>Choose a subtopic</h2>
        <div className="stack-v" style={{ "--g": "10px" }}>
          {topic.subtopics.map(function (st, i) {
            var count = flattenSlides(st).length;
            return (
              <button
                key={st.id}
                onClick={function () { setSubIdx(i); setIdx(0); setDone(false); }}
                style={{ textAlign: "left", padding: "16px 16px", borderRadius: 12, border: "1px solid " + C.line, background: "#fff", cursor: "pointer" }}
              >
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16, color: C.ink }}>{st.title}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>{count} cards</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "40px 10px" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>✓</div>
        <h2 style={{ fontFamily: "Fraunces, serif", color: C.forest }}>Subtopic complete</h2>
        <p style={{ color: C.inkSoft, fontSize: 14 }}>You've been through every point in "{subtopic.title}".</p>
        <div className="stack-h" style={{ "--g": "10px", justifyContent: "center", marginTop: 18 }}>
          <PrimaryButton variant="outline" onClick={function () { setSubIdx(null); }}>Choose another subtopic</PrimaryButton>
          <PrimaryButton onClick={onExit}>Back to topic menu</PrimaryButton>
        </div>
      </div>
    );
  }

  var entry = flat[idx];
  var slide = entry.slide;
  var progressPct = Math.round((idx / flat.length) * 100);

  function handleContinue() {
    if (idx + 1 < flat.length) setIdx(idx + 1);
    else setDone(true);
  }
  function handlePrevious() {
    if (idx > 0) setIdx(idx - 1);
  }

  var segments =
    slide.kind === "example"
      ? [{ text: slide.french, lang: "fr" }, { text: slide.english, lang: "en" }]
      : [{ text: slide.text, lang: "en" }];

  return (
    <div>
      <TopBar crumb={topic.code + " / Lecture Class / " + subtopic.title} onBack={function () { setSubIdx(null); }} />
      <div style={{ height: 5, borderRadius: 3, background: C.line, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: progressPct + "%", background: C.brass, transition: "width 0.3s" }} />
      </div>

      <div style={{ background: C.forest, borderRadius: 18, padding: "28px 22px", minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 16, left: 20, right: 60 }}>
          <span style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.brassDim, fontWeight: 600 }}>
            {entry.concept.title}
          </span>
        </div>
        <div style={{ position: "absolute", top: 14, right: 16 }}>
          <SpeakerButton segments={segments} dark />
        </div>

        {slide.kind === "example" ? (
          <div style={{ marginTop: 22, textAlign: "center" }}>
            <p style={{ fontFamily: "Caveat, cursive", fontSize: 30, fontWeight: 700, color: C.chalk, margin: "0 0 8px", lineHeight: 1.3 }}>
              {slide.french}
            </p>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 16, color: C.brassDim, margin: 0, lineHeight: 1.4 }}>
              {slide.english}
            </p>
            {slide.note && (
              <p style={{ fontSize: 12.5, color: C.chalkDim, marginTop: 14, fontStyle: "italic", lineHeight: 1.4 }}>{slide.note}</p>
            )}
          </div>
        ) : (
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 500, color: C.chalk, margin: "22px 0 0", textAlign: "center", lineHeight: 1.55 }}>
            {slide.text}
          </p>
        )}
      </div>

      <div className="stack-h" style={{ "--g": "12px", marginTop: 18 }}>
        <PrimaryButton variant="outline" onClick={handlePrevious} disabled={idx === 0} style={{ flex: 1 }}>
          ← Previous
        </PrimaryButton>
        <PrimaryButton variant="brass" onClick={handleContinue} style={{ flex: 1 }}>
          {idx + 1 < flat.length ? "Continue" : "Finish subtopic"}
        </PrimaryButton>
      </div>
      <p style={{ textAlign: "center", fontSize: 11.5, color: C.inkSoft, marginTop: 12 }}>
        Card {idx + 1} of {flat.length}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- RETENTION MODE
function Retention({ pool, boxes, setBoxes, onExit, crumb }) {
  var [currentId, setCurrentId] = useState(function () { return pickWeighted(pool, boxes, null).id; });
  var [flipped, setFlipped] = useState(false);
  var [reviewed, setReviewed] = useState(0);

  var current = useMemo(function () {
    for (var i = 0; i < pool.length; i++) if (pool[i].id === currentId) return pool[i];
    return pool[0];
  }, [pool, currentId]);

  function handleAnswer(gotIt) {
    var newBox = gotIt ? Math.min(boxOf(boxes, current.id) + 1, 4) : 1;
    var updatedBoxes = Object.assign({}, boxes);
    updatedBoxes[current.id] = newBox;
    setBoxes(function (prev) {
      var next = Object.assign({}, prev);
      next[current.id] = newBox;
      return next;
    });
    setReviewed(function (n) { return n + 1; });
    var next = pickWeighted(pool, updatedBoxes, current.id);
    setCurrentId(next.id);
    setFlipped(false);
  }

  return (
    <div>
      <TopBar crumb={crumb} onBack={onExit} />
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 10 }}>Reviewed this session: {reviewed}</div>
      <div
        onClick={function () { setFlipped(!flipped); }}
        style={{ background: C.forest, borderRadius: 18, padding: "34px 24px", minHeight: 210, display: "flex", flexDirection: "column", justifyContent: "center", cursor: "pointer", position: "relative" }}
      >
        <div style={{ position: "absolute", top: 14, right: 16 }}>
          <SpeakerButton segments={[{ text: flipped ? current.back : current.front, lang: "fr" }]} dark />
        </div>
        <p style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.brassDim, textAlign: "center", marginBottom: 10 }}>
          {(flipped ? "Answer" : "Recall") + " · box " + boxOf(boxes, current.id) + "/4"}
        </p>
        <p style={{ fontFamily: flipped ? "Fraunces, serif" : "Caveat, cursive", fontSize: flipped ? 19 : 30, fontWeight: flipped ? 500 : 700, color: C.chalk, margin: 0, textAlign: "center", lineHeight: 1.4 }}>
          {flipped ? current.back : current.front}
        </p>
        {!flipped && <p style={{ textAlign: "center", fontSize: 11.5, color: C.chalkDim, marginTop: 16 }}>tap to reveal</p>}
      </div>
      <div className="stack-h" style={{ "--g": "12px", marginTop: 18 }}>
        <PrimaryButton onClick={function () { handleAnswer(false); }} style={{ flex: 1, background: C.oxSoft, color: C.ox }}>
          Still learning
        </PrimaryButton>
        <PrimaryButton onClick={function () { handleAnswer(true); }} style={{ flex: 1 }}>
          Got it
        </PrimaryButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- QUIZ MODE
function Quiz({ items, crumb, onExit, onFinish }) {
  var [idx, setIdx] = useState(0);
  var [answer, setAnswer] = useState("");
  var [results, setResults] = useState([]);

  var item = items[idx];

  function submit(chosen) {
    var given = (chosen !== undefined ? chosen : answer).trim().toLowerCase();
    var correct = given === item.answer.trim().toLowerCase();
    var nextResults = results.concat([{ q: item.q, answer: item.answer, given: chosen !== undefined ? chosen : answer, correct: correct }]);
    setResults(nextResults);
    setAnswer("");
    if (idx + 1 < items.length) setIdx(idx + 1);
    else onFinish(nextResults);
  }

  var kindLabel = { mc: "Multiple choice", fill: "Fill in the blank", complete: "Complete the sentence" }[item.type];

  return (
    <div>
      <TopBar crumb={crumb} onBack={onExit} />
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 6 }}>
        Question {idx + 1} of {items.length} · {kindLabel}
      </div>
      <div style={{ height: 5, borderRadius: 3, background: C.line, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: (idx / items.length) * 100 + "%", background: C.brass, transition: "width 0.3s" }} />
      </div>
      <div style={{ background: "#fff", border: "1px solid " + C.line, borderRadius: 16, padding: "22px 20px" }}>
        <div className="stack-h" style={{ "--g": "10px", alignItems: "flex-start" }}>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: C.ink, margin: 0, flex: 1, lineHeight: 1.5 }}>{item.q}</p>
          <SpeakerButton segments={[{ text: item.q, lang: item.qLang === "en" ? "en" : "fr" }]} />
        </div>

        {item.type === "mc" ? (
          <div className="stack-v" style={{ "--g": "8px", marginTop: 18 }}>
            {item.options.map(function (opt) {
              return (
                <button
                  key={opt}
                  onClick={function () { submit(opt); }}
                  style={{ textAlign: "left", padding: "12px 14px", borderRadius: 9, border: "1.5px solid " + C.line, background: C.page, cursor: "pointer", fontSize: 14, color: C.ink }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="stack-h" style={{ "--g": "10px", marginTop: 18 }}>
            <input
              value={answer}
              onChange={function (e) { setAnswer(e.target.value); }}
              onKeyDown={function (e) { if (e.key === "Enter" && answer.trim()) submit(); }}
              placeholder="Your answer"
              style={{ flex: 1, padding: "11px 14px", borderRadius: 9, border: "1.5px solid " + C.line, fontSize: 14 }}
            />
            <PrimaryButton onClick={function () { if (answer.trim()) submit(); }}>Submit</PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizResult({ results, crumb, onExit, onRetry }) {
  var correct = results.filter(function (r) { return r.correct; }).length;
  var pct = Math.round((correct / results.length) * 100);
  return (
    <div>
      <TopBar crumb={crumb} onBack={onExit} />
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <Seal pct={pct} />
        <p style={{ color: C.inkSoft, fontSize: 14, marginTop: 12 }}>{correct} of {results.length} correct</p>
      </div>
      <div className="stack-v" style={{ "--g": "8px" }}>
        {results.map(function (r, i) {
          return (
            <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: r.correct ? C.greenTint : C.oxSoft, fontSize: 13, color: C.ink }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>{(r.correct ? "✓ " : "✗ ") + r.q}</div>
              {!r.correct && (
                <div style={{ color: C.inkSoft }}>
                  Your answer: <em>{r.given || "—"}</em> · Correct: <strong>{r.answer}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="stack-h" style={{ "--g": "10px", marginTop: 22, justifyContent: "center" }}>
        <PrimaryButton variant="outline" onClick={onRetry}>Try again</PrimaryButton>
        <PrimaryButton onClick={onExit}>Done</PrimaryButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- APP ROOT
export default function App() {
  var [progress, setProgress] = useState(loadProgress());
  var [view, setView] = useState("home");
  var [topicId, setTopicId] = useState(null);
  var [generalItems, setGeneralItems] = useState([]);
  var [quizItems, setQuizItems] = useState([]);
  var [quizResults, setQuizResults] = useState(null);
  var [quizCrumb, setQuizCrumb] = useState("");

  useEffect(function () { saveProgress(progress); }, [progress]);
  useEffect(function () { primeVoices(); }, []);

  function setBoxes(updater) {
    setProgress(function (prev) {
      var boxes = typeof updater === "function" ? updater(prev.boxes) : updater;
      return Object.assign({}, prev, { boxes: boxes });
    });
  }

  var topic = topicId ? COURSE.filter(function (t) { return t.id === topicId; })[0] : null;

  function goHome() {
    setView("home");
    setTopicId(null);
  }

  function startGeneralQuiz() {
    var items = [];
    COURSE.forEach(function (t) { items = items.concat(shuffle(t.quiz).slice(0, 3)); });
    items = shuffle(items);
    setGeneralItems(items);
    setQuizItems(items);
    setQuizCrumb("Home / General Quiz");
    setQuizResults(null);
    setView("generalQuiz");
  }

  return (
    <div style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: C.page, minHeight: "100%", color: C.ink }}>
      <style>{`
        ${FONTS_IMPORT}
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button, input { font-family: inherit; -webkit-appearance: none; appearance: none; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.brass}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }

        /* Flexbox row/column spacing that degrades gracefully on iOS Safari
           versions before 14.1, which don't support gap in flexbox. */
        .stack-h { display: flex; flex-direction: row; gap: var(--g, 10px); }
        .stack-v { display: flex; flex-direction: column; gap: var(--g, 10px); }
        @supports not (gap: 1px) {
          .stack-h > * { margin-right: var(--g, 10px); }
          .stack-h > *:last-child { margin-right: 0; }
          .stack-v > * { margin-bottom: var(--g, 10px); }
          .stack-v > *:last-child { margin-bottom: 0; }
        }
      `}</style>

      <div className="stack-h" style={{ "--g": "10px", alignItems: "center", borderBottom: "1px solid " + C.line, padding: "14px 20px", cursor: "pointer" }} onClick={goHome}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.forest, display: "flex", alignItems: "center", justifyContent: "center", color: C.brass, fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 14 }}>
          F
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 15, color: C.forest }}>Basic French — CE 141</div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 60px" }}>
        {view === "home" && (
          <Home
            onPick={function (key) {
              if (key === "topics") setView("topics");
              else if (key === "general") startGeneralQuiz();
              else if (key === "flashtest") setView("flashtest");
            }}
          />
        )}

        {view === "topics" && (
          <TopicList
            boxes={progress.boxes}
            onPick={function (id) { setTopicId(id); setView("topicMenu"); }}
            onBack={goHome}
          />
        )}

        {view === "topicMenu" && topic && (
          <TopicMenu
            topic={topic}
            boxes={progress.boxes}
            onBack={function () { setView("topics"); }}
            onMode={function (mode) {
              if (mode === "quiz") {
                setQuizItems(shuffle(topic.quiz));
                setQuizCrumb(topic.code + " / Quiz");
                setQuizResults(null);
                setView("quiz");
              } else {
                setView(mode);
              }
            }}
          />
        )}

        {view === "lecture" && topic && <Lecture topic={topic} onExit={function () { setView("topicMenu"); }} />}

        {view === "retention" && topic && (
          <Retention pool={allCardsOf(topic)} boxes={progress.boxes} setBoxes={setBoxes} onExit={function () { setView("topicMenu"); }} crumb={topic.code + " / Test Retention"} />
        )}

        {view === "flashtest" && (
          <Retention pool={allCardsEverywhere()} boxes={progress.boxes} setBoxes={setBoxes} onExit={goHome} crumb="Home / Flashcard Memorization Test" />
        )}

        {view === "quiz" && topic && !quizResults && (
          <Quiz items={quizItems} crumb={quizCrumb} onExit={function () { setView("topicMenu"); }} onFinish={function (r) { setQuizResults(r); }} />
        )}
        {view === "quiz" && topic && quizResults && (
          <QuizResult
            results={quizResults}
            crumb={quizCrumb}
            onExit={function () { setView("topicMenu"); }}
            onRetry={function () { setQuizResults(null); setQuizItems(shuffle(topic.quiz)); }}
          />
        )}

        {view === "generalQuiz" && !quizResults && <Quiz items={quizItems} crumb={quizCrumb} onExit={goHome} onFinish={function (r) { setQuizResults(r); }} />}
        {view === "generalQuiz" && quizResults && (
          <QuizResult
            results={quizResults}
            crumb={quizCrumb}
            onExit={goHome}
            onRetry={function () { setQuizResults(null); setQuizItems(shuffle(generalItems)); }}
          />
        )}
      </div>
    </div>
  );
}
