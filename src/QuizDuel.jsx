import { useState, useEffect, useMemo, useRef } from "react";

// ============================================================ PALETTE
// Mirrors App.jsx's palette plus a dedicated "gold energy" accent so
// Quiz Duel reads as its own moment inside a calm app, per spec.
var C = {
  forest: "#1B3A2B",
  forestDeep: "#0E1F17",
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
  gold: "#F5B942",
  goldSoft: "#FFF3D6",
};

var DIFFICULTIES = [
  { key: "easy", label: "Easy", color: C.teal },
  { key: "medium", label: "Medium", color: C.brass },
  { key: "hard", label: "Hard", color: C.ox },
];
var QUESTION_COUNTS = [10, 15, 20, 25, 30];
var TIME_LIMITS = [5, 10, 15, 20];
var STUDY_TIPS = [
  "Read every question carefully.",
  "Confidence comes from preparation.",
  "Stay calm. Think first.",
  "A wrong answer is just information for later.",
  "Breathe — you've prepared for this.",
];
var PRACTICE_NAMES = ["Kwame", "Abena", "Yaw", "Efua", "Kojo", "Ama", "Kofi", "Adjoa", "Akosua", "Kwabena"];

// ============================================================ HELPERS
function pad2(n) { return n < 10 ? "0" + n : "" + n; }
function fmtClock(totalSeconds) {
  var s = Math.max(0, Math.round(totalSeconds));
  var m = Math.floor(s / 60);
  var r = s % 60;
  return pad2(m) + ":" + pad2(r);
}
function genCode() {
  var alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  var out = "";
  for (var i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
// Deterministic string -> 32-bit seed, then mulberry32 PRNG. This is what
// lets two separate devices, given the same duel code, regenerate the exact
// same shuffled question set without a backend to sync it for them.
function seedFromString(str) {
  var h = 1779033703 ^ str.length;
  for (var i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  var t = seed;
  return function () {
    t |= 0; t = (t + 0x6D2B79F5) | 0;
    var r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle(arr, seedStr) {
  var rand = mulberry32(seedFromString(seedStr));
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rand() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
function allQuizItemsOf(topics) {
  var out = [];
  topics.forEach(function (t) { out = out.concat(t.quiz.map(function (q) { return Object.assign({}, q, { topicId: t.id }); })); });
  return out;
}
function perfMessage(pct) {
  if (pct >= 85) return "Excellent preparation.";
  if (pct >= 70) return "You're getting stronger every session.";
  if (pct >= 50) return "Good effort — a little more revision will help.";
  return "Almost there — review the missed concepts and try again.";
}
function encodeDuel(cfg) {
  try { return btoa(encodeURIComponent(JSON.stringify(cfg))); } catch (e) { return ""; }
}
function decodeDuel(str) {
  try { return JSON.parse(decodeURIComponent(atob(str))); } catch (e) { return null; }
}
function inviteLinkFor(cfg) {
  var base = (typeof window !== "undefined") ? window.location.origin + window.location.pathname : "";
  return base + "?duel=" + encodeDuel(cfg);
}
function waTemplate(cfg, link, variant) {
  var lines = variant === "A"
    ? [
        "⚔️ Quiz Duel Invitation",
        "",
        "I'm sharpening my skills for our upcoming quiz.",
        "Join my Uni-Nergy Quiz Duel and let's challenge ourselves together.",
      ]
    : [
        "Ready for a friendly challenge?",
        "",
        "I've created a Quiz Duel on Uni-Nergy.",
        "Let's revise together and compare how prepared we really are.",
      ];
  lines.push("");
  lines.push("📘 " + cfg.courseName);
  lines.push("📝 " + cfg.topicLabel);
  lines.push("🎯 " + cfg.difficultyLabel);
  lines.push("⏱ " + cfg.timeLimitMin + " minutes");
  lines.push("🕒 Starts: " + new Date(cfg.startAt).toLocaleString([], { weekday: undefined, hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }));
  lines.push("");
  lines.push(link);
  return lines.join("\n");
}
function qrUrlFor(link) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=" + encodeURIComponent(link);
}
function readDuelFromLocation() {
  try {
    var params = new URLSearchParams(window.location.search);
    var raw = params.get("duel");
    if (!raw) return null;
    return decodeDuel(raw);
  } catch (e) { return null; }
}

// ============================================================ SHARED BITS
function GlowBackdrop() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit" }}>
      <div className="duel-glow duel-glow-a" />
      <div className="duel-glow duel-glow-b" />
      <div className="duel-particles">
        {Array.from({ length: 14 }).map(function (_, i) {
          return <span key={i} className={"duel-particle p" + (i % 7)} />;
        })}
      </div>
    </div>
  );
}
function DuelButton({ children, onClick, variant, style, disabled, full }) {
  var v = variant || "gold";
  var bg = v === "gold" ? "linear-gradient(135deg, " + C.gold + ", " + C.brass + ")" : v === "dark" ? C.forest : v === "ghost" ? "transparent" : "#fff";
  var color = v === "gold" ? C.forestDeep : v === "dark" ? C.chalk : v === "ghost" ? C.chalk : C.ink;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="duel-btn"
      style={Object.assign(
        {
          background: bg,
          color: color,
          border: v === "ghost" ? "1.5px solid rgba(255,255,255,0.3)" : "none",
          fontWeight: 700,
          fontSize: 15,
          padding: "15px 22px",
          borderRadius: 14,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.45 : 1,
          width: full ? "100%" : "auto",
          fontFamily: "Inter, sans-serif",
        },
        style || {}
      )}
    >
      {children}
    </button>
  );
}
function BackRow({ onBack, label }) {
  return (
    <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: C.inkSoft, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 0", marginBottom: 16 }}>
      ← {label || "Back"}
    </button>
  );
}
function Chip({ active, onClick, children, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: 12,
        border: "1.5px solid " + (active ? (accent || C.gold) : C.line),
        background: active ? (accent ? accent + "1c" : C.goldSoft) : "#fff",
        color: active ? (accent || "#8a6412") : C.ink,
        fontWeight: 700,
        fontSize: 13.5,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

// ============================================================ LANDING
function Landing({ onCreate, onJoin, onExit }) {
  return (
    <div style={{ position: "relative" }}>
      <BackRow onBack={onExit} label="Home" />
      <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "linear-gradient(160deg, " + C.forestDeep + " 0%, " + C.forest + " 55%, #234a34 100%)", padding: "40px 24px 34px", textAlign: "center" }}>
        <GlowBackdrop />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="duel-icon-pulse" style={{ fontSize: 46, marginBottom: 14 }}>⚔️</div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 30, color: C.chalk, margin: "0 0 10px" }}>Quiz Duel</h1>
          <p style={{ color: "rgba(243,239,227,0.82)", fontSize: 14, lineHeight: 1.6, maxWidth: 340, margin: "0 auto 28px" }}>
            Challenge your classmates, revise together and discover who is truly ready before tomorrow's quiz.
          </p>
          <div className="stack-v" style={{ "--g": "12px", maxWidth: 320, margin: "0 auto" }}>
            <DuelButton onClick={onCreate} full>⚔️ Create Duel</DuelButton>
            <DuelButton onClick={onJoin} variant="ghost" full>Join Duel</DuelButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================ JOIN (paste link)
function JoinPanel({ onBack, onResolved }) {
  var [value, setValue] = useState("");
  var [error, setError] = useState("");
  function resolve() {
    var raw = value.trim();
    var m = raw.match(/duel=([^&]+)/);
    var token = m ? m[1] : raw;
    var cfg = decodeDuel(token);
    if (!cfg || !cfg.courseId) {
      setError("That doesn't look like a valid Uni-Nergy duel link. Ask your classmate to resend it.");
      return;
    }
    onResolved(cfg);
  }
  return (
    <div>
      <BackRow onBack={onBack} label="Quiz Duel" />
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: C.forest, marginTop: 0 }}>Join a Duel</h2>
      <p style={{ color: C.inkSoft, fontSize: 13.5, lineHeight: 1.6, marginTop: -6 }}>
        Paste the invite link your classmate shared with you.
      </p>
      <input
        value={value}
        onChange={function (e) { setError(""); setValue(e.target.value); }}
        placeholder="https://…?duel=…"
        style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1px solid " + C.line, fontSize: 13.5, marginBottom: 10 }}
      />
      {error && <div style={{ color: C.ox, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <DuelButton onClick={resolve} full disabled={!value.trim()}>Continue</DuelButton>
    </div>
  );
}

// ============================================================ CREATE DUEL
function CreateDuel({ courses, onBack, onGenerated }) {
  var [courseId, setCourseId] = useState(courses[0] ? courses[0].id : "");
  var course = courses.filter(function (c) { return c.id === courseId; })[0];
  var [topicId, setTopicId] = useState("general");
  var [difficulty, setDifficulty] = useState("medium");
  var [count, setCount] = useState(15);
  var [minutes, setMinutes] = useState(10);
  var [startChoice, setStartChoice] = useState("now");
  var [customTime, setCustomTime] = useState("");

  var availableItems = useMemo(function () {
    if (!course) return [];
    if (topicId === "general") return allQuizItemsOf(course.topics);
    var t = course.topics.filter(function (x) { return x.id === topicId; })[0];
    return t ? t.quiz : [];
  }, [course, topicId]);

  function computeStartAt() {
    var now = Date.now();
    if (startChoice === "now") return now + 45 * 1000;
    if (startChoice === "5") return now + 5 * 60 * 1000;
    if (startChoice === "15") return now + 15 * 60 * 1000;
    if (startChoice === "30") return now + 30 * 60 * 1000;
    if (startChoice === "custom" && customTime) {
      var parts = customTime.split(":");
      var d = new Date();
      d.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
      if (d.getTime() < now) d.setDate(d.getDate() + 1);
      return d.getTime();
    }
    return now + 60 * 1000;
  }

  function handleGenerate() {
    var code = genCode();
    var diffMeta = DIFFICULTIES.filter(function (d) { return d.key === difficulty; })[0];
    var topicLabel = topicId === "general" ? "General (all topics)" : (course.topics.filter(function (t) { return t.id === topicId; })[0] || {}).title || "General";
    var n = Math.min(count, availableItems.length || count);
    var cfg = {
      code: code,
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      topicId: topicId,
      topicLabel: topicLabel,
      difficulty: difficulty,
      difficultyLabel: diffMeta.label,
      questionCount: n,
      timeLimitMin: minutes,
      startAt: computeStartAt(),
      createdAt: Date.now(),
    };
    onGenerated(cfg);
  }

  return (
    <div>
      <BackRow onBack={onBack} label="Quiz Duel" />
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: C.forest, marginTop: 0, marginBottom: 4 }}>Configure your duel</h2>
      <p style={{ color: C.inkSoft, fontSize: 13, marginTop: 0, marginBottom: 20 }}>Everyone who joins takes the exact same questions.</p>

      <div style={{ marginBottom: 20 }}>
        <div className="duel-label">Course</div>
        <div className="stack-v" style={{ "--g": "8px" }}>
          {courses.map(function (c) {
            return (
              <button
                key={c.id}
                onClick={function () { setCourseId(c.id); setTopicId("general"); }}
                className="stack-h"
                style={{ "--g": "12px", alignItems: "center", textAlign: "left", padding: "12px 14px", borderRadius: 12, border: "1.5px solid " + (courseId === c.id ? C.gold : C.line), background: courseId === c.id ? C.goldSoft : "#fff", cursor: "pointer" }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: C.greenTint, color: C.forest, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 14 }}>{c.letter}</div>
                <div>
                  <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 14.5, color: C.ink }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: C.inkSoft }}>{c.code}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {course && (
        <div style={{ marginBottom: 20 }}>
          <div className="duel-label">Topic</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Chip active={topicId === "general"} onClick={function () { setTopicId("general"); }}>All topics</Chip>
            {course.topics.map(function (t) {
              return <Chip key={t.id} active={topicId === t.id} onClick={function () { setTopicId(t.id); }}>{t.title}</Chip>;
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div className="duel-label">Difficulty</div>
        <div style={{ display: "flex", gap: 8 }}>
          {DIFFICULTIES.map(function (d) {
            return <Chip key={d.key} active={difficulty === d.key} accent={d.color} onClick={function () { setDifficulty(d.key); }}>{d.label}</Chip>;
          })}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="duel-label">Questions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {QUESTION_COUNTS.map(function (n) {
            return <Chip key={n} active={count === n} onClick={function () { setCount(n); }}>{n}</Chip>;
          })}
        </div>
        {availableItems.length > 0 && availableItems.length < count && (
          <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 6 }}>Only {availableItems.length} questions available — the duel will use all of them.</div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="duel-label">Time Limit</div>
        <div style={{ display: "flex", gap: 8 }}>
          {TIME_LIMITS.map(function (m) {
            return <Chip key={m} active={minutes === m} onClick={function () { setMinutes(m); }}>{m} min</Chip>;
          })}
        </div>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div className="duel-label">Start Time</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <Chip active={startChoice === "now"} onClick={function () { setStartChoice("now"); }}>Start Now</Chip>
          <Chip active={startChoice === "5"} onClick={function () { setStartChoice("5"); }}>In 5 min</Chip>
          <Chip active={startChoice === "15"} onClick={function () { setStartChoice("15"); }}>In 15 min</Chip>
          <Chip active={startChoice === "30"} onClick={function () { setStartChoice("30"); }}>In 30 min</Chip>
          <Chip active={startChoice === "custom"} onClick={function () { setStartChoice("custom"); }}>Custom</Chip>
        </div>
        {startChoice === "custom" && (
          <input type="time" value={customTime} onChange={function (e) { setCustomTime(e.target.value); }} style={{ padding: "11px 14px", borderRadius: 10, border: "1px solid " + C.line, fontSize: 14 }} />
        )}
      </div>

      <DuelButton onClick={handleGenerate} full disabled={!course || (startChoice === "custom" && !customTime)}>Generate Invite →</DuelButton>
    </div>
  );
}

// ============================================================ INVITE
function InviteScreen({ cfg, onBack, onEnterWaiting }) {
  var link = useMemo(function () { return inviteLinkFor(cfg); }, [cfg]);
  var [variant] = useState(function () { return Math.random() < 0.5 ? "A" : "B"; });
  var [copied, setCopied] = useState(false);

  function shareWhatsApp() {
    var text = waTemplate(cfg, link, variant);
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  }
  function copyLink() {
    try { navigator.clipboard.writeText(link); setCopied(true); setTimeout(function () { setCopied(false); }, 1800); } catch (e) {}
  }

  return (
    <div>
      <BackRow onBack={onBack} label="Edit duel" />
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.brass, fontWeight: 700, marginBottom: 6 }}>Your duel is ready</div>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: C.forest, margin: 0 }}>{cfg.courseCode} · {cfg.topicLabel}</h2>
      </div>

      <div className="duel-invite-card">
        <div style={{ fontSize: 11.5, color: C.brassDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Invite Code</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 32, fontWeight: 700, color: C.chalk, letterSpacing: "0.16em", marginBottom: 18 }}>{cfg.code}</div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 10, display: "inline-block" }}>
          <img src={qrUrlFor(link)} alt="Duel QR code" width={180} height={180} style={{ display: "block", borderRadius: 8 }} />
        </div>
        <div style={{ fontSize: 11.5, color: "rgba(243,239,227,0.7)", marginTop: 14 }}>{cfg.difficultyLabel} · {cfg.questionCount} questions · {cfg.timeLimitMin} min</div>
      </div>

      <div className="stack-v" style={{ "--g": "10px", marginTop: 18 }}>
        <DuelButton onClick={shareWhatsApp} full>📤 Share on WhatsApp</DuelButton>
        <DuelButton onClick={copyLink} variant="ghost" full style={{ color: C.forest, border: "1.5px solid " + C.line, background: "#fff" }}>
          {copied ? "Copied!" : "Copy Invite Link"}
        </DuelButton>
        <DuelButton onClick={onEnterWaiting} variant="dark" full>Enter Waiting Room →</DuelButton>
      </div>
    </div>
  );
}

