// Content shape mirrors courseData.js EXACTLY on purpose: this file is the
// proof-of-concept that Uni-Nergy Education's content schema (slides / cards /
// quiz) is course-agnostic, not French-specific. If this loads and plays
// correctly through the same Lecture / Retention / Quiz components with zero
// component changes, the architecture scales to any UMaT course.
//
// Sample topic only (Limits & Continuity, Engineering Mathematics I) —
// enough to stress-test the schema against non-language content: symbolic
// notation, numeric answers, multi-step reasoning. Real full-course content
// gets authored once this shape is confirmed to work.

let uid = 1;
const cid = () => `m${uid++}`;

function concept(title, slides, cards) {
  return { id: cid(), title, slides, cards };
}
function teach(text) {
  return { id: cid(), kind: "teach", text };
}
function example(french, english, note) {
  // Field names kept as french/english for schema parity with courseData.js —
  // here "french" holds the worked expression, "english" holds the plain-
  // language explanation. Renaming these to something neutral (e.g.
  // prompt/explain) is a follow-up refactor once we're sure the shape is final.
  return { id: cid(), kind: "example", french, english, note };
}
function card(front, back) {
  return { id: cid(), front, back };
}

export const MATH_COURSE_TOPICS = [
  {
    id: "limits-continuity",
    code: "MATH 121",
    week: "Week 3",
    title: "Limits & Continuity",
    subtitle: "Evaluating limits, one-sided limits, and continuity conditions",
    subtopics: [
      {
        id: "evaluating-limits",
        title: "Evaluating Limits Directly",
        concepts: [
          concept(
            "Direct substitution",
            [
              teach("If f(x) is continuous at x = a, then the limit as x approaches a is just f(a). Try substitution first, always."),
              example("lim(x→2) (x² + 3x)", "Substitute x = 2: (2² + 3·2) = 4 + 6 = 10", "Works because the function is a polynomial — always continuous everywhere."),
              teach("If direct substitution gives 0/0, that is NOT the answer — it means you must factor, rationalize, or simplify first."),
              example("lim(x→3) (x² − 9)/(x − 3)", "Factor: (x−3)(x+3)/(x−3) = x+3 → limit = 6", "The 0/0 form is called an 'indeterminate form' — a signal to keep working, not a final answer."),
            ],
            [
              card("What do you try FIRST when evaluating any limit?", "Direct substitution."),
              card("What does a 0/0 result mean?", "Indeterminate form — simplify (factor/rationalize) and try again."),
              card("lim(x→3) (x²−9)/(x−3) = ?", "6"),
            ]
          ),
        ],
      },
      {
        id: "continuity-conditions",
        title: "Continuity at a Point",
        concepts: [
          concept(
            "The three conditions for continuity",
            [
              teach("A function f is continuous at x = a only if THREE things are all true: (1) f(a) exists, (2) the limit as x→a exists, (3) the limit equals f(a)."),
              example("f(x) = (x²−1)/(x−1), check continuity at x=1", "f(1) is undefined (division by zero) → fails condition 1 → NOT continuous at x=1, even though the limit exists and equals 2.", "This is the classic trap: a limit existing does not guarantee continuity."),
            ],
            [
              card("Name the three conditions for continuity at x = a.", "f(a) exists; the limit as x→a exists; the limit equals f(a)."),
              card("Can a limit exist at a point where the function is not continuous?", "Yes — if f(a) is undefined or doesn't match the limit value."),
            ]
          ),
        ],
      },
    ],
    quiz: [
      { type: "mc", q: "What is the first method to try when evaluating any limit?", options: ["Direct substitution", "L'Hôpital's rule", "Guessing"], answer: "Direct substitution" },
      { type: "mc", q: "A 0/0 result when substituting means:", options: ["The limit doesn't exist", "You must simplify further", "The answer is 0"], answer: "You must simplify further" },
      { type: "fill", q: "lim(x→2) (x² + 3x) = ___", answer: "10" },
      { type: "fill", q: "lim(x→3) (x²−9)/(x−3) = ___", answer: "6" },
      { type: "mc", q: "Which condition is NOT required for continuity at x=a?", options: ["f(a) exists", "f is differentiable at a", "the limit as x→a equals f(a)"], answer: "f is differentiable at a" },
      { type: "fill", q: "If f(x)=(x²−1)/(x−1) is undefined at x=1, is f continuous at x=1? (yes/no)", answer: "no" },
      { type: "mc", q: "A limit existing at a point guarantees continuity there.", options: ["True", "False"], answer: "False" },
      { type: "fill", q: "lim(x→0) (5) = ___ (limit of a constant)", answer: "5" },
      { type: "fill", q: "How many conditions must ALL hold for continuity at a point?", answer: "3" },
    ],
  },
];
