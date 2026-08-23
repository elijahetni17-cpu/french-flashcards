import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import topics from "../data/topics.json";
import quizBank from "../data/quiz-bank.json";
import { recordQuizDuelRun, getQuizDuelStats } from "../lib/storage.js";

const SESSION_SIZE = 15;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Compact id encoding for short links: "q007" -> "7", joined with "-"
function idsToParam(ids) {
  return ids.map((id) => parseInt(id.replace("q", ""), 10)).join("-");
}
function paramToIds(param) {
  return param
    .split("-")
    .map((n) => `q${String(parseInt(n, 10)).padStart(3, "0")}`);
}

function buildSession(topicId, explicitIds) {
  let picked;
  if (explicitIds && explicitIds.length > 0) {
    picked = explicitIds.map((id) => quizBank.find((q) => q.id === id)).filter(Boolean);
  } else {
    const pool = topicId ? quizBank.filter((q) => q.topicId === topicId) : quizBank;
    picked = shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));
  }
  return picked.map((q) => {
    const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, wasCorrect: i === q.correctIndex }));
    const shuffledOptions = shuffle(optionsWithIndex);
    return { ...q, shuffledOptions };
  });
}

export default function QuizDuel() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topic = topics.find((t) => t.id === topicId);

  const challengeIdsParam = searchParams.get("c");
  const challengeScoreParam = searchParams.get("sc");
  const challengeTimeParam = searchParams.get("tm");
  const challengeNameParam = searchParams.get("nm");

  const challengeIds = useMemo(
    () => (challengeIdsParam ? paramToIds(challengeIdsParam) : null),
    [challengeIdsParam]
  );
  const isChallenge = !!(challengeIds && challengeIds.length > 0);
  const challengeScore = challengeScoreParam !== null ? parseInt(challengeScoreParam, 10) : null;
  const challengeTime = challengeTimeParam !== null ? parseInt(challengeTimeParam, 10) : null;
  const challengeName = challengeNameParam || "a friend";

  const [phase, setPhase] = useState("intro"); // intro | playing | done
  const [session, setSession] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [priorStats, setPriorStats] = useState(null);
  const [reviewLog, setReviewLog] = useState([]);
  const [friendName, setFriendName] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setPriorStats(getQuizDuelStats());
    setPhase("intro");
    setSession([]);
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
  }, [topicId, challengeIdsParam]);

  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 250);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, startTime]);

  function startSession() {
    const s = buildSession(topicId, challengeIds);
    if (s.length === 0) return;
    setSession(s);
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setStartTime(Date.now());
    setElapsed(0);
    setReviewLog([]);
    setLinkCopied(false);
    setPhase("playing");
  }

  function pickOption(opt) {
    if (selected) return;
    setSelected(opt);
    if (opt.wasCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
    setReviewLog((log) => [
      ...log,
      {
        prompt: currentQ.prompt,
        chosenText: opt.text,
        correct: opt.wasCorrect,
        correctText: currentQ.shuffledOptions.find((o) => o.wasCorrect)?.text,
        explanation: currentQ.explanation
      }
    ]);
  }

  function nextQuestion() {
    if (qIndex + 1 < session.length) {
      setQIndex((i) => i + 1);
      setSelected(null);
    } else {
      finishSession();
    }
  }

  function finishSession() {
    const timeSec = Math.floor((Date.now() - startTime) / 1000);
    recordQuizDuelRun({
      topicId: topicId || "all",
      score,
      total: session.length,
      timeSec,
      streak: bestStreak
    });
    setPhase("done");
  }

  function buildChallengeLink() {
    const ids = idsToParam(session.map((q) => q.id));
    const base = topicId ? `/duel/${topicId}` : "/duel";
    const params = new URLSearchParams();
    params.set("c", ids);
    params.set("sc", String(score));
    params.set("tm", String(elapsed));
    if (friendName.trim()) params.set("nm", friendName.trim().slice(0, 16));
    return `${window.location.origin}${window.location.pathname}#${base}?${params.toString()}`;
  }

  async function copyChallengeLink() {
    const link = buildChallengeLink();
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt("Copy this link and send it to your friend:", link);
    }
  }

  const currentQ = session[qIndex];

  if (phase === "intro") {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-2">⚔️</div>
          <h1 className="font-display text-2xl font-bold">
            Quiz Duel {topic ? `— ${topic.title}` : "— All Topics"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {isChallenge
              ? `${challengeName} sent you a challenge. Same questions, same rules — see who wins.`
              : "You vs. your own best score. No opponent needed — just beat what you did last time."}
          </p>
        </div>

        {isChallenge ? (
          <div className="glass rounded-2xl p-5 space-y-3 text-sm border border-amber-300/20">
            <Row label="Questions" value={challengeIds.length} />
            <Row label={`${challengeName}'s score`} value={`${challengeScore ?? "—"}/${challengeIds.length}`} />
            {challengeTime !== null && <Row label={`${challengeName}'s time`} value={`${challengeTime}s`} />}
          </div>
        ) : (
          <div className="glass rounded-2xl p-5 space-y-3 text-sm">
            <Row label="Questions in this run" value={Math.min(SESSION_SIZE, (topicId ? quizBank.filter(q=>q.topicId===topicId) : quizBank).length)} />
            {priorStats && priorStats.history.length > 0 ? (
              <>
                <Row label="Your best score" value={priorStats.bestScore} />
                <Row label="Your best accuracy" value={`${priorStats.bestAccuracy}%`} />
                <Row label="Your best streak" value={priorStats.bestStreak} />
                <Row label="Fastest 100% run" value={priorStats.fastestCleanRun ? `${priorStats.fastestCleanRun}s` : "—"} />
              </>
            ) : (
              <p className="text-white/40 text-xs">No runs yet — set your first personal best.</p>
            )}
          </div>
        )}

        <button
          onClick={startSession}
          className="w-full py-3 rounded-full bg-amber-400 text-black font-bold hover:bg-amber-300 transition"
        >
          {isChallenge ? "Accept Challenge" : "Start Duel"}
        </button>

        {!isChallenge && (
          <div className="text-center">
            <select
              value={topicId || ""}
              onChange={(e) => navigate(e.target.value ? `/duel/${e.target.value}` : "/duel")}
              className="glass rounded-full px-3 py-1.5 text-xs bg-transparent outline-none"
            >
              <option value="" className="bg-neutral-900">All topics (mixed)</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id} className="bg-neutral-900">
                  {t.icon} {t.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  if (phase === "playing" && currentQ) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center justify-between text-xs font-mono text-white/50">
          <span>Q{qIndex + 1}/{session.length}</span>
          <span>🔥 Streak {streak}</span>
          <span>⏱ {elapsed}s</span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-violet-400 transition-all"
            style={{ width: `${((qIndex) / session.length) * 100}%` }}
          />
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="font-display text-lg sm:text-xl font-semibold leading-snug mb-5">
            {currentQ.prompt}
          </p>
          <div className="space-y-2">
            {currentQ.shuffledOptions.map((opt, i) => {
              const isSelected = selected === opt;
              const showState = selected !== null;
              let style = "bg-white/5 border-white/10 hover:bg-white/10";
              if (showState && opt.wasCorrect) style = "bg-emerald-500/20 border-emerald-400/40 text-emerald-100";
              else if (showState && isSelected && !opt.wasCorrect) style = "bg-rose-500/20 border-rose-400/40 text-rose-100";
              return (
                <button
                  key={i}
                  onClick={() => pickOption(opt)}
                  disabled={selected !== null}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${style}`}
                >
                  <span className="font-mono text-white/40 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
              <p className={selected.wasCorrect ? "text-emerald-300 font-semibold" : "text-rose-300 font-semibold"}>
                {selected.wasCorrect ? "✓ Correct" : "✗ Not quite"}
              </p>
              <p className="text-white/60 mt-1">{currentQ.explanation}</p>
              <button
                onClick={nextQuestion}
                className="mt-3 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold transition"
              >
                {qIndex + 1 < session.length ? "Next question →" : "See results →"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const total = session.length;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const timeSec = elapsed;
    const isNewBestScore = priorStats && score > priorStats.bestScore;
    const isNewBestStreak = priorStats && bestStreak > priorStats.bestStreak;

    let challengeResult = null;
    if (isChallenge && challengeScore !== null) {
      if (score > challengeScore) challengeResult = "win";
      else if (score < challengeScore) challengeResult = "lose";
      else if (challengeTime !== null && timeSec < challengeTime) challengeResult = "win";
      else if (challengeTime !== null && timeSec > challengeTime) challengeResult = "lose";
      else challengeResult = "tie";
    }

    return (
      <div className="max-w-lg mx-auto space-y-5 text-center">
        <div className="text-4xl">{accuracy === 100 ? "🏆" : accuracy >= 70 ? "💪" : "📚"}</div>
        <h1 className="font-display text-2xl font-bold">Run complete</h1>

        {challengeResult && (
          <div
            className={`p-3 rounded-xl border text-sm font-semibold ${
              challengeResult === "win"
                ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200"
                : challengeResult === "lose"
                ? "bg-rose-500/15 border-rose-400/30 text-rose-200"
                : "bg-white/10 border-white/20 text-white"
            }`}
          >
            {challengeResult === "win" && `🏆 You beat ${challengeName}! (${score}/${total} vs ${challengeScore}/${total})`}
            {challengeResult === "lose" && `😅 ${challengeName} wins this round (${challengeScore}/${total} vs your ${score}/${total}) — run it back!`}
            {challengeResult === "tie" && `🤝 It's a tie with ${challengeName} — ${score}/${total} each!`}
          </div>
        )}

        <div className="glass rounded-2xl p-6 grid grid-cols-2 gap-4">
          <Stat label="Score" value={`${score}/${total}`} highlight={isNewBestScore} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Best streak" value={bestStreak} highlight={isNewBestStreak} />
          <Stat label="Time" value={`${timeSec}s`} />
        </div>

        {(isNewBestScore || isNewBestStreak) && (
          <div className="p-3 rounded-xl bg-amber-400/15 border border-amber-300/30 text-amber-200 text-sm font-semibold">
            🎉 New personal best!
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={startSession}
            className="flex-1 py-3 rounded-full bg-amber-400 text-black font-bold hover:bg-amber-300 transition"
          >
            Run it back
          </button>
          <Link
            to="/topics"
            className="flex-1 py-3 rounded-full bg-white/10 font-semibold hover:bg-white/15 transition flex items-center justify-center"
          >
            Topics
          </Link>
        </div>

        <div className="glass rounded-2xl p-5 text-left space-y-3">
          <h2 className="font-display font-semibold text-sm text-center">
            🔗 Challenge a friend to this exact run
          </h2>
          <input
            type="text"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            placeholder="Your name (optional, shown to your friend)"
            maxLength={16}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-amber-300/40"
          />
          <button
            onClick={copyChallengeLink}
            className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-sm font-semibold transition"
          >
            {linkCopied ? "✓ Link copied!" : "Copy challenge link"}
          </button>
          <p className="text-[11px] text-white/40 text-center">
            Sends the same {total} questions plus your score ({score}/{total} in {timeSec}s) so they can try to beat you.
          </p>
        </div>

        <div className="text-left space-y-2 pt-2">
          <h2 className="font-display font-semibold text-sm text-white/70 text-center">
            Answer review — every question this run
          </h2>
          {reviewLog.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl p-4 border text-sm ${
                r.correct
                  ? "bg-emerald-500/10 border-emerald-400/25"
                  : "bg-rose-500/10 border-rose-400/25"
              }`}
            >
              <p className="font-medium leading-snug">
                <span className="font-mono text-white/40 mr-1">{i + 1}.</span>
                {r.prompt}
              </p>
              <div className="mt-2 text-xs space-y-1">
                <p className={r.correct ? "text-emerald-300" : "text-rose-300"}>
                  {r.correct ? "✓ You answered: " : "✗ You answered: "}
                  <span className="font-semibold">{r.chosenText}</span>
                </p>
                {!r.correct && (
                  <p className="text-emerald-300">
                    Correct answer: <span className="font-semibold">{r.correctText}</span>
                  </p>
                )}
                <p className="text-white/50">{r.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className={`font-display text-2xl font-bold ${highlight ? "text-amber-300" : "text-white"}`}>
        {value}
      </div>
      <div className="text-[11px] text-white/50 mt-1">{label}</div>
    </div>
  );
}
