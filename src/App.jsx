import React, { useState, useEffect, useMemo } from "react";
import { COURSES } from "./data/courses";
import QUOTES from "./data/quotes.json";
import { Analytics, track } from "@vercel/analytics/react"
import QuizDuel from "./QuizDuel";

// One storage key for ALL courses now, namespaced internally by course id,
// so progress in French and Math (and every course after) never collides
// and a student never loses history when a new course is added.
const STORAGE_KEY = "uni-nergy-progress-v1";

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
  teal: "#0E7C86",
  tealSoft: "#E4F4F3",
};

const FONTS_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600&family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');";

// A pure-CSS "engineering notebook" texture: faint blueprint grid lines and
// a scatter of math symbols (as a tiny inline SVG data-URI, not a photo),
// layered over the existing dot-grid and forest gradient. Every layer stays
// under ~6% opacity so it reads as texture, not decoration, and nothing here
// depends on an external image request — it renders identically everywhere.
var MATH_SYMBOLS_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Ctext x='14' y='46' font-size='34' fill='white' fill-opacity='0.05' font-family='serif'%3E%CE%A3%3C/text%3E%3Ctext x='150' y='96' font-size='26' fill='white' fill-opacity='0.045' font-family='serif'%3E%CF%80%3C/text%3E%3Ctext x='44' y='168' font-size='30' fill='white' fill-opacity='0.05' font-family='serif'%3E%E2%88%9E%3C/text%3E%3Ctext x='168' y='214' font-size='24' fill='white' fill-opacity='0.045' font-family='serif'%3E%E2%88%9A%3C/text%3E%3Ctext x='96' y='232' font-size='22' fill='white' fill-opacity='0.04' font-family='serif'%3E%E2%88%AB%3C/text%3E%3C/svg%3E\") repeat";
const PAGE_TEXTURE =
  MATH_SYMBOLS_SVG + ", " +
  "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 44px), " +
  "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 44px), " +
  "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px) 0 0/24px 24px, " +
  "radial-gradient(rgba(201,150,44,0.06) 1px, transparent 1px) 12px 12px/24px 24px, " +
  "linear-gradient(160deg, #0E1F17 0%, #1B3A2B 50%, #22452F 100%)";

// ---------------------------------------------------------------- storage
// Progress is now shaped { [courseId]: { boxes, scores } } so every course
// keeps its own independent record under one storage key.
function loadAllProgress() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}
function saveAllProgress(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (e) {}
}
function emptyCourseProgress() {
  return { boxes: {}, scores: [], lastStudied: null };
}