// ============================================================ WAITING ROOM
function WaitingRoom({ cfg, isHost, onStart }) {
  var [now, setNow] = useState(function () { return Date.now(); });
  var [tipIdx, setTipIdx] = useState(0);
  var [joined, setJoined] = useState([{ name: "You", you: true }]);
  var scheduledBots = useRef(null);

  useEffect(function () {
    var iv = setInterval(function () { setNow(Date.now()); }, 1000);
    var tipIv = setInterval(function () { setTipIdx(function (i) { return (i + 1) % STUDY_TIPS.length; }); }, 4500);
    return function () { clearInterval(iv); clearInterval(tipIv); };
  }, []);

  useEffect(function () {
    if (scheduledBots.current) return;
    var waitMs = Math.max(cfg.startAt - cfg.createdAt, 1000);
    var rand = mulberry32(seedFromString(cfg.code));
    var botCount = 2 + Math.floor(rand() * 3); // 2-4 simulated joiners
    var timers = [];
    for (var i = 0; i < botCount; i++) {
      var delay = Math.min(waitMs * (0.15 + rand() * 0.7), waitMs - 300);
      var name = PRACTICE_NAMES[Math.floor(rand() * PRACTICE_NAMES.length)];
      timers.push(setTimeout(function (n) {
        return function () {
          setJoined(function (prev) { return prev.concat([{ name: n, you: false }]); });
        };
      }(name), Math.max(300, delay)));
    }
    scheduledBots.current = timers;
    return function () { timers.forEach(clearTimeout); };
  }, [cfg]);

  var remainingMs = cfg.startAt - now;
  useEffect(function () {
    if (remainingMs <= 0) onStart();
  }, [remainingMs]);

  var totalWaitMs = Math.max(cfg.startAt - cfg.createdAt, 1);
  var fraction = Math.max(0, Math.min(1, remainingMs / totalWaitMs));
  var ringDeg = fraction * 360;

  return (
    <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "linear-gradient(160deg, " + C.forestDeep + " 0%, " + C.forest + " 55%, #234a34 100%)", padding: "30px 22px 26px" }}>
      <GlowBackdrop />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div className="duel-icon-pulse" style={{ fontSize: 30, marginBottom: 6 }}>⚔️</div>
          <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, color: C.chalk }}>{cfg.courseCode} · {cfg.topicLabel}</div>
          <div style={{ fontSize: 11.5, color: C.brassDim, marginTop: 3 }}>{cfg.difficultyLabel} · {cfg.questionCount} questions · {cfg.timeLimitMin} min</div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div style={{ width: 150, height: 150, borderRadius: "50%", background: "conic-gradient(" + C.gold + " " + ringDeg + "deg, rgba(255,255,255,0.12) 0deg)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 1s linear" }}>
            <div style={{ width: 122, height: 122, borderRadius: "50%", background: C.forestDeep, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, fontWeight: 700, color: C.chalk }}>{fmtClock(remainingMs / 1000)}</div>
              <div style={{ fontSize: 9.5, color: C.brassDim, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>until start</div>
            </div>
          </div>
        </div>

        <p className="duel-breathe" style={{ textAlign: "center", fontSize: 13, color: "rgba(243,239,227,0.85)", marginBottom: 16 }}>Waiting for challengers…</p>

        <div style={{ display: "flex", justifyContent: "center", gap: -8, marginBottom: 8, flexWrap: "wrap" }}>
          {joined.map(function (p, i) {
            return (
              <div key={p.name + i} className="duel-fadein" style={{ display: "flex", alignItems: "center", gap: 6, background: p.you ? "rgba(245,185,66,0.18)" : "rgba(255,255,255,0.08)", border: "1px solid " + (p.you ? "rgba(245,185,66,0.4)" : "rgba(255,255,255,0.15)"), borderRadius: 20, padding: "6px 12px 6px 6px", margin: 4 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: p.you ? C.gold : C.teal, color: p.you ? C.forestDeep : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700 }}>{p.name[0]}</div>
                <span style={{ fontSize: 12, color: C.chalk, fontWeight: 600 }}>{p.name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", fontSize: 10.5, color: "rgba(243,239,227,0.55)", marginBottom: 20 }}>
          {joined.length} joined · practice mode — real-time sync launches with live duels
        </div>

        <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", textAlign: "center", marginBottom: 16 }}>
          <span key={tipIdx} className="duel-fadein" style={{ fontSize: 12.5, color: C.brassDim }}>💡 {STUDY_TIPS[tipIdx]}</span>
        </div>

        {isHost && remainingMs > 5000 && (
          <DuelButton onClick={onStart} variant="ghost" full>Skip wait — start now</DuelButton>
        )}
      </div>
    </div>
  );
}

// ============================================================ COUNTDOWN
function CountdownOverlay({ onDone }) {
  var [n, setN] = useState(3);
  useEffect(function () {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.frequency.value = n === 0 ? 880 : 520;
      gain.gain.value = 0.05;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
    if (n <= -1) { onDone(); return; }
    var t = setTimeout(function () { setN(n - 1); }, 800);
    return function () { clearTimeout(t); };
  }, [n]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "radial-gradient(circle at 50% 40%, #234a34 0%, " + C.forestDeep + " 70%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div key={n} className="duel-count-pop" style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: n === 0 ? 90 : 120, color: n === 0 ? C.gold : C.chalk }}>
        {n > 0 ? n : "GO!"}
      </div>
    </div>
  );
}

// ============================================================ QUIZ
function DuelQuiz({ items, timeLimitMin, onFinish }) {
  var [idx, setIdx] = useState(0);
  var [answer, setAnswer] = useState("");
  var [results, setResults] = useState([]);
  var [remaining, setRemaining] = useState(timeLimitMin * 60);
  var startedAt = useRef(Date.now());
  var resultsRef = useRef([]);
  var finishedRef = useRef(false);

  useEffect(function () { resultsRef.current = results; }, [results]);

  useEffect(function () {
    var iv = setInterval(function () {
      setRemaining(function (r) { return r > 0 ? r - 1 : 0; });
    }, 1000);
    return function () { clearInterval(iv); };
  }, []);

  useEffect(function () {
    if (remaining <= 0) finish(resultsRef.current);
    // eslint-disable-next-line
  }, [remaining]);

  function finish(finalResults) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    var elapsedSec = Math.round((Date.now() - startedAt.current) / 1000);
    onFinish(finalResults, elapsedSec);
  }

  var item = items[idx];
  function submit(chosen) {
    var given = (chosen !== undefined ? chosen : answer).trim().toLowerCase();
    var correct = given === item.answer.trim().toLowerCase();
    var nextResults = results.concat([{ q: item.q, answer: item.answer, given: chosen !== undefined ? chosen : answer, correct: correct }]);
    setResults(nextResults);
    setAnswer("");
    if (idx + 1 < items.length) setIdx(idx + 1);
    else finish(nextResults);
  }

  if (!item) return null;
  var urgent = remaining <= 30;

  return (
    <div>
      <div className="stack-h" style={{ "--g": "10px", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>Question {idx + 1} of {items.length}</div>
        <div style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: urgent ? C.ox : C.forest, background: urgent ? C.oxSoft : C.greenTint, padding: "4px 10px", borderRadius: 8 }}>
          {fmtClock(remaining)}
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: C.line, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: (idx / items.length) * 100 + "%", background: C.gold, transition: "width 0.3s" }} />
      </div>
      <div key={idx} className="duel-fadein" style={{ background: "#fff", border: "1px solid " + C.line, borderRadius: 16, padding: "24px 20px" }}>
        <p style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: C.ink, margin: "0 0 20px", lineHeight: 1.5 }}>{item.q}</p>
        {item.type === "mc" ? (
          <div className="stack-v" style={{ "--g": "10px" }}>
            {item.options.map(function (opt) {
              return (
                <button key={opt} onClick={function () { submit(opt); }} style={{ textAlign: "left", padding: "14px 16px", borderRadius: 12, border: "1.5px solid " + C.line, background: C.page, cursor: "pointer", fontSize: 14.5, color: C.ink, fontWeight: 500 }}>
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="stack-h" style={{ "--g": "10px" }}>
            <input value={answer} onChange={function (e) { setAnswer(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter" && answer.trim()) submit(); }} placeholder="Your answer" style={{ flex: 1, padding: "13px 14px", borderRadius: 10, border: "1.5px solid " + C.line, fontSize: 14.5 }} />
            <DuelButton onClick={function () { if (answer.trim()) submit(); }}>Submit</DuelButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================ RESULTS (animated reveal)
function ResultsReveal({ results, elapsedSec, onContinue }) {
  var correct = results.filter(function (r) { return r.correct; }).length;
  var finalPct = Math.round((correct / results.length) * 100);
  var [shown, setShown] = useState(0);

  useEffect(function () {
    var start = null;
    var duration = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      setShown(Math.round(finalPct * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    var raf = requestAnimationFrame(step);
    return function () { cancelAnimationFrame(raf); };
  }, [finalPct]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: C.brass, fontWeight: 700, marginBottom: 10 }}>Duel Complete</div>
      <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 62, color: C.forest, lineHeight: 1 }}>{shown}%</div>
      <p style={{ color: C.inkSoft, fontSize: 14, margin: "10px 0 22px" }}>{perfMessage(finalPct)}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 26 }}>
        <div style={{ background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: "14px 8px" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, color: C.teal }}>{correct}</div>
          <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>Correct</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: "14px 8px" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, color: C.ox }}>{results.length - correct}</div>
          <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>Missed</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: "14px 8px" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, color: C.forest }}>{fmtClock(elapsedSec)}</div>
          <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>Time</div>
        </div>
      </div>
      <DuelButton onClick={onContinue} full>See Duel Results →</DuelButton>
    </div>
  );
}

// ============================================================ COMPARISON
function DuelComparison({ cfg, results, onShare, onExit }) {
  var correct = results.filter(function (r) { return r.correct; }).length;
  var myPct = Math.round((correct / results.length) * 100);

  var board = useMemo(function () {
    var rand = mulberry32(seedFromString(cfg.code + "-board"));
    var botCount = 2 + Math.floor(rand() * 3);
    var rows = [{ name: "You", pct: myPct, you: true }];
    for (var i = 0; i < botCount; i++) {
      var spread = Math.round((rand() - 0.5) * 30);
      var pct = Math.max(35, Math.min(99, myPct + spread));
      rows.push({ name: PRACTICE_NAMES[Math.floor(rand() * PRACTICE_NAMES.length)] + "_" + i, displayName: null, pct: pct, you: false });
    }
    // de-dupe display names simply
    var used = {};
    rows.forEach(function (r) {
      if (r.you) return;
      var base = r.name.split("_")[0];
      var n = base; var k = 1;
      while (used[n]) { n = base + " " + (++k); }
      used[n] = true;
      r.displayName = n;
    });
    rows.sort(function (a, b) { return b.pct - a.pct; });
    return rows;
  }, [cfg, myPct]);

  var medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: C.forest, margin: 0 }}>Duel Results</h2>
        <p style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 6 }}>Your score is real · other participants are simulated in this preview</p>
      </div>
      <div className="stack-v" style={{ "--g": "8px", marginBottom: 24 }}>
        {board.map(function (r, i) {
          return (
            <div key={i} className="duel-fadein" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 14, border: "1.5px solid " + (r.you ? C.gold : C.line), background: r.you ? C.goldSoft : "#fff" }}>
              <div style={{ width: 26, textAlign: "center", fontSize: 16 }}>{i < 3 ? medals[i] : i + 1}</div>
              <div style={{ flex: 1, fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 14.5, color: C.ink }}>{r.you ? "You" : r.displayName}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 14, color: r.you ? "#8a6412" : C.inkSoft }}>{r.pct}%</div>
            </div>
          );
        })}
      </div>
      <div className="stack-v" style={{ "--g": "10px" }}>
        <DuelButton onClick={onShare} full>📤 Create Share Card</DuelButton>
        <DuelButton onClick={onExit} variant="ghost" full style={{ color: C.forest, border: "1.5px solid " + C.line, background: "#fff" }}>Done</DuelButton>
      </div>
    </div>
  );
}

