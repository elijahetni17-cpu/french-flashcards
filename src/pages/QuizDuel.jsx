import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import topics from "../data/topics.json";
import quizBank from "../data/quiz-bank.json";
import extraQuestions from "../data/quiz-duel-extra.json";
import { recordQuizDuelRun, getQuizDuelStats } from "../lib/storage.js";

const N = 15;
const ROOM = "french_duel_room_";
const QUEUE = "french_duel_queue_v2";
const bank = () => [...quizBank, ...extraQuestions];
const shuffle = (a) => [...a].sort(() => Math.random() - .5);
const idsParam = (ids) => ids.map((x) => x.replace(/^q/, "")).join("-");
const idsFromParam = (s) => s.split("-").map((x) => `q${String(+x).padStart(3, "0")}`);
const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

function makeSession(topicId, ids) {
  const all = bank();
  const pool = ids?.length ? ids.map(id => all.find(q => q.id === id)).filter(Boolean) : shuffle(topicId ? all.filter(q => q.topicId === topicId) : all).slice(0, N);
  return pool.map(q => ({ ...q, shuffledOptions: shuffle(q.options.map((text, i) => ({ text, wasCorrect: i === q.correctIndex }))) }));
}
function code() { return Math.random().toString(36).slice(2, 7).toUpperCase(); }