// -------------------------------------------------------- activity + streak
var ACTIVITY_KEY = "uni-nergy-activity-log";
function todayStr(d) {
  var x = d || new Date();
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}
function loadActivityDates() {
  try {
    var raw = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch (e) { return []; }
}
function computeStreak(dates) {
  var set = {};
  dates.forEach(function (d) { set[d] = true; });
  var cur = new Date();
  if (!set[todayStr(cur)]) cur.setDate(cur.getDate() - 1);
  var streak = 0;
  while (set[todayStr(cur)]) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}
function relativeTime(ts) {
  if (!ts) return null;
  var diff = Date.now() - ts;
  var day = 86400000;
  if (diff < day && todayStr(new Date(ts)) === todayStr()) return "Today";
  if (diff < 2 * day) return "Yesterday";
  var days = Math.floor(diff / day);
  if (days < 7) return days + " days ago";
  var weeks = Math.floor(days / 7);
  return weeks + (weeks === 1 ? " week ago" : " weeks ago");
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
// Quiz-length choices: a few sensible fixed steps plus "All", each capped at
// the actual number of questions available so a short topic never offers
// more questions than it has.
function quizLengthOptions(max) {
  var steps = [5, 10, 15].filter(function (n) { return n < max; });
  steps.push(max);
  return steps;
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
function allCardsEverywhere(topics) {
  var out = [];
  topics.forEach(function (t) { out = out.concat(allCardsOf(t)); });
  return out;
}
function allQuizItems(topics) {
  var out = [];
  topics.forEach(function (t) { out = out.concat(t.quiz); });
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

// ---------------------------------------------------------------- DAILY SPARK
function dayOfYear(d) {
  var start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}
function loadLiked() {
  try { return JSON.parse(localStorage.getItem("uni-nergy-liked-quotes") || "{}"); } catch (e) { return {}; }
}
function GyeKorFie() {
  var todayQuote = useMemo(function () {
    return QUOTES[dayOfYear(new Date()) % QUOTES.length];
  }, []);
  var [liked, setLiked] = useState(function () { return !!loadLiked()[todayQuote.text]; });
  var [shareLabel, setShareLabel] = useState("Share");

  function toggleLike() {
    var likedMap = loadLiked();
    var next = !liked;
    if (next) likedMap[todayQuote.text] = true; else delete likedMap[todayQuote.text];
    try { localStorage.setItem("uni-nergy-liked-quotes", JSON.stringify(likedMap)); } catch (e) {}
    setLiked(next);
  }

  function share() {
    var text = "\u201C" + todayQuote.text + "\u201D \u2014 " + todayQuote.author + " (via Uni-Nergy)";
    try {
      if (navigator.share) {
        navigator.share({ text: text });
        return;
      }
    } catch (e) {}
    try {
      navigator.clipboard.writeText(text);
      setShareLabel("Copied!");
      setTimeout(function () { setShareLabel("Share"); }, 1800);
    } catch (e) {}
  }

  return (
    <div style={{ background: "linear-gradient(135deg, " + C.forest + " 0%, #234a34 100%)", borderRadius: 20, padding: "24px 22px 20px", boxShadow: "0 14px 34px rgba(27,58,43,0.3)", position: "relative", overflow: "hidden" }}>
      <div className="stack-h" style={{ "--g": "8px", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 15 }}>🌿</span>
        <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.brassDim, fontWeight: 600 }}>Gye Kor Fie</div>
      </div>
      <p style={{ fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 18.5, lineHeight: 1.5, color: C.chalk, margin: "0 0 6px" }}>
        “{todayQuote.text}”
      </p>
      <div style={{ fontSize: 12, color: C.brassDim, fontWeight: 600, marginBottom: 14 }}>— {todayQuote.author}</div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.14)", marginBottom: 14 }} />
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(243,239,227,0.85)", margin: "0 0 18px", fontStyle: "italic" }}>
        {todayQuote.reflection}
      </p>
      <div className="stack-h" style={{ "--g": "10px", alignItems: "center" }}>
        <SpeakerButton segments={[{ text: todayQuote.text, lang: "en" }]} dark />
        <button
          onClick={toggleLike}
          aria-label="Appreciate"
          style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: liked ? "rgba(140,58,46,0.35)" : "rgba(255,255,255,0.08)", color: liked ? "#F2A79A" : C.chalk, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "transform 0.15s ease" }}
        >
          {liked ? "♥" : "♡"}
        </button>
        <button
          onClick={share}
          style={{ marginLeft: "auto", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: C.chalk, fontSize: 12.5, fontWeight: 600, padding: "9px 14px", borderRadius: 9, cursor: "pointer" }}
        >
          📤 {shareLabel}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- NAVIGATION
var NAV_ITEMS = [
  { key: "dashboard", label: "Home", icon: "🏠" },
  { key: "courses", label: "Courses", icon: "📚" },
  { key: "duel", label: "Quiz Duel", icon: "⚔️" },
  { key: "profile", label: "Profile", icon: "👤" },
];
function TopNav({ active, onChange }) {
  return (
    <div className="unav-desktop" style={{ "--g": "6px", alignItems: "center", justifyContent: "center", padding: "10px 16px" }}>
      {NAV_ITEMS.map(function (it) {
        var isActive = active === it.key;
        return (
          <button
            key={it.key}
            onClick={function () { onChange(it.key); }}
            style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: isActive ? "rgba(201,150,44,0.16)" : "transparent", color: isActive ? C.brass : C.chalk, fontWeight: 600, fontSize: 13.5, padding: "9px 16px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s ease" }}
          >
            <span style={{ fontSize: 15 }}>{it.icon}</span> {it.label}
          </button>
        );
      })}
    </div>
  );
}
function BottomNav({ active, onChange }) {
  var idx = NAV_ITEMS.findIndex(function (it) { return it.key === active; });
  var safeIdx = idx === -1 ? 0 : idx;
  return (
    <div className="unav-mobile" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 10, justifyContent: "center", padding: "0 12px calc(env(safe-area-inset-bottom, 0px) + 14px)" }}>
      <div style={{ position: "relative", display: "flex", width: "100%", maxWidth: 420, background: "rgba(14,31,23,0.94)", backdropFilter: "blur(14px)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 14px 34px rgba(0,0,0,0.32)", padding: 6 }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: 6, bottom: 6, left: 6,
            width: "calc((100% - 12px) / " + NAV_ITEMS.length + ")",
            transform: "translateX(calc(" + safeIdx + " * 100%))",
            background: "rgba(201,150,44,0.18)",
            border: "1px solid rgba(201,150,44,0.35)",
            borderRadius: 15,
            transition: "transform 0.28s cubic-bezier(0.34, 1.2, 0.64, 1)",
          }}
        />
        {NAV_ITEMS.map(function (it) {
          var isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={function () { onChange(it.key); }}
              style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, border: "none", background: "none", color: isActive ? C.brass : "rgba(243,239,227,0.65)", fontSize: 10.5, fontWeight: 600, padding: "8px 4px", cursor: "pointer" }}
            >
              <span style={{ fontSize: 18, transform: isActive ? "scale(1.08)" : "scale(1)", transition: "transform 0.2s ease" }}>{it.icon}</span> {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- FOOTER & MODAL
function SimpleModal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(14,31,23,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
      <div onClick={function (e) { e.stopPropagation(); }} style={{ background: "#fff", borderRadius: 16, padding: "26px 24px", maxWidth: 420, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
        <h3 style={{ fontFamily: "Fraunces, serif", color: C.forest, marginTop: 0 }}>{title}</h3>
        <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.65 }}>{children}</div>
        <PrimaryButton onClick={onClose} style={{ marginTop: 18 }}>Close</PrimaryButton>
      </div>
    </div>
  );
}
function Footer({ onOpenModal }) {
  return (
    <footer style={{ marginTop: 30, paddingTop: 18, borderTop: "1px solid " + C.line, textAlign: "center" }}>
      <div className="stack-h" style={{ "--g": "18px", justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <a href="https://wa.me/233508942045" target="_blank" rel="noreferrer" style={{ color: C.forest, fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>Contact Us</a>
        <button onClick={function () { onOpenModal("about"); }} style={{ border: "none", background: "none", color: C.forest, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>About</button>
        <button onClick={function () { onOpenModal("privacy"); }} style={{ border: "none", background: "none", color: C.forest, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>Privacy</button>
      </div>
      <div style={{ fontSize: 11, color: C.inkSoft }}>Uni-Nergy Education · v1.0.0</div>
    </footer>
  );
}

// ---------------------------------------------------------------- HOME
// ---------------------------------------------------------------- COURSE SELECT
function CourseSelect({ courses, onPick }) {
  var [query, setQuery] = useState("");
  var filtered = courses.filter(function (c) {
    var q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().indexOf(q) !== -1 || c.code.toLowerCase().indexOf(q) !== -1;
  });
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "0.14em", color: C.brass, textTransform: "uppercase", marginBottom: 10 }}>
          Uni-Nergy Education
        </div>
        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 34, margin: 0, color: C.forest }}>
          Which course are you studying?
        </h1>
      </div>
      <input
        type="text"
        value={query}
        onChange={function (e) { setQuery(e.target.value); }}
        placeholder="Search courses by name or code…"
        style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1px solid " + C.line, background: "#fff", fontSize: 14.5, color: C.ink, marginBottom: 18 }}
      />
      <div className="stack-v" style={{ "--g": "14px" }}>
        {filtered.length === 0 && (
          <div style={{ color: C.inkSoft, fontSize: 14, textAlign: "center", padding: "20px 0" }}>No courses match "{query}".</div>
        )}
        {filtered.map(function (c) {
          return (
            <button
              key={c.id}
              onClick={function () { onPick(c.id); }}
              className="stack-h"
              style={{ "--g": "16px", alignItems: "center", textAlign: "left", padding: "20px 20px", borderRadius: 14, border: "1px solid " + C.line, background: "#fff", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 10, background: C.greenTint, color: C.forest, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18 }}>
                {c.letter}
              </div>
              <div>
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: C.ink }}>{c.name}</div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{c.code}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Home({ onPick, course }) {
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
          {course.code} · {course.name}
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
function TopicList({ topics, boxes, onPick, onBack }) {
  return (
    <div>
      <TopBar crumb="Home / Study a Topic" onBack={onBack} />
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, color: C.forest, marginTop: 0 }}>Course catalog</h2>
      <div className="stack-v" style={{ "--g": "10px" }}>
        {topics.map(function (t) {
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
        <ModeCard title="Quiz" desc="Graded questions in the style of your actual exam papers — you choose how many." onClick={function () { onMode("quiz"); }} />
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
function Lecture({ topic, onExit, hasAudio }) {
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
          {hasAudio && <SpeakerButton segments={segments} dark />}
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
function Retention({ pool, boxes, setBoxes, onExit, crumb, hasAudio }) {
  var [currentId, setCurrentId] = useState(function () { return pickWeighted(pool, boxes, null).id; });
  var [flipped, setFlipped] = useState(false);
  var [reviewed, setReviewed] = useState(0);
  var [history, setHistory] = useState([]);

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
    setHistory(function (h) { return h.concat([currentId]); });
    var next = pickWeighted(pool, updatedBoxes, current.id);
    setCurrentId(next.id);
    setFlipped(false);
  }

  function handlePrevious() {
    if (history.length === 0) return;
    var prevId = history[history.length - 1];
    setHistory(function (h) { return h.slice(0, -1); });
    setCurrentId(prevId);
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
          {hasAudio && <SpeakerButton segments={[{ text: flipped ? current.back : current.front, lang: "fr" }]} dark />}
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
      <div style={{ marginTop: 12 }}>
        <PrimaryButton variant="outline" onClick={handlePrevious} disabled={history.length === 0} style={{ width: "100%" }}>
          ← Previous
        </PrimaryButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- QUIZ MODE
// ---------------------------------------------------------------- QUIZ SETUP
function QuizSetup({ crumb, max, onStart, onBack }) {
  var options = quizLengthOptions(max);
  return (
    <div>
      <TopBar crumb={crumb} onBack={onBack} />
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, color: C.forest, marginTop: 0 }}>How many questions?</h2>
      <p style={{ color: C.inkSoft, fontSize: 13.5, marginTop: -6, marginBottom: 20 }}>{max} question{max === 1 ? "" : "s"} available for this quiz.</p>
      <div className="stack-v" style={{ "--g": "10px" }}>
        {options.map(function (n) {
          return (
            <button
              key={n}
              onClick={function () { onStart(n); }}
              style={{ textAlign: "left", padding: "16px 18px", borderRadius: 12, border: "1px solid " + C.line, background: "#fff", cursor: "pointer", fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16, color: C.ink, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span>{n === max ? "All " + n + " questions" : n + " questions"}</span>
              <span style={{ color: C.inkSoft, fontSize: 18 }}>›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Quiz({ items, crumb, onExit, onFinish, hasAudio }) {
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
          {hasAudio && <SpeakerButton segments={[{ text: item.q, lang: item.qLang === "en" ? "en" : "fr" }]} />}
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

// ---------------------------------------------------------------- DASHBOARD (new Home tab)
function timeGreeting() {
  var h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}
var ENCOURAGEMENT_LINES = [
  "Small progress every day builds remarkable results.",
  "Today's effort becomes tomorrow's confidence.",
  "One focused session is enough to move forward.",
  "You're closer than you were yesterday.",
];
function SnapshotCard({ icon, value, label, accent }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "14px 14px", border: "1px solid " + C.line, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: accent + "22", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 19, color: C.ink, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3 }}>{label}</div>
    </div>
  );
}
function LearningSnapshot({ allProgress, courses, activityDates }) {
  var streak = computeStreak(activityDates);
  var cardsReviewed = 0, correctSum = 0, totalSum = 0, quizzesToday = 0;
  courses.forEach(function (c) {
    var p = allProgress[c.id];
    if (!p) return;
    cardsReviewed += Object.keys(p.boxes || {}).length;
    (p.scores || []).forEach(function (s) {
      correctSum += s.correct;
      totalSum += s.total;
      if (todayStr(new Date(s.date)) === todayStr()) quizzesToday++;
    });
  });
  var accuracy = totalSum > 0 ? Math.round((correctSum / totalSum) * 100) + "%" : "—";
  var todayLabel = activityDates.indexOf(todayStr()) !== -1 ? (quizzesToday > 0 ? quizzesToday + " quiz" + (quizzesToday === 1 ? "" : "es") : "Studying") : "Not yet";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
      <SnapshotCard icon="🔥" value={streak} label="Day Streak" accent={C.brass} />
      <SnapshotCard icon="🗂️" value={cardsReviewed} label="Flashcards Reviewed" accent={C.teal} />
      <SnapshotCard icon="🎯" value={accuracy} label="Quiz Accuracy" accent={C.ox} />
      <SnapshotCard icon="✅" value={todayLabel} label="Today's Progress" accent={C.forest} />
    </div>
  );
}
function ContinueLearningCard({ course, progress, onContinue }) {
  var allCards = allCardsEverywhere(course.topics);
  var mastered = allCards.filter(function (cd) { return boxOf(progress.boxes, cd.id) >= 4; }).length;
  var pct = allCards.length ? Math.round((mastered / allCards.length) * 100) : 0;
  var last = relativeTime(progress.lastStudied);
  return (
    <button
      onClick={onContinue}
      className="stack-h"
      style={{ "--g": "14px", alignItems: "center", textAlign: "left", width: "100%", padding: "16px 16px", borderRadius: 14, border: "1px solid " + C.line, background: "#fff", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 10, background: C.greenTint, color: C.forest, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 16 }}>
        {course.letter}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 15.5, color: C.ink }}>{course.name}</div>
        <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{pct}% mastered{last ? " · Last studied " + last : ""}</div>
        <div style={{ height: 5, background: C.line, borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg, " + C.teal + ", " + C.forest + ")", borderRadius: 4, transition: "width 0.4s ease" }} />
        </div>
      </div>
      <span style={{ color: C.brass, fontSize: 15, flexShrink: 0 }}>→</span>
    </button>
  );
}
function Dashboard({ allProgress, courses, activityDates, onQuickAction, onOpenCourse }) {
  var encouragement = useMemo(function () {
    return ENCOURAGEMENT_LINES[dayOfYear(new Date()) % ENCOURAGEMENT_LINES.length];
  }, []);
  var studied = courses
    .map(function (c) { return { course: c, progress: allProgress[c.id] || emptyCourseProgress() }; })
    .filter(function (x) { return x.progress.lastStudied; })
    .sort(function (a, b) { return (b.progress.lastStudied || 0) - (a.progress.lastStudied || 0); });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, letterSpacing: "0.14em", color: C.brass, textTransform: "uppercase", marginBottom: 8 }}>{timeGreeting()}</div>
        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 27, margin: 0, color: C.forest, lineHeight: 1.3 }}>
          Ready to continue your learning journey?
        </h1>
        <p style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 8, lineHeight: 1.5 }}>{encouragement}</p>
      </div>

      <div style={{ marginBottom: 26 }}>
        <LearningSnapshot allProgress={allProgress} courses={courses} activityDates={activityDates} />
      </div>

      <div style={{ marginBottom: 26 }}>
        <GyeKorFie />
      </div>

      <div style={{ marginBottom: 26 }}>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: C.forest, margin: "0 0 12px" }}>Continue Learning</h2>
        {studied.length > 0 ? (
          <div className="stack-v" style={{ "--g": "10px" }}>
            {studied.slice(0, 3).map(function (x) {
              return (
                <ContinueLearningCard
                  key={x.course.id}
                  course={x.course}
                  progress={x.progress}
                  onContinue={function () { onOpenCourse(x.course.id); }}
                />
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "20px 18px", borderRadius: 14, border: "1px dashed " + C.line, textAlign: "center", color: C.inkSoft, fontSize: 13.5, lineHeight: 1.6 }}>
            Ready to begin? Choose a course and let's build momentum.
            <div style={{ marginTop: 12 }}>
              <PrimaryButton onClick={function () { onQuickAction("browse"); }}>Browse Courses</PrimaryButton>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: C.forest, margin: "0 0 12px" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {[
            { key: "browse", label: "Browse Courses", icon: "📚", accent: C.forest },
            { key: "flashtest", label: "Flashcards", icon: "🗂️", accent: C.teal },
            { key: "quiz", label: "Quiz", icon: "📝", accent: C.brass },
            { key: "duel", label: "Quiz Duel", icon: "⚔️", accent: C.ox },
          ].map(function (a) {
            return (
              <button
                key={a.key}
                onClick={function () { onQuickAction(a.key); }}
                className="stack-v"
                style={{ "--g": "8px", alignItems: "center", justifyContent: "center", padding: "18px 10px", borderRadius: 14, border: "1px solid " + C.line, background: "#fff", cursor: "pointer" }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: a.accent + "1c", color: a.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{a.icon}</div>
                <span style={{ fontWeight: 600, fontSize: 12.5, color: C.ink }}>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- PROFILE (placeholder)
function ProfilePlaceholder({ allProgress, courses }) {
  var rows = courses.map(function (c) {
    var p = allProgress[c.id] || emptyCourseProgress();
    var allCards = allCardsEverywhere(c.topics);
    var mastered = allCards.filter(function (cd) { return boxOf(p.boxes, cd.id) >= 4; }).length;
    var pct = allCards.length ? Math.round((mastered / allCards.length) * 100) : 0;
    return { course: c, pct: pct };
  });
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.greenTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 26 }}>👤</div>
        <h2 style={{ fontFamily: "Fraunces, serif", color: C.forest, margin: 0 }}>Your Profile</h2>
        <p style={{ color: C.inkSoft, fontSize: 13, marginTop: 4 }}>Progress across all your courses</p>
      </div>
      <div className="stack-v" style={{ "--g": "10px" }}>
        {rows.map(function (r) {
          return (
            <div key={r.course.id} className="stack-h" style={{ "--g": "14px", alignItems: "center", padding: "14px 16px", borderRadius: 12, border: "1px solid " + C.line, background: "#fff" }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: C.greenTint, color: C.forest, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Fraunces, serif", fontWeight: 700, flexShrink: 0 }}>{r.course.letter}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 14.5, color: C.ink }}>{r.course.name}</div>
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 1 }}>{r.pct}% mastered</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- APP ROOT
export default function App() {
  var [allProgress, setAllProgress] = useState(loadAllProgress());
  var [tab, setTab] = useState(function () {
    try {
      if (typeof window !== "undefined" && window.location.search.indexOf("duel=") !== -1) return "duel";
    } catch (e) {}
    return "dashboard";
  });
  var [modal, setModal] = useState(null);
  var [view, setView] = useState("courseSelect");
  var [courseId, setCourseId] = useState(null);
  var [topicId, setTopicId] = useState(null);
  var [generalItems, setGeneralItems] = useState([]);
  var [quizItems, setQuizItems] = useState([]);
  var [quizResults, setQuizResults] = useState(null);
  var [quizCrumb, setQuizCrumb] = useState("");
  var [activityDates, setActivityDates] = useState(loadActivityDates());

  useEffect(function () { saveAllProgress(allProgress); }, [allProgress]);
  useEffect(function () { primeVoices(); }, []);

  function recordActivity() {
    var dates = loadActivityDates();
    var t = todayStr();
    if (dates.indexOf(t) === -1) {
      dates = dates.concat([t]);
      try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(dates)); } catch (e) {}
      setActivityDates(dates);
    }
  }
  function recordQuizScore(cId, correct, total) {
    recordActivity();
    setAllProgress(function (prev) {
      var current = prev[cId] || emptyCourseProgress();
      var scores = (current.scores || []).concat([{ correct: correct, total: total, date: Date.now() }]);
      var next = Object.assign({}, current, { scores: scores, lastStudied: Date.now() });
      var o = {}; o[cId] = next; return Object.assign({}, prev, o);
    });
  }
  function openCourse(id) {
    setCourseId(id);
    setTab("courses");
    setView("home");
  }

  var course = courseId ? COURSES.filter(function (c) { return c.id === courseId; })[0] : null;
  var progress = (courseId && allProgress[courseId]) ? allProgress[courseId] : emptyCourseProgress();

  function setBoxes(updater) {
    recordActivity();
    setAllProgress(function (prev) {
      var current = prev[courseId] || emptyCourseProgress();
      var boxes = typeof updater === "function" ? updater(current.boxes) : updater;
      var nextCourseProgress = Object.assign({}, current, { boxes: boxes, lastStudied: Date.now() });
      return Object.assign({}, prev, (function () { var o = {}; o[courseId] = nextCourseProgress; return o; })());
    });
  }

  var topic = topicId && course ? course.topics.filter(function (t) { return t.id === topicId; })[0] : null;

  function goCourseSelect() {
    setTab("courses");
    setView("courseSelect");
    setCourseId(null);
    setTopicId(null);
  }

  function handleQuickAction(key) {
    if (key === "browse") { setTab("courses"); setView("courseSelect"); }
    else if (key === "continue") {
      setTab("courses");
      setView(courseId ? "home" : "courseSelect");
    } else if (key === "topics" || key === "flashtest") {
      setTab("courses");
      setView(courseId ? key : "courseSelect");
    } else if (key === "general") {
      setTab("courses");
      goToGeneralQuizSetup();
    } else if (key === "quiz") {
      setTab("courses");
      if (courseId) goToGeneralQuizSetup(); else setView("courseSelect");
    } else if (key === "duel") {
      setTab("duel");
    }
  }

  function goHome() {
    setView("home");
    setTopicId(null);
  }

  function pickCourse(id) {
    setCourseId(id);
    setView("home");
  }

  function goToGeneralQuizSetup() {
    setQuizCrumb(course.code + " / General Quiz");
    setView("generalQuizSetup");
  }

  function startGeneralQuiz(count) {
    var pool = allQuizItems(course.topics);
    var items = shuffle(pool).slice(0, count);
    setGeneralItems(items);
    setQuizItems(items);
    setQuizResults(null);
    setView("generalQuiz");
  }

  // Minimal, near-zero-cost usage signal — this is the piece that turns
  // "we built an app" into "we can show a lecturer/investor it works."
  function logEvent(name, data) {
    try { track(name, Object.assign({ course: courseId }, data || {})); } catch (e) {}
  }

  return (
    <div style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: PAGE_TEXTURE, backgroundAttachment: "fixed", minHeight: "100dvh", width: "100%", color: C.ink, display: "flex", flexDirection: "column" }}>
      <style>{`
        ${FONTS_IMPORT}
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { margin: 0; }
        button, input { font-family: inherit; -webkit-appearance: none; appearance: none; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.brass}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
        button { transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; }
        button:hover:not(:disabled) { transform: translateY(-1px); }
        button:active:not(:disabled) { transform: translateY(0); }

        .unav-desktop { display: flex; }
        .unav-mobile { display: none; }
        @media (max-width: 768px) {
          .unav-desktop { display: none; }
          .unav-mobile { display: flex; }
        }

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

      <div style={{ position: "sticky", top: 0, zIndex: 5, background: "rgba(14,31,23,0.55)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="stack-h" style={{ "--g": "10px", alignItems: "center", padding: "12px 20px 4px" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.brass, display: "flex", alignItems: "center", justifyContent: "center", color: C.forest, fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>U</div>
          <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 14.5, color: C.chalk }}>Uni-Nergy Education</div>
        </div>
        <TopNav active={tab} onChange={setTab} />
        {tab === "courses" && (
          <div className="stack-h" style={{ "--g": "10px", alignItems: "center", padding: "6px 20px 12px", cursor: "pointer" }} onClick={goCourseSelect}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(201,150,44,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: C.brass, fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
              {course ? course.letter : "?"}
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(243,239,227,0.85)" }}>
              {course ? course.name + " — " + course.code : "Choose a course"}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, width: "100%", display: "flex", justifyContent: "center", padding: "28px 14px 90px" }}>
        <div style={{ width: "100%", maxWidth: 640, background: "rgba(250,250,248,0.94)", backdropFilter: "blur(14px)", borderRadius: 20, padding: "24px 22px 20px", boxShadow: "0 24px 70px rgba(0,0,0,0.35), 0 2px 0 rgba(255,255,255,0.4) inset", border: "1px solid rgba(255,255,255,0.5)", height: "fit-content" }}>
        {tab === "dashboard" && (
          <Dashboard allProgress={allProgress} courses={COURSES} activityDates={activityDates} onQuickAction={handleQuickAction} onOpenCourse={openCourse} />
        )}

        {tab === "duel" && <QuizDuel courses={COURSES} onExit={function () { setTab("dashboard"); }} />}

        {tab === "profile" && <ProfilePlaceholder allProgress={allProgress} courses={COURSES} />}

        {tab === "courses" && (
        <React.Fragment>
        {view === "courseSelect" && (
          <CourseSelect courses={COURSES} onPick={pickCourse} />
        )}

        {view === "home" && course && (
          <Home
            course={course}
            onPick={function (key) {
              if (key === "topics") setView("topics");
              else if (key === "general") goToGeneralQuizSetup();
              else if (key === "flashtest") setView("flashtest");
            }}
          />
        )}

        {view === "topics" && course && (
          <TopicList
            topics={course.topics}
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
                setQuizCrumb(topic.code + " / Quiz");
                setQuizResults(null);
                setView("quizSetup");
              } else {
                setView(mode);
              }
            }}
          />
        )}

        {view === "quizSetup" && topic && (
          <QuizSetup
            crumb={quizCrumb}
            max={topic.quiz.length}
            onStart={function (n) { setQuizItems(shuffle(topic.quiz).slice(0, n)); setView("quiz"); }}
            onBack={function () { setView("topicMenu"); }}
          />
        )}

        {view === "generalQuizSetup" && course && (
          <QuizSetup
            crumb={quizCrumb}
            max={allQuizItems(course.topics).length}
            onStart={startGeneralQuiz}
            onBack={goHome}
          />
        )}

        {view === "lecture" && topic && <Lecture topic={topic} hasAudio={course.lang === "fr"} onExit={function () { setView("topicMenu"); }} />}

        {view === "retention" && topic && (
          <Retention pool={allCardsOf(topic)} boxes={progress.boxes} setBoxes={setBoxes} hasAudio={course.lang === "fr"} onExit={function () { setView("topicMenu"); }} crumb={topic.code + " / Test Retention"} />
        )}

        {view === "flashtest" && course && (
          <Retention pool={allCardsEverywhere(course.topics)} boxes={progress.boxes} setBoxes={setBoxes} hasAudio={course.lang === "fr"} onExit={goHome} crumb="Home / Flashcard Memorization Test" />
        )}

        {view === "quiz" && topic && !quizResults && (
          <Quiz items={quizItems} crumb={quizCrumb} hasAudio={course.lang === "fr"} onExit={function () { setView("topicMenu"); }} onFinish={function (r) { var correct = r.filter(function (x) { return x.correct; }).length; logEvent("quiz_complete", { topic: topic.id, score: correct, total: r.length }); recordQuizScore(courseId, correct, r.length); setQuizResults(r); }} />
        )}
        {view === "quiz" && topic && quizResults && (
          <QuizResult
            results={quizResults}
            crumb={quizCrumb}
            onExit={function () { setView("topicMenu"); }}
            onRetry={function () { setQuizResults(null); setQuizItems(shuffle(topic.quiz).slice(0, quizItems.length)); }}
          />
        )}

        {view === "generalQuiz" && course && !quizResults && <Quiz items={quizItems} crumb={quizCrumb} hasAudio={course.lang === "fr"} onExit={goHome} onFinish={function (r) { var correct = r.filter(function (x) { return x.correct; }).length; logEvent("quiz_complete", { topic: "general", score: correct, total: r.length }); recordQuizScore(courseId, correct, r.length); setQuizResults(r); }} />}
        {view === "generalQuiz" && quizResults && (
          <QuizResult
            results={quizResults}
            crumb={quizCrumb}
            onExit={goHome}
            onRetry={function () { setQuizResults(null); setQuizItems(shuffle(generalItems)); }}
          />
        )}
        </React.Fragment>
        )}

        <Footer onOpenModal={setModal} />
        </div>
      </div>

      {modal === "about" && (
        <SimpleModal title="About Uni-Nergy Education" onClose={function () { setModal(null); }}>
          Uni-Nergy Education is a learning companion for UMaT students — lectures, spaced-repetition flashcards, and exam-style quizzes for your real courses. Built by a student, for students.
        </SimpleModal>
      )}
      {modal === "privacy" && (
        <SimpleModal title="Privacy" onClose={function () { setModal(null); }}>
          Your study progress is stored only on this device (browser local storage) — it isn't sent anywhere. Anonymous, aggregate usage events (like quiz completions) are collected to help improve the app.
        </SimpleModal>
      )}

      <BottomNav active={tab} onChange={setTab} />
      <Analytics />
    </div>
  );
}
