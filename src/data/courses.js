// COURSE REGISTRY — the actual scaling mechanism.
// Adding a new course to Uni-Nergy Education means: (1) write a content file
// shaped like courseData.js / calculusCourseData.js, (2) add one entry below.
// Zero changes to App.jsx's Lecture/Retention/Quiz components are needed —
// that's what proves the architecture, not just the app, scales.

import { COURSE as FRENCH_TOPICS } from "./courseData";
import { CALCULUS_TOPICS } from "./calculusCourseData";

export const COURSES = [
  {
    id: "french",
    code: "CE 141",
    name: "Basic French",
    letter: "F",
    lang: "fr", // enables spoken-audio (SpeakerButton) — French is a spoken-language course
    topics: FRENCH_TOPICS,
  },
  {
    id: "calculus",
    code: "CAL 150",
    name: "Calculus",
    letter: "C",
    lang: null, // no spoken audio for symbolic/numeric content
    topics: CALCULUS_TOPICS,
  },
];
