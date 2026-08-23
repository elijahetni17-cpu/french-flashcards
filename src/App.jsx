import { HashRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Topics from "./pages/Topics.jsx";
import Flashcards from "./pages/Flashcards.jsx";
import QuizDuel from "./pages/QuizDuel.jsx";
import EnglishWriting from "./pages/EnglishWriting.jsx";
import CheatSheet from "./pages/CheatSheet.jsx";

const navItems = [
  { to: "/", label: "Accueil", icon: "🏠", end: true },
  { to: "/topics", label: "Topics", icon: "📚" },
  { to: "/flashcards", label: "Flashcards", icon: "🃏" },
  { to: "/duel", label: "Quiz Duel", icon: "⚔️" },
  { to: "/writing", label: "Writing", icon: "✍️" },
  { to: "/cram", label: "Cram Sheet", icon: "⚡" }
];

export default function App() {
  return <HashRouter><div className="min-h-screen flex flex-col">
    <header className="sticky top-0 z-30 glass border-b border-white/10"><div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2"><span className="text-2xl">🇫🇷</span><div><div className="font-display font-semibold leading-tight text-sm sm:text-base">Basic French II</div><div className="text-[11px] sm:text-xs text-white/50 font-mono leading-tight">Exam Sprint · UMaT</div></div></div>
      <nav className="hidden sm:flex items-center gap-1">{navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({isActive}) => `px-3 py-1.5 rounded-full text-sm font-medium ${isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}>{item.label}</NavLink>)}</nav>
    </div></header>
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 relative z-10"><Routes>
      <Route path="/" element={<Home />} /><Route path="/topics" element={<Topics />} /><Route path="/flashcards" element={<Flashcards />} /><Route path="/flashcards/:topicId" element={<Flashcards />} />
      <Route path="/duel" element={<QuizDuel />} /><Route path="/duel/:topicId" element={<QuizDuel />} /><Route path="/writing" element={<EnglishWriting />} /><Route path="/cram" element={<CheatSheet />} />
    </Routes></main>
    <nav className="sm:hidden sticky bottom-0 z-30 glass border-t border-white/10"><div className="grid grid-cols-5">{navItems.slice(0,5).map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({isActive}) => `flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${isActive ? "text-white" : "text-white/50"}`}><span className="text-lg">{item.icon}</span>{item.label}</NavLink>)}</div></nav>
  </div></HashRouter>;
}
