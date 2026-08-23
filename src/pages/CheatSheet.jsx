import cheatSheet from "../data/cheat-sheet.json";
import heure from "../data/heure.json";
import conj from "../data/conjugations.json";

export default function CheatSheet() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">⚡ Cram Sheet</h1>
        <p className="text-white/50 text-sm">
          One pass through this before you walk in. Compressed, no fluff.
        </p>
      </div>

      <div className="grid gap-4">
        {cheatSheet.map((section) => (
          <div key={section.id} className="glass rounded-2xl p-5">
            <h2 className="font-display font-semibold text-amber-200 mb-3">
              {section.title}
            </h2>
            <ul className="space-y-2 text-sm text-white/75">
              {section.points.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-white/30 font-mono mt-0.5">▸</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-display font-semibold text-amber-200 mb-3">
          🕒 Time conversion — quick table
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
          {heure.worked24hExamples.map((e, i) => (
            <div key={i} className="flex justify-between bg-white/5 rounded-lg px-3 py-2">
              <span className="text-white/50">{e.time24h}</span>
              <span className="text-white/90 text-right">{e.spoken}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-display font-semibold text-amber-200 mb-3">
          🔤 DR & MRS VANDERTRAMP
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {conj.passeCompose.etreVerbs.list.map(([fr, en]) => (
            <div key={fr} className="bg-white/5 rounded-lg px-2.5 py-2">
              <div className="font-semibold text-white/90">{fr}</div>
              <div className="text-white/40">{en}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40 mt-3">
          + all reflexive verbs (se réveiller, se coucher, se laver, se promener...)
        </p>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-display font-semibold text-amber-200 mb-3">
          ⏭️ Futur simple — irregular stems
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {conj.futurSimple.irregularStems.map(([verb, stem]) => (
            <div key={verb} className="flex justify-between bg-white/5 rounded-lg px-3 py-2 font-mono">
              <span className="text-white/60">{verb}</span>
              <span className="text-amber-200">{stem}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
