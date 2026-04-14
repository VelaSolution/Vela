"use client";
import { useState, useEffect } from "react";
import type { Phase, S } from "./types";
import { loadGame } from "./lib/game-logic";
import Menu from "./components/Menu";
import Setup from "./components/Setup";
import Play from "./components/Play";
import Over from "./components/Over";

export default function GamePage() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [gs, setGs]       = useState<S|null>(null);
  const [saved, setSaved] = useState<S|null>(null);

  useEffect(()=>{ setSaved(loadGame()); }, []);

  if (phase==="menu")    return <Menu onNew={()=>setPhase("setup")} onLoad={()=>{setGs(saved);setPhase("playing");}} saved={saved} />;
  if (phase==="setup")   return <Setup onStart={s=>{setGs(s);setPhase("playing");}} />;
  if (phase==="playing" && gs) return <Play s={gs} setS={setGs} onOver={()=>setPhase("gameover")} />;
  if (phase==="gameover" && gs) return <Over s={gs} onMenu={()=>{setGs(null);setSaved(null);setPhase("menu");}} onRestart={()=>setPhase("setup")} />;
  return null;
}