// ============================================================ SHARE CARD
function ShareCard({ cfg, results, onBack }) {
  var correct = results.filter(function (r) { return r.correct; }).length;
  var pct = Math.round((correct / results.length) * 100);
  function shareWhatsApp() {
    var text = "🏆 I scored " + pct + "% on my Uni-Nergy Quiz Duel — " + cfg.courseName + " (" + cfg.topicLabel + "). Think you can beat me? ⚔️";
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  }
  return (
    <div>
      <BackRow onBack={onBack} label="Results" />
      <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "linear-gradient(160deg, " + C.forestDeep + " 0%, " + C.forest + " 60%, #234a34 100%)", padding: "34px 24px", textAlign: "center", maxWidth: 340, margin: "0 auto" }}>
        <GlowBackdrop />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: C.brassDim, marginBottom: 18 }}>Uni-Nergy · Quiz Duel</div>
          <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 56, color: C.gold, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 13, color: C.chalk, fontWeight: 600, marginTop: 10 }}>You</div>
          <div style={{ fontSize: 12, color: "rgba(243,239,227,0.75)", marginTop: 4 }}>{cfg.courseName} · {cfg.topicLabel}</div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "20px 0" }} />
          <div style={{ fontSize: 10.5, color: "rgba(243,239,227,0.6)" }}>Learn better. Grow together.</div>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: C.inkSoft, textAlign: "center", margin: "12px 0 18px" }}>Screenshot this card, or share the score directly.</p>
      <DuelButton onClick={shareWhatsApp} full>📤 Share on WhatsApp</DuelButton>
    </div>
  );
}