export default function QuizDuel() {
  const { topicId } = useParams(); const nav = useNavigate(); const [params] = useSearchParams();
  const topic = topics.find(t => t.id === topicId); const challenge = params.get("c");
  const challengeIds = useMemo(() => challenge ? idsFromParam(challenge) : null, [challenge]);
  const challengeScore = params.get("sc") == null ? null : +params.get("sc");
  const challengeTime = params.get("tm") == null ? null : +params.get("tm");
  const challengeName = params.get("nm") || "a friend";

  const [phase,setPhase]=useState("intro"),[mode,setMode]=useState("solo"),[session,setSession]=useState([]),[qi,setQi]=useState(0),[selected,setSelected]=useState(null),[score,setScore]=useState(0),[streak,setStreak]=useState(0),[best,setBest]=useState(0),[elapsed,setElapsed]=useState(0),[start,setStart]=useState(null),[english,setEnglish]=useState(false),[name,setName]=useState(()=>localStorage.getItem("french_duel_name")||"Player 1"),[room,setRoom]=useState(""),[join,setJoin]=useState(""),[role,setRole]=useState(null),[ready,setReady]=useState(false),[opp,setOpp]=useState({name:"Opponent",ready:false,qi:-1,score:0,time:0,done:false}),[error,setError]=useState("");
  const channel=useRef(null), timer=useRef(null), q=session[qi];

  useEffect(()=>{ if(!room||mode!=="duel"||!("BroadcastChannel" in window)) return; const c=new BroadcastChannel(`french-duel-${room}`); channel.current=c; const on=e=>{const m=e.data||{};
    if(m.t==="join"&&role==="host"){setOpp(o=>({...o,name:m.name||"Opponent"}));c.postMessage({t:"room",ids:session.map(x=>x.id),name});}
    if(m.t==="room"&&role==="guest"){setSession(makeSession(topicId,m.ids));setOpp(o=>({...o,name:m.name||"Host"}));}
    if(m.t==="ready")setOpp(o=>({...o,ready:true,name:m.name||o.name}));
    if(m.t==="start"){setPhase("countdown");setTimeout(()=>{setStart(m.at);setElapsed(0);setPhase("playing")},Math.max(0,m.at-Date.now()));}
    if(m.t==="answer")setOpp(o=>({...o,qi:m.qi,score:m.score,time:m.time}));
    if(m.t==="done")setOpp(o=>({...o,qi:m.total,score:m.score,time:m.time,done:true}));
  }; c.addEventListener("message",on); return()=>{c.removeEventListener("message",on);c.close();channel.current=null};},[room,mode,role,session,topicId,name]);
  useEffect(()=>{if(phase!=="playing"||!start)return;timer.current=setInterval(()=>setElapsed(Math.floor((Date.now()-start)/1000)),250);return()=>clearInterval(timer.current)},[phase,start]);
  useEffect(()=>{if(mode==="duel"&&role==="host"&&ready&&opp.ready&&phase==="waiting")startDuel()},[mode,role,ready,opp.ready,phase]);

  const reset=()=>{setQi(0);setSelected(null);setScore(0);setStreak(0);setBest(0);setElapsed(0);setEnglish(false);setOpp({name:"Opponent",ready:false,qi:-1,score:0,time:0,done:false})};
  const solo=(ids=challengeIds)=>{const s=makeSession(topicId,ids);if(!s.length)return;reset();setSession(s);setMode("solo");setPhase("playing");setStart(Date.now());localStorage.setItem("french_duel_name",name.trim().slice(0,20)||"Player 1")};
  const create=(forced)=>{const r=forced||code(),s=makeSession(topicId);reset();setSession(s);setMode("duel");setRole("host");setRoom(r);setReady(false);setPhase("waiting");write(ROOM+r,{ids:s.map(q=>q.id),topicId,host:name,createdAt:Date.now()})};
  const joinRoom=(r=join)=>{const x=r.trim().toUpperCase(),data=read(ROOM+x);if(!data)return setError("Room not found on this browser. Local-only duels work between tabs/windows on the same browser/device.");reset();setSession(makeSession(data.topicId,data.ids));setMode("duel");setRole("guest");setRoom(x);setReady(false);setPhase("waiting");setTimeout(()=>channel.current?.postMessage({t:"join",name}),150)};
  const find=()=>{const q=read(QUEUE);if(q&&Date.now()-q.createdAt<120000){joinRoom(q.code);localStorage.removeItem(QUEUE);return}const r=code();write(QUEUE,{code:r,createdAt:Date.now()});create(r);setError("Matchmaking is local-only: open this app in another tab and press Find Opponent there.")};
  const readyUp=()=>{setReady(true);channel.current?.postMessage({t:"ready",name})};
  const startDuel=()=>{const at=Date.now()+3500;channel.current?.postMessage({t:"start",at});setPhase("countdown");setTimeout(()=>{setStart(at);setElapsed(0);setPhase("playing")},3500)};
  const pick=o=>{if(selected)return;const ns=score+(o.wasCorrect?1:0);setSelected(o);setScore(ns);setStreak(s=>o.wasCorrect?s+1:0);if(o.wasCorrect)setBest(b=>Math.max(b,streak+1));channel.current?.postMessage({t:"answer",qi,score:ns,time:elapsed})};
  const next=()=>qi+1<session.length?(setQi(i=>i+1),setSelected(null),setEnglish(false)):finish();
  const finish=()=>{const t=Math.max(elapsed,Math.floor((Date.now()-start)/1000));recordQuizDuelRun({topicId:topicId||"all",score,total:session.length,timeSec:t,streak:best});channel.current?.postMessage({t:"done",score,total:session.length,time:t});setElapsed(t);setPhase("done")};
  const challengeLink=()=>{const base=topicId?`/duel/${topicId}`:"/duel";return `${location.origin}${location.pathname}#${base}?c=${idsParam(session.map(q=>q.id))}&sc=${score}&tm=${elapsed}&nm=${encodeURIComponent(name)}`};
  const copy=s=>navigator.clipboard?.writeText(s).then(()=>setError("Copied."));

  if(phase==="intro")return <div className="max-w-xl mx-auto space-y-5"><div className="text-center"><div className="text-4xl">⚔️</div><h1 className="font-display text-2xl font-bold">Quiz Duel {topic?`— ${topic.title}`:"— All Topics"}</h1><p className="text-white/50 text-sm">Compete live when two tabs are open, or send a challenge link across devices.</p></div><div className="glass rounded-2xl p-5 space-y-3"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"/><div className="grid sm:grid-cols-2 gap-3"><button onClick={()=>solo()} className="py-3 rounded-xl bg-amber-400 text-black font-bold">Start Solo</button><button onClick={()=>create()} className="py-3 rounded-xl bg-white/10 font-bold">Create Private Duel</button></div><button onClick={find} className="w-full py-3 rounded-xl border border-white/10">Find Opponent</button></div><div className="glass rounded-2xl p-5"><div className="text-sm font-semibold mb-2">Join private room</div><div className="flex gap-2"><input value={join} onChange={e=>setJoin(e.target.value.toUpperCase())} placeholder="ROOM CODE" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono tracking-widest"/><button onClick={()=>joinRoom()} className="px-5 rounded-xl bg-white/10">Join</button></div></div>{challenge&&<button onClick={()=>solo(challengeIds)} className="w-full py-3 rounded-xl bg-white/10">Accept {challengeName}'s challenge ({challengeScore}/{challengeIds.length})</button>}{error&&<div className="text-xs text-amber-200 bg-amber-400/10 rounded-xl p-3">{error}</div>}<div className="text-center"><select value={topicId||""} onChange={e=>nav(e.target.value?`/duel/${e.target.value}`:"/duel")} className="glass rounded-full px-3 py-1.5 text-xs bg-transparent"><option value="" className="bg-neutral-900">All topics</option>{topics.map(t=><option key={t.id} value={t.id} className="bg-neutral-900">{t.icon} {t.title}</option>)}</select></div></div>;
  if(phase==="waiting")return <div className="max-w-lg mx-auto text-center space-y-5"><div className="text-5xl">⚔️</div><h1 className="font-display text-2xl font-bold">Duel Lobby</h1><div className="font-mono text-amber-300 text-xl tracking-widest">{room}</div><div className="glass rounded-2xl p-6 space-y-4"><p className="text-sm text-white/60">{session.length} questions • same question set • localStorage + BroadcastChannel</p><button onClick={()=>copy(`${location.origin}${location.pathname}#${topicId?`/duel/${topicId}`:"/duel"}?room=${room}`)} className="w-full py-3 rounded-xl bg-white/10">Copy invite</button><button onClick={readyUp} disabled={ready} className="w-full py-3 rounded-xl bg-amber-400 text-black font-bold">{ready?"Ready ✓":"I'm Ready"}</button><p className="text-xs text-white/40">{opp.ready?`${opp.name} is ready — starting…`:"Waiting for opponent…"}</p></div>{error&&<div className="text-xs text-amber-200">{error}</div>}<Link to="/duel" className="text-xs text-white/40">Cancel</Link></div>;
  if(phase==="countdown")return <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4"><span className="text-xs text-white/50">DUEL STARTING</span><strong className="text-7xl font-display">3</strong><span className="text-xs text-white/40">Same questions. Same start.</span></div>;
  if(phase==="playing"&&q)return <div className="max-w-xl mx-auto space-y-4"><div className="flex justify-between text-xs font-mono text-white/50"><span>Q{qi+1}/{session.length}</span><span>Score {score}</span><span>⏱ {elapsed}s</span></div>{mode==="duel"&&<div className="glass rounded-xl px-4 py-3 flex justify-between text-xs"><span>You <b className="text-amber-300">{score}</b> · {qi+1}/{session.length}</span><span>{opp.name} <b>{opp.score}</b> · {Math.max(0,opp.qi+1)}/{session.length}</span></div>}<div className="glass rounded-2xl p-6"><p className="font-display text-lg sm:text-xl font-semibold leading-snug">{q.prompt}</p>{q.promptEn&&<><button onClick={()=>setEnglish(v=>!v)} className="mt-3 text-xs px-3 py-1.5 rounded-full bg-white/10">{english?"Hide English":"Show English"}</button>{english&&<div className="mt-3 rounded-xl bg-sky-400/10 border border-sky-300/20 p-3 text-sm text-sky-100"><span className="block text-xs opacity-50 mb-1">English</span>{q.promptEn}</div>}</>}<div className="space-y-2 mt-5">{q.shuffledOptions.map((o,i)=>{const chosen=selected===o;let s="bg-white/5 border-white/10 hover:bg-white/10";if(selected&&o.wasCorrect)s="bg-emerald-500/20 border-emerald-400/40";else if(selected&&chosen)s="bg-rose-500/20 border-rose-400/40";return <button key={i} disabled={!!selected} onClick={()=>pick(o)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${s}`}><span className="font-mono text-white/40 mr-2">{String.fromCharCode(65+i)}.</span>{o.text}</button>})}</div>{selected&&<div className="mt-4 p-4 rounded-xl bg-white/5"><p className={selected.wasCorrect?"text-emerald-300":"text-rose-300"}>{selected.wasCorrect?"✓ Correct":"✗ Not quite"}</p><p className="text-white/60 text-sm mt-1">{q.explanation}</p><button onClick={next} className="mt-3 px-4 py-2 rounded-full bg-white/10 text-xs">{qi+1<session.length?"Next question →":"See results →"}</button></div>}</div></div>;
  const total=session.length,acc=total?Math.round(score/total*100):0,duel=mode==="duel"?(score>opp.score?"win":score<opp.score?"lose":"tie"):null;return <div className="max-w-lg mx-auto space-y-5 text-center"><div className="text-4xl">{duel==="win"?"🏆":acc>=70?"💪":"📚"}</div><h1 className="font-display text-2xl font-bold">{duel?(duel==="win"?"You win!":duel==="lose"?`${opp.name} wins!`:"It's a draw"):"Run complete"}</h1>{duel&&<div className="glass rounded-2xl p-5 grid grid-cols-2 gap-4"><Stat label={name} value={`${score}/${total}`}/><Stat label={opp.name} value={`${opp.score}/${total}`}/></div>}<div className="glass rounded-2xl p-6 grid grid-cols-2 gap-4"><Stat label="Score" value={`${score}/${total}`}/><Stat label="Accuracy" value={`${acc}%`}/><Stat label="Best streak" value={best}/><Stat label="Time" value={`${elapsed}s`}/></div><div className="flex gap-3"><button onClick={()=>solo()} className="flex-1 py-3 rounded-full bg-amber-400 text-black font-bold">Run it back</button><button onClick={()=>copy(challengeLink())} className="flex-1 py-3 rounded-full bg-white/10">Challenge friend</button></div><Link to="/topics" className="text-xs text-white/40">Back to topics</Link></div>;
}
function Stat({label,value}){return <div><div className="text-xs text-white/40">{label}</div><div className="font-display text-xl font-bold">{value}</div></div>}
