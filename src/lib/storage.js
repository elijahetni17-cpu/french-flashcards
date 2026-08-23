const KEY = "bf2-exam-sprint-v1";

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return {
    flashcardProgress: {}, // cardId -> { known: bool, seenCount: number, lastSeen: ts }
    quizDuel: {
      bestScore: 0,
      bestAccuracy: 0,
      bestStreak: 0,
      fastestCleanRun: null, // seconds, only when 100% accuracy
      history: [] // {date, topicId, score, total, accuracy, timeSec}
    },
    topicMastery: {} // topicId -> { flashcardsKnown: number, flashcardsTotal: number }
  };
}

function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable, fail silently
  }
}

export function getState() {
  return loadState();
}

export function markFlashcard(cardId, known) {
  const state = loadState();
  const prev = state.flashcardProgress[cardId] || { seenCount: 0 };
  state.flashcardProgress[cardId] = {
    known,
    seenCount: prev.seenCount + 1,
    lastSeen: Date.now()
  };
  saveState(state);
  return state;
}

export function getFlashcardProgress(cardId) {
  const state = loadState();
  return state.flashcardProgress[cardId] || null;
}

export function recordQuizDuelRun({ topicId, score, total, timeSec, streak }) {
  const state = loadState();
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const run = { date: Date.now(), topicId, score, total, accuracy, timeSec, streak };

  state.quizDuel.history.unshift(run);
  state.quizDuel.history = state.quizDuel.history.slice(0, 25);

  if (score > state.quizDuel.bestScore) state.quizDuel.bestScore = score;
  if (accuracy > state.quizDuel.bestAccuracy) state.quizDuel.bestAccuracy = accuracy;
  if (streak > state.quizDuel.bestStreak) state.quizDuel.bestStreak = streak;
  if (accuracy === 100) {
    if (state.quizDuel.fastestCleanRun === null || timeSec < state.quizDuel.fastestCleanRun) {
      state.quizDuel.fastestCleanRun = timeSec;
    }
  }

  saveState(state);
  return state.quizDuel;
}

export function getQuizDuelStats() {
  return loadState().quizDuel;
}

export function resetAllProgress() {
  saveState(defaultState());
}