// ============================================================ ROOT
export default function QuizDuel({ courses, onExit }) {
  var incoming = useMemo(function () { return readDuelFromLocation(); }, []);
  var [stage, setStage] = useState(incoming ? "joinPreview" : "landing");
  var [cfg, setCfg] = useState(incoming || null);
  var [isHost, setIsHost] = useState(!incoming);
  var [duelResults, setDuelResults] = useState(null);
  var [elapsedSec, setElapsedSec] = useState(0);

  var quizItems = useMemo(function () {
    if (!cfg) return [];
    var course = courses.filter(function (c) { return c.id === cfg.courseId; })[0];
    if (!course) return [];
    var pool = cfg.topicId === "general" ? allQuizItemsOf(course.topics) : (course.topics.filter(function (t) { return t.id === cfg.topicId; })[0] || { quiz: [] }).quiz;
    return seededShuffle(pool, cfg.code).slice(0, cfg.questionCount);
    // eslint-disable-next-line
  }, [cfg]);

  function handleGenerated(newCfg) {
    setCfg(newCfg);
    setIsHost(true);
    setStage("invite");
  }
  function handleJoinResolved(joinedCfg) {
    setCfg(joinedCfg);
    setIsHost(false);
    goToWaitingOrCountdown(joinedCfg);
  }
  function goToWaitingOrCountdown(finalCfg) {
    if (finalCfg.startAt <= Date.now() + 500) setStage("countdown");
    else setStage("waiting");
  }

  return (
    <div>
      <style>{`
        .duel-glow { position: absolute; border-radius: 50%; filter: blur(50px); opacity: 0.5; }
        .duel-glow-a { width: 220px; height: 220px; background: ${C.gold}; top: -60px; left: -40px; animation: duelDrift 9s ease-in-out infinite alternate; }
        .duel-glow-b { width: 260px; height: 260px; background: ${C.teal}; bottom: -80px; right: -60px; animation: duelDrift 11s ease-in-out infinite alternate-reverse; }
        @keyframes duelDrift { from { transform: translate(0,0) scale(1); } to { transform: translate(18px,-14px) scale(1.12); } }
        .duel-particles { position: absolute; inset: 0; }
        .duel-particle { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: rgba(245,185,66,0.55); animation: duelFloat 7s ease-in-out infinite; }
        .duel-particle.p0 { top: 20%; left: 12%; animation-delay: 0s; }
        .duel-particle.p1 { top: 65%; left: 22%; animation-delay: 0.6s; }
        .duel-particle.p2 { top: 35%; left: 78%; animation-delay: 1.2s; }
        .duel-particle.p3 { top: 80%; left: 60%; animation-delay: 1.8s; }
        .duel-particle.p4 { top: 10%; left: 55%; animation-delay: 2.4s; }
        .duel-particle.p5 { top: 50%; left: 88%; animation-delay: 3s; }
        .duel-particle.p6 { top: 70%; left: 8%; animation-delay: 3.6s; }
        @keyframes duelFloat { 0%, 100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-16px); opacity: 0.9; } }
        .duel-icon-pulse { animation: duelPulse 2.4s ease-in-out infinite; display: inline-block; }
        @keyframes duelPulse { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(245,185,66,0)); } 50% { transform: scale(1.08); filter: drop-shadow(0 0 14px rgba(245,185,66,0.5)); } }
        .duel-breathe { animation: duelBreathe 3.2s ease-in-out infinite; }
        @keyframes duelBreathe { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        .duel-fadein { animation: duelFadeIn 0.35s ease both; }
        @keyframes duelFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .duel-count-pop { animation: duelPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes duelPop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .duel-invite-card { position: relative; overflow: hidden; text-align: center; border-radius: 20px; padding: 26px 20px 22px; background: linear-gradient(160deg, ${C.forestDeep} 0%, ${C.forest} 55%, #234a34 100%); }
        .duel-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.inkSoft}; margin-bottom: 10px; }
        .duel-btn:hover:not(:disabled) { filter: brightness(1.04); }
      `}</style>

      {stage === "landing" && (
        <Landing onCreate={function () { setStage("create"); }} onJoin={function () { setStage("join"); }} onExit={onExit} />
      )}

      {stage === "join" && (
        <JoinPanel onBack={function () { setStage("landing"); }} onResolved={handleJoinResolved} />
      )}

      {stage === "joinPreview" && cfg && (
        <div>
          <BackRow onBack={onExit} label="Home" />
          <div className="duel-invite-card" style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>⚔️</div>
            <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 19, color: C.chalk }}>You've been challenged!</div>
            <div style={{ fontSize: 12.5, color: C.brassDim, marginTop: 6 }}>{cfg.courseName} · {cfg.topicLabel}</div>
            <div style={{ fontSize: 11.5, color: "rgba(243,239,227,0.75)", marginTop: 4 }}>{cfg.difficultyLabel} · {cfg.questionCount} questions · {cfg.timeLimitMin} min</div>
          </div>
          <DuelButton onClick={function () { goToWaitingOrCountdown(cfg); }} full>Join Duel →</DuelButton>
        </div>
      )}

      {stage === "waiting" && cfg && (
        <WaitingRoom cfg={cfg} isHost={isHost} onStart={function () { setStage("countdown"); }} />
      )}

      {stage === "create" && (
        <CreateDuel courses={courses} onBack={function () { setStage("landing"); }} onGenerated={handleGenerated} />
      )}

      {stage === "invite" && cfg && (
        <InviteScreen cfg={cfg} onBack={function () { setStage("create"); }} onEnterWaiting={function () { goToWaitingOrCountdown(cfg); }} />
      )}

      {stage === "countdown" && (
        <CountdownOverlay onDone={function () { setStage("quiz"); }} />
      )}

      {stage === "quiz" && cfg && (
        quizItems.length > 0 ? (
          <DuelQuiz items={quizItems} timeLimitMin={cfg.timeLimitMin} onFinish={function (r, sec) { setDuelResults(r); setElapsedSec(sec); setStage("reveal"); }} />
        ) : (
          <div style={{ textAlign: "center", padding: "30px 10px", color: C.inkSoft, fontSize: 13.5 }}>
            This duel's topic doesn't have questions ready yet. Try a different topic.
          </div>
        )
      )}

      {stage === "reveal" && duelResults && (
        <ResultsReveal results={duelResults} elapsedSec={elapsedSec} cfg={cfg} onContinue={function () { setStage("compare"); }} />
      )}

      {stage === "compare" && duelResults && (
        <DuelComparison cfg={cfg} results={duelResults} elapsedSec={elapsedSec} onShare={function () { setStage("share"); }} onExit={onExit} />
      )}

      {stage === "share" && duelResults && (
        <ShareCard cfg={cfg} results={duelResults} onBack={function () { setStage("compare"); }} />
      )}
    </div>
  );
}
