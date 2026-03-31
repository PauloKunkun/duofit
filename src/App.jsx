import { useState, useEffect, useRef } from "react";
import { Home, CalendarDays, ListChecks, RotateCcw, Dumbbell, Footprints, Waves, Bike, Swords, Mountain, Leaf, Music, Flame, Zap, Star, Target, Award, Trophy, Rocket, Check, X, Plus, Pencil, Trash2, ChevronRight, ArrowLeft, User, Users, Heart, Sun, Clock, CheckCircle2, BookOpen, Sparkles, TrendingUp, BarChart2, Meh, Calendar, ClipboardList, MessageSquare, Timer, Moon } from "lucide-react";
import { supabase } from "./supabase";

/* ── CONSTANTS ── */
const USERS = { paul:{name:"Paul",color:"#2563EB"}, alexia:{name:"Alexia",color:"#EC4899"} };
const ACT_TYPES = [
  // Cardio & plein air
  {id:"marche",label:"Marche",color:"#10B981"},
  {id:"running",label:"Running",color:"#EF4444"},
  {id:"velo",label:"Vélo",color:"#F59E0B"},
  {id:"velo_salle",label:"Vélo salle",color:"#F59E0B"},
  {id:"rando",label:"Randonnée",color:"#6B7280"},
  {id:"trail",label:"Trail",color:"#92400E"},
  {id:"marche_nordique",label:"Marche nordique",color:"#047857"},
  {id:"trottinette",label:"Trottinette",color:"#0891B2"},
  // Aquatique
  {id:"piscine",label:"Natation",color:"#0EA5E9"},
  {id:"aquagym",label:"Aquagym",color:"#0284C7"},
  {id:"surf",label:"Surf",color:"#0369A1"},
  {id:"kayak",label:"Kayak / Paddle",color:"#0891B2"},
  // Force & fitness
  {id:"muscu",label:"Muscu",color:"#8B5CF6"},
  {id:"crossfit",label:"CrossFit",color:"#7C3AED"},
  {id:"hiit",label:"HIIT",color:"#DC2626"},
  {id:"pilates",label:"Pilates",color:"#EC4899"},
  {id:"calisthenics",label:"Calisthenics",color:"#6D28D9"},
  {id:"streching",label:"Stretching",color:"#A78BFA"},
  {id:"assoup",label:"Assouplissement",color:"#C084FC"},
  // Sports collectifs
  {id:"foot",label:"Football",color:"#16A34A"},
  {id:"basket",label:"Basketball",color:"#EA580C"},
  {id:"volley",label:"Volleyball",color:"#CA8A04"},
  {id:"rugby",label:"Rugby",color:"#15803D"},
  {id:"handball",label:"Handball",color:"#0F766E"},
  {id:"hockey",label:"Hockey",color:"#1D4ED8"},
  // Sports de raquette
  {id:"tennis",label:"Tennis",color:"#84CC16"},
  {id:"badminton",label:"Badminton",color:"#65A30D"},
  {id:"padel",label:"Padel",color:"#4D7C0F"},
  {id:"ping_pong",label:"Ping-pong",color:"#A3E635"},
  {id:"squash",label:"Squash",color:"#FACC15"},
  // Arts martiaux & combat
  {id:"boxe",label:"Boxe",color:"#DC2626"},
  {id:"judo",label:"Judo",color:"#B45309"},
  {id:"karate",label:"Karaté",color:"#9F1239"},
  {id:"mma",label:"MMA",color:"#BE123C"},
  {id:"krav_maga",label:"Krav Maga",color:"#991B1B"},
  // Bien-être
  {id:"yoga",label:"Yoga",color:"#A78BFA"},
  {id:"meditation",label:"Méditation",color:"#8B5CF6"},
  {id:"tai_chi",label:"Tai Chi",color:"#7C3AED"},
  // Hiver & montagne
  {id:"ski",label:"Ski",color:"#3B82F6"},
  {id:"ski_fond",label:"Ski de fond",color:"#1D4ED8"},
  {id:"snowboard",label:"Snowboard",color:"#2563EB"},
  {id:"escalade",label:"Escalade",color:"#F97316"},
  {id:"via_ferrata",label:"Via ferrata",color:"#C2410C"},
  // Danse & expression
  {id:"danse",label:"Danse",color:"#EC4899"},
  {id:"zumba",label:"Zumba",color:"#F43F5E"},
  // Autre
  {id:"golf",label:"Golf",color:"#166534"},
  {id:"equitation",label:"Équitation",color:"#92400E"},
  {id:"roller",label:"Roller / Skate",color:"#6366F1"},
  {id:"autre",label:"Autre",color:"#6B7280"},
];
const FEELINGS = [{v:"great",e:"💪",l:"Top"},{v:"good",e:"🙂",l:"Bien"},{v:"ok",e:"😐",l:"Moyen"},{v:"hard",e:"😮‍💨",l:"Dur"}];
const FEEL_COLOR = {great:"#16A34A",good:"#2563EB",ok:"#D97706",hard:"#DC2626"};
// Intensité par activité (coefficient multiplicateur)
const XP_INTENSITY = {
  // 1.0 — Très léger
  marche:1.0,meditation:1.0,assoup:1.0,golf:1.0,tai_chi:1.0,streching:1.0,
  // 1.3 — Léger
  yoga:1.3,pilates:1.3,marche_nordique:1.3,aquagym:1.3,rando:1.3,equitation:1.3,
  // 1.6 — Modéré
  piscine:1.6,velo:1.6,velo_salle:1.6,escalade:1.6,tennis:1.6,badminton:1.6,
  padel:1.6,ping_pong:1.6,danse:1.6,zumba:1.6,roller:1.6,trottinette:1.3,
  // 2.0 — Intense
  running:2.0,muscu:2.0,crossfit:2.0,foot:2.0,basket:2.0,volley:2.0,
  handball:2.0,hockey:2.0,rugby:2.0,ski:2.0,ski_fond:2.0,snowboard:2.0,
  boxe:2.0,judo:2.0,karate:2.0,squash:2.0,surf:2.0,kayak:2.0,
  trail:2.0,via_ferrata:2.0,
  // 2.5 — Très intense
  hiit:2.5,calisthenics:2.5,mma:2.5,krav_maga:2.5,
  // Par défaut
  autre:1.5,
};
const XP_BASE_VAL = 12; // base XP pour 1h d'activité à intensité 1.0
const LEVELS = [
  {n:1,title:"Débutant",xp:0},
  {n:2,title:"Premier pas",xp:150},
  {n:3,title:"En mouvement",xp:400},
  {n:4,title:"Régulier·e",xp:800},
  {n:5,title:"Motivé·e",xp:1400},
  {n:6,title:"Actif·ve",xp:2200},
  {n:7,title:"Sportif·ve",xp:3200},
  {n:8,title:"Entraîné·e",xp:4500},
  {n:9,title:"Performant·e",xp:6000},
  {n:10,title:"Athlète",xp:8000},
  {n:11,title:"Confirmé·e",xp:10500},
  {n:12,title:"Endurci·e",xp:13500},
  {n:13,title:"Expert·e",xp:17000},
  {n:14,title:"Vétéran·e",xp:21000},
  {n:15,title:"Élite",xp:26000},
  {n:16,title:"Compétiteur·rice",xp:32000},
  {n:17,title:"Maître",xp:39000},
  {n:18,title:"Champion·ne",xp:47000},
  {n:19,title:"Légende",xp:57000},
  {n:20,title:"Immortel·le",xp:70000},
];
const BADGES = [
  {id:"b1",label:"Premier pas",fn:d=>d.length>=1},
  {id:"b2",label:"5 activités",fn:d=>d.length>=5},
  {id:"b3",label:"10 activités",fn:d=>d.length>=10},
  {id:"b4",label:"20 activités",fn:d=>d.length>=20},
  {id:"b5",label:"50 activités",fn:d=>d.length>=50},
  {id:"b6",label:"3j de suite",fn:d=>chkStreak(d,3)},
  {id:"b7",label:"7j de suite",fn:d=>chkStreak(d,7)},
  {id:"b8",label:"14j de suite",fn:d=>chkStreak(d,14)},
  {id:"b9",label:"3 sports diff.",fn:d=>new Set(d.map(l=>l.type)).size>=3},
  {id:"b10",label:"6 sports diff.",fn:d=>new Set(d.map(l=>l.type)).size>=6},
  {id:"b11",label:"Lève-tôt",fn:d=>d.some(l=>l.timeStart&&l.timeStart<"08:00")},
  {id:"b12",label:"Guerrier WE",fn:d=>d.filter(l=>[0,6].includes(new Date(l.date+"T12:00:00").getDay())).length>=5},
  {id:"b13",label:"Duo actif",fn:(_,duo)=>duo>=1},
  {id:"b14",label:"Power Couple",fn:(_,duo)=>duo>=5},
  {id:"b15",label:"Cap 100 XP",fn:(_,__,xp)=>xp>=100},
  {id:"b16",label:"Cap 500 XP",fn:(_,__,xp)=>xp>=500},
  {id:"b17",label:"30 activités",fn:d=>d.length>=30},
  {id:"b18",label:"Centenaire",fn:d=>d.length>=100},
  {id:"b19",label:"Organisé·e",fn:d=>d.filter(l=>l.planned).length>=5},
  {id:"b20",label:"Randonneur·se",fn:d=>d.filter(l=>l.type==="rando").length>=5},
  {id:"b21",label:"Aquatique",fn:d=>d.filter(l=>l.type==="piscine").length>=5},
  {id:"b22",label:"Streak 30j",fn:d=>chkStreak(d,30)},
  // Badges routine
  {id:"b23",label:"1ère routine",fn:(_,__,___,rt)=>rt>=1},
  {id:"b24",label:"5 routines",fn:(_,__,___,rt)=>rt>=5},
  {id:"b25",label:"10 routines",fn:(_,__,___,rt)=>rt>=10},
  {id:"b26",label:"30 routines",fn:(_,__,___,rt)=>rt>=30},
  {id:"b27",label:"50 routines",fn:(_,__,___,rt)=>rt>=50},
  {id:"b28",label:"Semaine complète",fn:(_,__,___,rt,rtStreak)=>rtStreak>=7},
  {id:"b29",label:"Mois de routine",fn:(_,__,___,rt,rtStreak)=>rtStreak>=30},
  {id:"b30",label:"Programme fini",fn:(_,__,___,rt,___2,progDone)=>progDone>=1},
  // Badges XP avancés
  {id:"b31",label:"Cap 1000 XP",fn:(_,__,xp)=>xp>=1000},
  {id:"b32",label:"Cap 2000 XP",fn:(_,__,xp)=>xp>=2000},
  // Badges activité supplémentaires
  {id:"b33",label:"Night owl",fn:d=>d.some(l=>l.timeStart&&l.timeStart>="21:00")},
  {id:"b34",label:"Régulier·e",fn:d=>chkStreak(d,21)},
  {id:"b35",label:"Running 5x",fn:d=>d.filter(l=>l.type==="running").length>=5},
  {id:"b36",label:"Vélo 5x",fn:d=>d.filter(l=>l.type==="velo").length>=5},
  {id:"b37",label:"Duo 10x",fn:(_,duo)=>duo>=10},
  {id:"b38",label:"Cap 5000 XP",fn:(_,__,xp)=>xp>=5000},
];
const DAY_SHORT = ["L","M","M","J","V","S","D"];
const DAY_LONG = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const WEEK_COLORS = ["#2563EB","#059669","#D97706","#7C3AED","#DC2626","#0891B2"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

/* ── HELPERS ── */
const today = () => { const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
const weekMonday = (ds) => {
  const [y,m,d]=ds.split("-").map(Number);
  const dt=new Date(y,m-1,d);
  const offset=(dt.getDay()+6)%7; // days since Monday
  dt.setDate(dt.getDate()-offset);
  return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");
};
const addDays = (ds,n) => { const [y,m,d]=ds.split("-").map(Number); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()+n); return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0"); };
const fmtDate = (ds,opts) => new Date(ds+"T12:00:00").toLocaleDateString("fr-FR", opts||{weekday:"short",day:"numeric",month:"short"});
const genId = () => Math.random().toString(36).slice(2,9);
function chkStreak(logs,n){
  if(!logs.length) return false;
  const days=[...new Set(logs.map(l=>l.date))].sort();
  let s=1;
  for(let i=1;i<days.length;i++){
    if((new Date(days[i])-new Date(days[i-1]))/86400000===1){s++;if(s>=n)return true;}else s=1;
  }
  return s>=n;
}
function getStreak(logs){
  if(!logs.length) return 0;
  const t=today(), y=addDays(t,-1);
  const days=[...new Set(logs.map(l=>l.date))].sort().reverse();
  if(days[0]!==t&&days[0]!==y) return 0;
  let s=1;
  for(let i=1;i<days.length;i++){
    if((new Date(days[i-1])-new Date(days[i]))/86400000===1) s++; else break;
  }
  return s;
}
function calcXP(log){
  if(log.type==="routine") return 0; // routines handled separately via calcRoutineXP
  const intensity = XP_INTENSITY[log.type]||1.5;
  let h=0.75; // défaut 45min
  if(log.timeStart&&log.timeEnd){
    const [sh,sm]=log.timeStart.split(":").map(Number),[eh,em]=log.timeEnd.split(":").map(Number);
    const m=(eh*60+em)-(sh*60+sm); if(m>0) h=m/60;
  } else if(log.duration){
    h=parseInt(log.duration,10)/60;
  }
  return Math.max(1, Math.round(XP_BASE_VAL * intensity * h));
}
function calcRoutineXP(sections){
  if(!sections||!sections.length) return 0;
  const nbSections=sections.length;
  const nbItems=sections.reduce((s,sec)=>s+(sec.items||[]).length,0);
  return Math.min(60, 10 + nbSections*5 + nbItems*2);
}
function getLvl(xp){
  let cur=LEVELS[0],nxt=LEVELS[1];
  for(let i=0;i<LEVELS.length;i++){if(xp>=LEVELS[i].xp){cur=LEVELS[i];nxt=LEVELS[i+1]||null;}}
  const inLvl=nxt?xp-cur.xp:0, needed=nxt?nxt.xp-cur.xp:1;
  return {cur,nxt,inLvl,needed,pct:nxt?Math.min(100,Math.round(inLvl/needed*100)):100,xp};
}
function getWeekDays(off=0){
  const t=new Date(); t.setDate(t.getDate()+off*7);
  const mon=new Date(t); mon.setDate(t.getDate()-((t.getDay()+6)%7));
  return Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return d.toISOString().split("T")[0];});
}

/* ── ICON COMPONENTS ── */
function ActIcon({type,size=18,color}){
  const p={size,strokeWidth:1.8,color:color||"currentColor"};
  const m={
    marche:<Footprints {...p}/>,marche_nordique:<Footprints {...p}/>,trail:<Footprints {...p}/>,
    piscine:<Waves {...p}/>,aquagym:<Waves {...p}/>,surf:<Waves {...p}/>,kayak:<Waves {...p}/>,
    muscu:<Dumbbell {...p}/>,crossfit:<Dumbbell {...p}/>,calisthenics:<Dumbbell {...p}/>,
    running:<Flame {...p}/>,hiit:<Flame {...p}/>,
    velo:<Bike {...p}/>,velo_salle:<Bike {...p}/>,trottinette:<Bike {...p}/>,
    yoga:<Sparkles {...p}/>,meditation:<Sparkles {...p}/>,tai_chi:<Sparkles {...p}/>,pilates:<Sparkles {...p}/>,
    rando:<Mountain {...p}/>,ski:<Mountain {...p}/>,ski_fond:<Mountain {...p}/>,snowboard:<Mountain {...p}/>,escalade:<Mountain {...p}/>,via_ferrata:<Mountain {...p}/>,
    tennis:<Target {...p}/>,badminton:<Target {...p}/>,padel:<Target {...p}/>,squash:<Target {...p}/>,ping_pong:<Target {...p}/>,
    foot:<Star {...p}/>,basket:<Star {...p}/>,volley:<Star {...p}/>,rugby:<Star {...p}/>,handball:<Star {...p}/>,hockey:<Star {...p}/>,
    boxe:<Swords {...p}/>,judo:<Swords {...p}/>,karate:<Swords {...p}/>,mma:<Swords {...p}/>,krav_maga:<Swords {...p}/>,
    danse:<Music {...p}/>,zumba:<Music {...p}/>,
    assoup:<Leaf {...p}/>,streching:<Leaf {...p}/>,
    golf:<Target {...p}/>,equitation:<Heart {...p}/>,roller:<Zap {...p}/>,
    autre:<Zap {...p}/>,routine:<BookOpen {...p}/>
  };
  return m[type]||<Zap {...p}/>;
}
function LvlIcon({n,size=16}){
  const p={size,strokeWidth:1.8};
  const m=[null,<Leaf {...p} color="#10B981"/>,<Footprints {...p} color="#34D399"/>,<Heart {...p} color="#60A5FA"/>,
    <Flame {...p} color="#F97316"/>,<Zap {...p} color="#F59E0B"/>,<TrendingUp {...p} color="#EF4444"/>,
    <Target {...p} color="#8B5CF6"/>,<Award {...p} color="#EC4899"/>,<Rocket {...p} color="#2563EB"/>,<Trophy {...p} color="#F59E0B"/>];
  return m[n]||<Star {...p} color="#9CA3AF"/>;
}
function BadgeIcon({id,size=20,earned}){
  const c=earned?"#1C1A17":"#9CA3AF"; const p={size,strokeWidth:1.8,color:c};
  const m={
    // Activités – volume
    b1:<Footprints {...p}/>,       // Premier pas
    b2:<Leaf {...p}/>,             // 5 activités
    b3:<Flame {...p}/>,            // 10 activités
    b4:<Zap {...p}/>,              // 20 activités
    b5:<Trophy {...p}/>,           // 50 activités
    b17:<BarChart2 {...p}/>,       // 30 activités
    b18:<Rocket {...p}/>,          // 100 activités
    // Streaks
    b6:<TrendingUp {...p}/>,       // 3j de suite
    b7:<Star {...p}/>,             // 7j de suite
    b8:<Sparkles {...p}/>,         // 14j de suite
    b22:<Award {...p}/>,           // 30j de suite
    b34:<Target {...p}/>,          // 21j de suite
    // Sports variés
    b9:<Bike {...p}/>,             // 3 sports diff
    b10:<Mountain {...p}/>,        // 6 sports diff
    // Timing
    b11:<Sun {...p}/>,             // Lève-tôt
    b33:<Moon size={size} strokeWidth={1.8} color={c}/>,  // Night owl
    // Duo
    b13:<Users {...p}/>,           // Duo actif
    b14:<Heart {...p}/>,           // Power couple
    b37:<Swords {...p}/>,          // Duo 10x
    // Week-end
    b12:<CalendarDays {...p}/>,    // Guerrier WE
    // Planification
    b19:<Clock {...p}/>,           // Organisé·e
    // Sports spécifiques
    b20:<Footprints {...p}/>,      // Randonneur
    b21:<Waves {...p}/>,           // Aquatique
    b35:<Zap {...p}/>,             // Running 5x
    b36:<Bike {...p}/>,            // Vélo 5x
    // XP
    b15:<Flame {...p}/>,           // 100 XP
    b16:<Star {...p}/>,            // 500 XP
    b31:<Sparkles {...p}/>,        // 1000 XP
    b32:<Rocket {...p}/>,          // 2000 XP
    b38:<Trophy {...p}/>,          // 5000 XP
    // Routines
    b23:<RotateCcw {...p}/>,       // 1ère routine
    b24:<CheckCircle2 {...p}/>,    // 5 routines
    b25:<Target {...p}/>,          // 10 routines
    b26:<TrendingUp {...p}/>,      // 30 routines
    b27:<Award {...p}/>,           // 50 routines
    b28:<Flame {...p}/>,           // 7j routine consécutifs
    b29:<Rocket {...p}/>,          // 30j routine consécutifs
    b30:<BookOpen {...p}/>,        // Programme fini
  };
  return m[id]||<Star {...p}/>;
}
function NavIcon({id,active,size=16}){
  const p={size,strokeWidth:active?2:1.6,color:active?"#1C1A17":"#9C9589"};
  const m={dashboard:<Home {...p}/>,agenda:<CalendarDays {...p}/>,activities:<ListChecks {...p}/>,journal:<BookOpen {...p}/>,routine:<RotateCcw {...p}/>,exercises:<Dumbbell {...p}/>};
  return m[id]||null;
}
function SecIcon({icon,size=16}){
  const p={size,strokeWidth:1.8,color:"#6B6560"};
  if(icon==="🌅") return <Sun {...p}/>;
  if(icon==="🧘‍♀️"||icon==="🧘") return <Leaf {...p}/>;
  if(icon==="💪") return <Dumbbell {...p}/>;
  if(icon==="🚶‍♀️"||icon==="🚶") return <Footprints {...p}/>;
  if(icon==="⏸") return <Clock {...p}/>;
  return <Target {...p}/>;
}

/* ── DEFAULT DATA ── */
const mkDay=(idx,secs)=>({id:"d"+idx,dayIndex:idx,sections:secs});
const mkSec=(id,icon,label,warn,items)=>({id,icon,label,warning:warn,items});
function makeAlexiaWeeks(){
  const W1=Array.from({length:7},(_,i)=>mkDay(i,[
    mkSec("s1","🌅","Matin","",["Orteils vers soi → 10 rép."]),
    mkSec("s2","🧘‍♀️","Étirements","",["Mollet classique → 30 sec × 3"]),
    ...(i%2===0?[mkSec("s3","💪","Renforcement","Stop si douleur",["Pointe des pieds → 2×8"])]:[]),
    mkSec("s4","🚶‍♀️","Marche","",["Terrain plat → 10-15 min"]),
  ]));
  const W2=Array.from({length:7},(_,i)=>mkDay(i,[
    mkSec("s1","🌅","Matin","",["Mêmes exercices"]),
    mkSec("s2","🧘‍♀️","Étirements","",["Mollet 30 sec × 3"]),
    ...(i%2===0?[mkSec("s3","💪","Renforcement","",["Pointe des pieds → 3×10"])]:[]),
    mkSec("s4","🚶‍♀️","Marche","",["15-20 min"]),
  ]));
  const W3=Array.from({length:7},(_,i)=>mkDay(i,[
    mkSec("s1","🌅","Matin","",["Étirements dans le lit → 1 min"]),
    mkSec("s2","🧘‍♀️","Étirements","",["2 fois par jour si possible"]),
    ...(i%2===0?[mkSec("s3","💪","Renforcement","",["3×12, tenir 2-3 sec en haut"])]:[mkSec("s5","⏸","Récupération","",["Étirement 20 sec après marche"])]),
    mkSec("s4","🚶‍♀️","Marche","",["20-25 min"]),
  ]));
  const W4=Array.from({length:7},(_,i)=>mkDay(i,[
    mkSec("s1","🌅","Matin","",["1-2 min d'étirements"]),
    mkSec("s2","🧘‍♀️","Étirements","",["1-2 min par jambe, matin + soir"]),
    ...(i%2===0?[mkSec("s3","💪","Renforcement","",["3×15, option 1 jambe"])]:[]),
    mkSec("s4","🚶‍♀️","Marche","",["20-30 min"]),
  ]));
  return [
    {id:"w1",title:"Semaine 1 – Réveil en douceur",goal:"Mobiliser le mollet",startDate:null,days:W1},
    {id:"w2",title:"Semaine 2 – Progression douce",goal:"Renforcer tout en gardant la souplesse",startDate:null,days:W2},
    {id:"w3",title:"Semaine 3 – Renforcement + endurance",goal:"Mollets plus solides",startDate:null,days:W3},
    {id:"w4",title:"Semaine 4 – Consolidation",goal:"Mollets souples et renforcés",startDate:null,days:W4},
  ];
}
const DEFAULT_ROUTINES = {
  paul:[],
  alexia:[{id:"r_alexia_1",title:"Programme mollet 🦵",subtitle:"4 semaines · rééducation progressive",weeks:makeAlexiaWeeks()}]
};
const WARMUP = [
  {id:"wg1",label:"Cardio & Activation",color:"#EF4444",exercises:[
    {id:"wu1",name:"Jumping Jacks",duration:"45 sec",muscles:"Corps entier",steps:["Pieds joints, bras le long du corps","Sauter en écartant les jambes et levant les bras","Revenir, alterner à rythme progressif"]},
    {id:"wu2",name:"Montées de genoux",duration:"40 sec",muscles:"Fléchisseurs hanche, abdos",steps:["Debout, dos droit","Lever alternativement les genoux à hauteur de hanche","Bras en opposition, rythme progressif"]},
    {id:"wu3",name:"Talons-fesses",duration:"40 sec",muscles:"Ischios, mollets",steps:["Courir sur place","Amener les talons vers les fesses","Genoux pointés vers le bas, rythme progressif"]},
    {id:"wu4",name:"Inchworm",duration:"45 sec",muscles:"Ischios, épaules, core",steps:["Debout, poser les mains au sol","Avancer en marchant jusqu'en planche","Optionnel : 1 pompe","Ramener les pieds, se redresser — 4 à 6 répétitions"]},
  ]},
  {id:"wg2",label:"Haut du corps",color:"#8B5CF6",exercises:[
    {id:"wu5",name:"Rotations d'épaules",duration:"30 sec",muscles:"Épaules, trapèzes",steps:["Bras le long du corps","Grands cercles vers l'avant × 10","Grands cercles vers l'arrière × 10"]},
    {id:"wu6",name:"Rotations externes épaule",duration:"30 sec",muscles:"Coiffe des rotateurs",steps:["Coudes fléchis à 90°, levés à hauteur des épaules","Tourner les avant-bras vers l'arrière au maximum","Serrer les omoplates 2 sec — répéter × 10"]},
    {id:"wu7",name:"Rotation thoracique",duration:"40 sec",muscles:"Colonne thoracique, obliques",steps:["À quatre pattes, dos plat","Main derrière la tête","Ouvrir le coude vers le plafond en expirant","8 répétitions de chaque côté"]},
    {id:"wu8",name:"Pompes d'échauffement",duration:"40 sec",muscles:"Pectoraux, triceps",steps:["En planche, mains à largeur d'épaules","Descendre lentement en 3 sec","Remonter en 2 sec — 6 à 8 répétitions"]},
  ]},
  {id:"wg3",label:"Bas du corps",color:"#059669",exercises:[
    {id:"wu9",name:"Cercles de hanches",duration:"45 sec",muscles:"Hanches, fessiers, psoas",steps:["Pieds à largeur des hanches, mains sur les hanches","10 grands cercles dans le sens horaire","10 grands cercles dans le sens antihoraire"]},
    {id:"wu10",name:"Squat lent",duration:"40 sec",muscles:"Quadriceps, fessiers, chevilles",steps:["Pieds à largeur des épaules","Descendre lentement en 3 sec, genoux dans l'axe","Remonter en 2 sec — 8 à 10 répétitions"]},
    {id:"wu11",name:"Fentes dynamiques",duration:"45 sec",muscles:"Quadriceps, fessiers",steps:["Grand pas en avant, genou à 90°","Genou arrière proche du sol","Revenir et alterner — 10 par jambe"]},
    {id:"wu12",name:"Toe Touches",duration:"30 sec",muscles:"Ischios, dos",steps:["Debout, jambes légèrement fléchies","Se pencher en avant, toucher les orteils","Remonter lentement — 12 à 15 répétitions"]},
  ]},
  {id:"wg4",label:"Mobilité & Articulations",color:"#D97706",exercises:[
    {id:"wu13",name:"Rotations cervicales",duration:"30 sec",muscles:"Cou, trapèzes",steps:["Épaules relâchées","Incliner la tête droite / gauche / avant / arrière","En douceur, sans forcer"]},
    {id:"wu14",name:"Rotations poignets & chevilles",duration:"30 sec",muscles:"Poignets, chevilles",steps:["Mains devant, 10 cercles dans chaque sens","Lever un pied, 10 cercles de cheville","Répéter de l'autre côté"]},
    {id:"wu15",name:"Chat-Vache",duration:"40 sec",muscles:"Colonne vertébrale",steps:["À quatre pattes, dos plat","Inspiration : creuser le dos (Vache)","Expiration : arrondir le dos (Chat)","10 à 15 répétitions lentes"]},
  ]},
];
const STRETCH = [
  {id:"sg1",label:"Mollets & Pieds",color:"#EC4899",exercises:[
    {id:"ss1",name:"Mollet classique debout",duration:"30 sec / côté",pos:"Debout",muscles:"Gastrocnémien, tendon d'Achille",steps:["Face à un mur, mains à hauteur d'épaules","Reculer un pied, jambe tendue, talon au sol","Pencher légèrement le buste vers le mur","Tenir 30 sec puis changer de côté"]},
    {id:"ss2",name:"Mollet assis (sangle)",duration:"30 sec / côté",pos:"Assis·e",muscles:"Gastrocnémien, soléaire",steps:["Assis, une jambe tendue devant","Sangle ou serviette sous la plante du pied","Tirer doucement le pied vers soi","Tenir 30 sec puis changer"]},
    {id:"ss3",name:"Mollet allongé (actif)",duration:"30 sec / côté",pos:"Allongé·e",muscles:"Gastrocnémien",steps:["Allongé sur le dos","Tendre une jambe vers le plafond","Fléchir le pied (orteils vers soi)","Tenir 30 sec puis changer"]},
  ]},
  {id:"sg2",label:"Quadriceps",color:"#2563EB",exercises:[
    {id:"ss4",name:"Quadriceps debout",duration:"30 sec / côté",pos:"Debout",muscles:"Quadriceps",steps:["Debout, s'appuyer sur un mur si besoin","Plier un genou, attraper le pied derrière","Genoux joints, bassin neutre","Tenir 30 sec puis changer"]},
    {id:"ss5",name:"Fente basse – psoas",duration:"45 sec / côté",pos:"Debout",muscles:"Psoas, iliaque, quadriceps",steps:["Genou arrière posé au sol","Pied avant à 90°, genou dans l'axe","Avancer doucement le bassin vers l'avant","Tenir 45 sec puis changer"]},
    {id:"ss6",name:"Quadriceps allongé",duration:"30 sec",pos:"Allongé·e",muscles:"Quadriceps, abdos",steps:["Allongé sur le ventre","Mains sous les épaules","Pousser le buste vers le haut, hanches au sol","Tenir 30 sec, répéter 2 fois"]},
  ]},
  {id:"sg3",label:"Ischios-jambiers",color:"#059669",exercises:[
    {id:"ss7",name:"Ischios debout (Toe Touch)",duration:"40 sec",pos:"Debout",muscles:"Ischios, bas du dos",steps:["Debout, pieds à largeur des hanches","Se pencher en avant lentement","Atteindre les tibias, chevilles ou orteils","Tenir 40 sec, respirer profondément"]},
    {id:"ss8",name:"Ischios assis (pince)",duration:"40 sec / côté",pos:"Assis·e",muscles:"Ischios, lombaires",steps:["Assis, jambe à étirer tendue devant","Autre jambe fléchie contre la cuisse","Pencher le buste vers le pied — DOS DROIT","Tenir 40 sec puis changer"]},
    {id:"ss9",name:"Ischios allongé",duration:"40 sec / côté",pos:"Allongé·e",muscles:"Ischios, mollets",steps:["Allongé sur le dos","Lever une jambe tendue vers le plafond","Attraper le mollet ou la cuisse","Tirer doucement vers soi, tenir 40 sec puis changer"]},
  ]},
  {id:"sg4",label:"Hanches & Fessiers",color:"#D97706",exercises:[
    {id:"ss10",name:"Fessier debout",duration:"30 sec / côté",pos:"Debout",muscles:"Grand fessier, piriforme",steps:["Croiser la cheville droite sur le genou gauche","Plier légèrement la jambe d'appui","Se pencher doucement vers l'avant","Tenir 30 sec puis changer"]},
    {id:"ss11",name:"Figure 4 assis",duration:"40 sec / côté",pos:"Assis·e",muscles:"Grand fessier, piriforme",steps:["Assis, croiser la cheville droite sur le genou gauche","Se pencher doucement en avant","Sentir l'étirement dans la fesse droite","Tenir 40 sec puis changer"]},
    {id:"ss12",name:"Pigeon allongé",duration:"1 min / côté",pos:"Allongé·e",muscles:"Piriforme, grand fessier",steps:["Allongé sur le dos, genoux fléchis","Croiser la cheville droite sur le genou gauche","Attraper la cuisse gauche avec les deux mains","Tirer vers la poitrine, tenir 1 min puis changer"]},
    {id:"ss13",name:"Papillon – adducteurs",duration:"45 sec",pos:"Assis·e",muscles:"Adducteurs, aine",steps:["Assis, plantes des pieds collées","Laisser tomber les genoux vers le sol","Dos droit, mains sur les chevilles ou les pieds","Tenir 45 sec en respirant"]},
  ]},
  {id:"sg5",label:"Dos & Lombaires",color:"#7C3AED",exercises:[
    {id:"ss14",name:"Dos debout (bras tendus)",duration:"30 sec × 2",pos:"Debout",muscles:"Grand dorsal, lombaires",steps:["Face à une barre ou colonne, bras tendus","Reculer les pieds, buste à 90°","Pousser les hanches vers l'arrière","Tenir 30 sec, répéter 2 fois"]},
    {id:"ss15",name:"Torsion assise",duration:"30 sec / côté",pos:"Assis·e",muscles:"Lombaires, obliques",steps:["Assis, jambes tendues","Plier le genou droit, pied à l'extérieur","Coude gauche contre le genou droit, tourner","Tenir 30 sec puis changer de côté"]},
    {id:"ss16",name:"Genou poitrine allongé",duration:"40 sec / côté",pos:"Allongé·e",muscles:"Lombaires, fessiers",steps:["Allongé sur le dos","Ramener un genou vers la poitrine","Maintenir le bas du dos au sol","Tenir 40 sec puis changer"]},
    {id:"ss17",name:"Torsion allongée",duration:"40 sec / côté",pos:"Allongé·e",muscles:"Lombaires, piriforme",steps:["Allongé sur le dos, genoux fléchis","Laisser tomber les deux genoux d'un côté","Bras en croix, regarder du côté opposé","Tenir 40 sec puis changer"]},
    {id:"ss18",name:"Position de l'enfant",duration:"1 min",pos:"Allongé·e",muscles:"Lombaires, fessiers, épaules",steps:["À genoux, s'asseoir sur les talons","Allonger les bras devant soi","Front posé au sol","Respirer profondément pendant 1 minute"]},
  ]},
  {id:"sg6",label:"Épaules & Poitrine",color:"#0891B2",exercises:[
    {id:"ss19",name:"Pectoral au mur",duration:"30 sec / côté",pos:"Debout",muscles:"Grand pectoral, deltoïde",steps:["À l'angle d'un mur, avant-bras contre le mur","Coude à hauteur d'épaule","Pivoter le corps vers l'extérieur","Tenir 30 sec puis changer"]},
    {id:"ss20",name:"Épaule croisée",duration:"25 sec / côté",pos:"Debout",muscles:"Deltoïde postérieur",steps:["Amener un bras tendu en travers de la poitrine","De l'autre main, saisir le coude","Tirer doucement vers la poitrine","Tenir 25 sec puis changer"]},
    {id:"ss21",name:"Pectoral allongé",duration:"30 sec / côté",pos:"Allongé·e",muscles:"Grand pectoral",steps:["Allongé sur le ventre","Étendre un bras à 90°, paume au sol","Rouler légèrement vers le bras tendu","Tenir 30 sec puis changer"]},
  ]},
  {id:"sg7",label:"Cou & Trapèzes",color:"#64748B",exercises:[
    {id:"ss22",name:"Inclinaison latérale",duration:"20 sec × 4",pos:"Debout",muscles:"SCM, trapèze supérieur",steps:["Épaules relâchées loin des oreilles","Incliner l'oreille vers l'épaule sans hausser","Option : main douce sur la tempe","20 sec dans chaque direction"]},
    {id:"ss23",name:"Cou en avant assis",duration:"30 sec",pos:"Assis·e",muscles:"Cervicales postérieures",steps:["Assis, dos droit, épaules relâchées","Laisser tomber la tête en avant doucement","Laisser le poids de la tête faire l'étirement","Tenir 30 sec, respirer profondément"]},
  ]},
];
const POS_C = {Debout:"#2563EB","Assis·e":"#059669","Allongé·e":"#7C3AED"};

/* ── PROGRAM DETAIL (outside App to allow useState) ── */
function ProgramDetail({person,routine,ap}){
  const [openDay,setOpenDay]=useState(null);
  const {logs,setLogs,editMode,setEditMode,setActiveRid,setConfirmDelete,updR,addWeekR,updWeekR,addSec,remSec,updSec,addItm,updItm,remItm,setScheduleRid,setScheduleStartDate,setShowScheduleModal,progView,setProgView,routineWid,setRoutineWid} = ap;
  const [selDayId,setSelDayId]=useState(null);
  const activeWeekDef = routine.weeks.find(w=>w.startDate&&today()>=w.startDate&&today()<=addDays(w.startDate,6)) || routine.weeks.find(w=>w.startDate) || routine.weeks[0];
  const activeWid = routineWid || activeWeekDef?.id || routine.weeks[0]?.id;
  const setActiveWid = setRoutineWid;
  const weekIdx = routine.weeks.findIndex(w=>w.id===activeWid);
  const color = WEEK_COLORS[weekIdx >= 0 ? weekIdx % WEEK_COLORS.length : 0];
  const t=today();
  const activeWeek=routine.weeks.find(w=>w.id===activeWid)||routine.weeks[0];
  if(!activeWeek) return(
    <div>
      <button onClick={()=>{setActiveRid(null);setEditMode(false);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,color:"#6B6560",marginBottom:12,padding:0}}><ArrowLeft size={14}/>Retour</button>
      <div style={{fontFamily:"'DM Serif Display'",fontSize:18,marginBottom:8}}>{routine.title}</div>
      {editMode&&<button onClick={()=>addWeekR(person,routine.id)} style={btnAdd(color)}>+ Ajouter une semaine</button>}
      {editMode&&<button onClick={()=>setConfirmDelete({type:"prog",person,rid:routine.id})} style={btnDanger()}>Supprimer ce programme</button>}
    </div>
  );
  const days=activeWeek.days||[];
  // startDate effectif : planifié → startDate réel, non planifié → aujourd'hui + weekIdx*7
  const effectiveStartDate = activeWeek.startDate || addDays(t, weekIdx*7);
  return(
    <div>
      <button onClick={()=>{setActiveRid(null);setEditMode(false);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,color:"#6B6560",marginBottom:12,padding:0}}><ArrowLeft size={14}/>Tous les programmes</button>
      {editMode
        ?<div style={{marginBottom:12}}><input value={routine.title} onChange={e=>updR(person,routine.id,r=>({...r,title:e.target.value}))} style={inp}/><input value={routine.subtitle||""} onChange={e=>updR(person,routine.id,r=>({...r,subtitle:e.target.value}))} placeholder="Sous-titre" style={{...inp,marginTop:6,fontSize:12}}/></div>
        :<div style={{marginBottom:12}}><div style={{fontFamily:"'DM Serif Display'",fontSize:18,color:"#1C1A17"}}>{routine.title}</div>{routine.subtitle&&<div style={{fontSize:12,color:"#9C9589"}}>{routine.subtitle}</div>}</div>}

      {/* Sélecteur de semaines — sous le toggle */}
      <div style={{display:"flex",gap:4,marginBottom:10,overflowX:"auto"}}>
        {routine.weeks.map((w,i)=>(
          <button key={w.id} onClick={()=>setActiveWid(w.id)} style={{flexShrink:0,padding:"4px 12px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:500,background:activeWid===w.id?color:"#EDEBE6",color:activeWid===w.id?"#fff":"#6B6560"}}>S{i+1}</button>
        ))}
        {editMode&&<button onClick={()=>addWeekR(person,routine.id)} style={{flexShrink:0,padding:"4px 12px",borderRadius:20,border:"1.5px dashed "+color,cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,background:"transparent",color}}>+</button>}
      </div>
      {/* Bandeau titre de la semaine active */}
      <div style={{background:color+"10",borderRadius:10,padding:"8px 12px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        {editMode
          ?<div style={{flex:1}}><input value={activeWeek.title} onChange={e=>updWeekR(person,routine.id,activeWeek.id,"title",e.target.value)} style={{...inp,marginBottom:4,fontSize:13}}/><input value={activeWeek.goal||""} onChange={e=>updWeekR(person,routine.id,activeWeek.id,"goal",e.target.value)} placeholder="Objectif" style={{...inp,fontSize:12}}/></div>
          :<div><div style={{fontSize:13,fontWeight:600,color}}>{activeWeek.title}</div>{activeWeek.goal&&<div style={{fontSize:11,color:"#6B6560"}}>🎯 {activeWeek.goal}</div>}</div>}
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,marginLeft:8}}>
          {activeWeek.startDate&&<span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10,background:"#EDE9FE",color:"#6D28D9",padding:"2px 7px",borderRadius:20}}><Calendar size={9}/>planifié</span>}
          {editMode&&<button onClick={()=>setConfirmDelete({type:"week",person,rid:routine.id,wid:activeWeek.id})} style={{background:"none",border:"none",cursor:"pointer",color:"#EF4444"}}><Trash2 size={13}/></button>}
        </div>
      </div>
      {false&&(()=>{
        // Ordre d'affichage des jours depuis startDate (offset 0,1,2..6)
        // Pour chaque offset, on trouve le jour du programme avec le bon dayIndex
        const todayDi = (new Date().getDay()+6)%7;

        // Construire la liste ordonnée des 7 jours (avec offset depuis startDate ou dayIndex naturel)
        const buildWeekList = () => {
          const sDi=(new Date(effectiveStartDate+"T12:00:00").getDay()+6)%7;
          return Array.from({length:7},(_,offset)=>{
            const targetDi=(sDi+offset)%7;
            const day=days.find(d=>d.dayIndex===targetDi)||null;
            const ds=addDays(effectiveStartDate,offset);
            return {day,ds,offset,isRest:!day||day.sections.length===0};
          });
        };
        const weekList = buildWeekList();
        return(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {weekList.map(({day,ds,isRest},idx) => {
              if(!day) return null;
              const done = !isRest && ds && logs.some(l=>l.user===person&&l.type==="routine"&&l.note===routine.id+"_"+activeWeek.id+"_"+ds&&!l.planned);
              const isT = ds ? ds===t : day.dayIndex===todayDi;
              const wdi = ds ? (new Date(ds+"T12:00:00").getDay()+6)%7 : day.dayIndex;
              return(
                <div key={day.id}
                  onClick={isRest ? undefined : ()=>{setSelDayId(day.id);setProgView("day");}}
                  style={{background:done?"#F0FDF4":isT?"#FFFBEB":isRest?"#F7F5F2":"#fff",borderRadius:12,
                    border:isT?"2px solid #F59E0B":done?"1px solid #BBF7D0":isRest?"1px dashed #E5E1DA":"1px solid #E5E1DA",
                    padding:"10px 14px",cursor:isRest?"default":"pointer",display:"flex",alignItems:"center",gap:12,
                    opacity:isRest?0.5:1}}>
                  <div style={{width:36,textAlign:"center",flexShrink:0}}>
                    <div style={{fontSize:10,color:isT?"#D97706":"#9C9589",fontWeight:600}}>{DAY_SHORT[wdi]}</div>
                    <div style={{fontSize:18,fontWeight:700,color:isT?"#D97706":done?"#16A34A":isRest?"#B8B0A6":color}}>
                      {ds ? new Date(ds+"T12:00:00").getDate() : isT ? new Date().getDate() : "—"}
                    </div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:isT?"#D97706":isRest?"#B8B0A6":"#1C1A17"}}>
                      {DAY_LONG[wdi]}
                      {isT&&<span style={{fontSize:10,fontWeight:500,color:"#D97706",marginLeft:6}}>Aujourd'hui</span>}
                      {isRest&&<span style={{fontSize:10,fontWeight:400,color:"#B8B0A6",marginLeft:6}}>Repos</span>}
                    </div>
                    {!isRest&&<div style={{fontSize:11,color:"#9C9589"}}>{day.sections.length} section{day.sections.length!==1?"s":""}</div>}
                  </div>
                  {!isRest&&(done?<CheckCircle2 size={16} color="#16A34A" strokeWidth={2}/>:<ChevronRight size={15} color={isT?"#F59E0B":"#CBD5E1"}/>)}
                </div>
              );
            })}
          </div>
        );
      })()}

      {!editMode&&(()=>{
        const todayDi = (new Date().getDay()+6)%7;

        // Construire la liste ordonnée (même que vue semaine)
        const buildWeekList2 = () => {
          const sDi=(new Date(effectiveStartDate+"T12:00:00").getDay()+6)%7;
          return Array.from({length:7},(_,offset)=>{
            const targetDi=(sDi+offset)%7;
            const day=days.find(d=>d.dayIndex===targetDi)||null;
            const ds=addDays(effectiveStartDate,offset);
            return {day,ds};
          }).filter(x=>x.day&&x.day.sections.length>0);
        };
        const orderedActive = buildWeekList2(); // [{day, ds}] triés dans l'ordre de la semaine

        // Trouver la position du jour sélectionné (ou aujourd'hui par défaut)
        let pos = 0;
        if(selDayId){
          const found = orderedActive.findIndex(x=>x.day.id===selDayId);
          pos = found >= 0 ? found : 0;
        } else {
          // Défaut = aujourd'hui
          const found = orderedActive.findIndex(x=>x.ds===t || (!x.ds && x.day.dayIndex===todayDi));
          pos = found >= 0 ? found : 0;
        }

        const {day, ds} = orderedActive[pos] || {};
        if(!day) return null;

        const done = ds && logs.some(l=>l.user===person&&l.type==="routine"&&l.note===routine.id+"_"+activeWeek.id+"_"+ds&&!l.planned);
        const isT = ds ? ds===t : day.dayIndex===todayDi;
        const wdi = ds ? (new Date(ds+"T12:00:00").getDay()+6)%7 : day.dayIndex;
        const wdLabel = DAY_LONG[wdi];
        const markDay = ()=>setLogs(p=>[...p,{id:Date.now(),user:person,type:"routine",date:ds||t,note:routine.id+"_"+activeWeek.id+"_"+(ds||t),planned:false,timeStart:"",timeEnd:""}]);
        const unmark  = ()=>setLogs(p=>p.filter(l=>!(l.user===person&&l.type==="routine"&&l.note===routine.id+"_"+activeWeek.id+"_"+(ds||t))));

        // Navigation dans orderedActive
        const curWeekIdx = routine.weeks.findIndex(w=>w.id===activeWid);
        const nextWeek = curWeekIdx+1 < routine.weeks.length ? routine.weeks[curWeekIdx+1] : null;
        const prevWeek = curWeekIdx-1 >= 0 ? routine.weeks[curWeekIdx-1] : null;

        // firstActiveDay/lastActiveDay : utilise buildWeekList2 sur une autre semaine
        const buildList = (w) => {
          const wIdx3=routine.weeks.findIndex(x=>x.id===w.id);
          const esd=w.startDate||addDays(t,wIdx3*7);
          const sDi=(new Date(esd+"T12:00:00").getDay()+6)%7;
          return Array.from({length:7},(_,offset)=>{
            const d=(w.days||[]).find(d=>d.dayIndex===(sDi+offset)%7)||null;
            return d&&d.sections.length>0?d:null;
          }).filter(Boolean);
        };
        const firstActiveDay = (w) => { const a=buildList(w); return a[0]||null; };
        const lastActiveDay  = (w) => { const a=buildList(w); return a[a.length-1]||null; };

        return(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              {pos > 0 ? (
                <button onClick={()=>setSelDayId(orderedActive[pos-1].day.id)} style={{...navBtn}}>‹</button>
              ) : prevWeek ? (
                <button onClick={()=>{const d=lastActiveDay(prevWeek);setActiveWid(prevWeek.id);setSelDayId(d?d.id:null);}}
                  style={{...navBtn,background:WEEK_COLORS[(curWeekIdx-1)%WEEK_COLORS.length]+"18",color:WEEK_COLORS[(curWeekIdx-1)%WEEK_COLORS.length],fontWeight:700,fontSize:11,padding:"6px 10px",borderRadius:10,border:"1.5px solid "+WEEK_COLORS[(curWeekIdx-1)%WEEK_COLORS.length]}}>‹ S{curWeekIdx}</button>
              ) : (
                <div style={{...navBtn,opacity:0}}/>
              )}
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:700,color:isT?"#D97706":color}}>
                  {wdLabel}{ds&&<span style={{fontSize:11,color:"#9C9589",marginLeft:6}}>{fmtDate(ds,{day:"numeric",month:"short"})}</span>}
                </div>
                {isT&&<div style={{fontSize:10,color:"#D97706",fontWeight:600}}>Aujourd'hui</div>}
              </div>
              {pos < orderedActive.length-1 ? (
                <button onClick={()=>setSelDayId(orderedActive[pos+1].day.id)} style={{...navBtn}}>›</button>
              ) : nextWeek ? (
                <button onClick={()=>{const d=firstActiveDay(nextWeek);setActiveWid(nextWeek.id);setSelDayId(d?d.id:null);}}
                  style={{...navBtn,background:color+"18",color,fontWeight:700,fontSize:11,padding:"6px 10px",borderRadius:10,border:"1.5px solid "+color}}>S{curWeekIdx+2} ›</button>
              ) : (
                <div style={{...navBtn,opacity:0}}/>
              )}
            </div>
            {day.sections.length===0&&<div style={{textAlign:"center",color:"#B8B0A6",fontSize:13,padding:"20px 0"}}>Jour de repos</div>}
            {day.sections.map((sec,si)=>(
              <div key={sec.id} style={{background:"#fff",borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid #E5E1DA",borderLeft:"3px solid "+color}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><SecIcon icon={sec.icon} size={16}/><span style={{fontSize:14,fontWeight:600,color:"#1C1A17"}}>{sec.label}</span></div>
                {sec.warning&&<div style={{fontSize:11,color:"#D97706",background:"#FFFBEB",borderRadius:7,padding:"4px 10px",marginBottom:8}}>⚠️ {sec.warning}</div>}
                {sec.items.map((item,idx)=>(
                  <div key={idx} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:color,flexShrink:0,marginTop:6}}/>
                    <div style={{fontSize:13,color:"#3D3A35",lineHeight:1.6,flex:1}}>{item}</div>
                  </div>
                ))}
              </div>
            ))}
            {!done&&ds&&<button className="bp" onClick={markDay} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:color,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:8}}><CheckCircle2 size={16} strokeWidth={2}/>Marquer comme fait</button>}
            {done&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",borderRadius:12,background:"#F0FDF4",border:"1px solid #BBF7D0",marginTop:8}}><CheckCircle2 size={16} color="#16A34A"/><span style={{fontSize:13,color:"#16A34A",fontWeight:600}}>Séance complétée !</span><button onClick={unmark} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#86EFAC"}}>Annuler</button></div>}
          </div>
        );
      })()}

      {editMode&&(
        <div>
          <div style={{display:"flex",gap:4,marginBottom:10,overflowX:"auto"}}>
            {days.map((day,i)=>(
              <button key={day.id} onClick={()=>setOpenDay(openDay===day.id?null:day.id)} style={{flexShrink:0,padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:500,background:openDay===day.id?color:"#EDEBE6",color:openDay===day.id?"#fff":"#6B6560"}}>{DAY_SHORT[i]}</button>
            ))}
          </div>
          {openDay&&(()=>{
            const day=days.find(d=>d.id===openDay);
            if(!day) return null;
            const di=days.indexOf(day);
            return(
              <div style={{background:"#fff",border:"1px solid "+color,borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:12,fontWeight:600,color,marginBottom:10}}>{DAY_LONG[di]}</div>
                {day.sections.map((sec,si)=>(
                  <div key={sec.id}>
                    {si>0&&<div style={{height:1,background:"#F0EDE8",margin:"10px 0"}}/>}
                    <div style={{display:"flex",gap:6,marginBottom:6}}>
                      <input value={sec.icon} onChange={e=>updSec(person,routine.id,activeWeek.id,day.id,sec.id,"icon",e.target.value)} style={{...inp,width:44,padding:"4px 6px",fontSize:15,textAlign:"center"}}/>
                      <input value={sec.label} onChange={e=>updSec(person,routine.id,activeWeek.id,day.id,sec.id,"label",e.target.value)} style={{...inp,flex:1,padding:"6px 10px",fontSize:12,fontWeight:600}}/>
                      <button onClick={()=>remSec(person,routine.id,activeWeek.id,day.id,sec.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#EF4444"}}><Trash2 size={13}/></button>
                    </div>
                    <input value={sec.warning||""} onChange={e=>updSec(person,routine.id,activeWeek.id,day.id,sec.id,"warning",e.target.value)} placeholder="⚠️ Avertissement" style={{...inp,padding:"5px 10px",fontSize:11,marginBottom:6}}/>
                    {sec.items.map((item,idx)=>(
                      <div key={idx} style={{display:"flex",gap:6,marginBottom:4}}>
                        <input value={item} onChange={e=>updItm(person,routine.id,activeWeek.id,day.id,sec.id,idx,e.target.value)} style={{...inp,flex:1,padding:"5px 10px",fontSize:12}}/>
                        <button onClick={()=>remItm(person,routine.id,activeWeek.id,day.id,sec.id,idx)} style={{background:"none",border:"none",cursor:"pointer",color:"#9C9589"}}><X size={12}/></button>
                      </div>
                    ))}
                    <button onClick={()=>addItm(person,routine.id,activeWeek.id,day.id,sec.id)} style={addRowBtn}>+ Élément</button>
                  </div>
                ))}
                <button onClick={()=>addSec(person,routine.id,activeWeek.id,day.id)} style={btnAdd(color)}>+ Section</button>
              </div>
            );
          })()}
        </div>
      )}

      {editMode&&(
        <button onClick={()=>setConfirmDelete({type:"prog",person,rid:routine.id})} style={btnDanger()}>Supprimer ce programme</button>
      )}
    </div>
  );
}

function ProgramList({person,ap}){
  const {routines,setActiveRid,setOpenWeek,setEditMode,setNewProgTarget,setShowNewProg}=ap;
  const list=routines[person]||[];
  const color=USERS[person].color;
  return(
    <div>
      {list.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#B8B0A6"}}><User size={32} strokeWidth={1.2} color="#D4CFC8" style={{margin:"0 auto 8px",display:"block"}}/><div style={{fontSize:14}}>Aucun programme</div></div>}
      {list.map(prog=>(
        <button key={prog.id} onClick={()=>{setActiveRid(prog.id);setOpenWeek(prog.weeks[0]?.id||null);setEditMode(false);}} style={{width:"100%",background:"#fff",border:"1px solid #E5E1DA",borderRadius:12,padding:"14px 16px",cursor:"pointer",fontFamily:"'DM Sans'",textAlign:"left",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:16,color:"#1C1A17"}}>{prog.title}</div>
            <div style={{fontSize:11,color:"#9C9589",marginTop:3}}>{prog.weeks.length} sem.{prog.weeks.some(w=>w.startDate)&&<span style={{display:"inline-flex",alignItems:"center",gap:3,color:"#6D28D9"}}> · <Calendar size={9}/>planifié</span>}</div>
          </div>
          <ChevronRight size={16} color="#CBD5E1"/>
        </button>
      ))}
      <button onClick={()=>{setNewProgTarget(person);setShowNewProg(true);}} style={btnAdd(color)}>+ Nouveau programme</button>
    </div>
  );
}

/* ── SHARED STYLE HELPERS ── */
const inp = {width:"100%",padding:"10px 12px",border:"1px solid #E5E1DA",borderRadius:10,fontSize:13,color:"#1C1A17",background:"#F7F5F2",outline:"none",fontFamily:"'DM Sans'",boxSizing:"border-box"};
const navBtn = {background:"none",border:"1px solid #E5E1DA",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:18,color:"#6B6560",lineHeight:1};
const btnAdd = (color) => ({display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:"1.5px dashed "+(color||"#D4CFC8"),background:"transparent",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,color:color||"#9C9589",width:"100%",marginTop:8,justifyContent:"center"});
const btnDanger = () => ({display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:"1.5px dashed #FCA5A5",background:"transparent",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,color:"#DC2626",width:"100%",marginTop:8,justifyContent:"center"});
const addRowBtn = {display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:8,border:"1px dashed #D4CFC8",background:"transparent",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,color:"#9C9589",marginTop:4};

/* ── EXERCISE CARD COMPONENT ── */
function ExCard({ex, groupColor, exTab, exEditMode, onDelete}){
  const [open,setOpen]=useState(false);
  return(
    <div style={{background:"#fff",borderRadius:10,marginBottom:6,border:"1px solid #E5E1DA",overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 12px",cursor:"pointer"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:"#1C1A17"}}>{ex.name}{ex.custom&&<span style={{fontSize:9,color:"#9C9589",marginLeft:5,background:"#F0EDE8",padding:"1px 5px",borderRadius:10}}>perso</span>}</div>
          <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10,background:"#F0EDE8",color:"#6B6560",padding:"2px 7px",borderRadius:20}}><Clock size={9}/>{ex.duration}</span>
            {ex.pos&&<span style={{fontSize:10,background:(POS_C[ex.pos]||"#64748B")+"15",color:POS_C[ex.pos]||"#64748B",padding:"2px 7px",borderRadius:20,fontWeight:500}}>{ex.pos}</span>}
            {ex.muscles&&<span style={{fontSize:10,background:groupColor+"15",color:groupColor,padding:"2px 7px",borderRadius:20}}>{typeof ex.muscles==="string"?ex.muscles:ex.muscles.join(", ")}</span>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
          {exEditMode&&<button className="bp" onClick={e=>{e.stopPropagation();onDelete();}} style={{padding:"3px 8px",borderRadius:7,border:"1px solid #FCA5A5",background:"#FEF2F2",color:"#DC2626",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11}}>Supprimer</button>}
          <ChevronRight size={15} color="#CBD5E1" style={{transform:open?"rotate(90deg)":"none",transition:"transform .2s"}}/>
        </div>
      </div>
      {open&&ex.steps&&ex.steps.length>0&&(
        <div style={{borderTop:"1px solid #F0EDE8",padding:"10px 12px",background:"#FAFAFA"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#9C9589",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Comment faire</div>
          {ex.steps.map((step,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:6}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:groupColor,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
              <div style={{fontSize:12,color:"#3D3A35",lineHeight:1.6}}>{step}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


const BADGE_COND = {
  b1:"Enregistre ta 1ère activité",
  b2:"Atteins 5 activités",
  b3:"Atteins 10 activités",
  b4:"Atteins 20 activités",
  b5:"Atteins 50 activités",
  b6:"Enchaîne 3 jours d'activité consécutifs",
  b7:"Enchaîne 7 jours d'activité consécutifs",
  b8:"Enchaîne 14 jours d'activité consécutifs",
  b9:"Pratique 3 sports différents",
  b10:"Pratique 6 sports différents",
  b11:"Enregistre une activité avant 8h du matin",
  b12:"Enregistre 5 activités un samedi ou dimanche",
  b13:"Fais la même activité le même jour qu'Alexia ou Paul",
  b14:"Réalise 5 activités en duo",
  b15:"Cumule 100 XP",
  b16:"Cumule 500 XP",
  b17:"Atteins 30 activités au total",
  b18:"Atteins 100 activités au total",
  b19:"Planifie 5 activités à l'avance",
  b20:"Enregistre 5 randonnées",
  b21:"Enregistre 5 sessions de natation",
  b22:"Enchaîne 30 jours d'activité consécutifs",
  b23:"Marque ta 1ère séance de routine comme faite",
  b24:"Complète 5 séances de routine",
  b25:"Complète 10 séances de routine",
  b26:"Complète 30 séances de routine",
  b27:"Complète 50 séances de routine",
  b28:"Enchaîne 7 jours consécutifs avec une séance de routine",
  b29:"Enchaîne 30 jours consécutifs avec une séance de routine",
  b30:"Valide au moins une séance dans chaque semaine d'un programme",
  b31:"Cumule 1000 XP",
  b32:"Cumule 2000 XP",
  b33:"Enregistre une activité après 21h",
  b34:"Enchaîne 21 jours d'activité consécutifs",
  b35:"Enregistre 5 sessions de running",
  b36:"Enregistre 5 sessions de vélo",
  b37:"Réalise 10 activités en duo",
  b38:"Cumule 5000 XP",
};

/* ══════════════════════════════════════════════════════════════ */
export default function App(){
  const [activeUser,setActiveUser]=useState("paul");
  const [view,setView]=useState("dashboard");
  const [logs,setLogsState]=useState([]);
  const [routines,setRoutinesState]=useState(DEFAULT_ROUTINES);
  const [customWarmup,setCustomWarmupState]=useState([]);
  const [customStretch,setCustomStretchState]=useState([]);
  const [deletedEx,setDeletedExState]=useState([]);
  const [loading,setLoading]=useState(true);

  // ── Chargement initial depuis Supabase ──
  useEffect(()=>{
    async function loadAll(){
      // Logs
      const {data:logsData}=await supabase.from("logs").select("*").order("created_at",{ascending:true});
      if(logsData) setLogsState(logsData.map(r=>({
        id:r.id, user:r.user_id, type:r.type, date:r.date, note:r.note,
        timeStart:r.time_start||"", timeEnd:r.time_end||"",
        duration:r.duration||"", planned:r.planned, feeling:r.feeling||null
      })));
      // Settings (routines, customWarmup, customStretch, deletedEx)
      const {data:settings}=await supabase.from("settings").select("*");
      if(settings){
        const get=(key,def)=>{const r=settings.find(s=>s.key===key);return r?r.value:def;};
        setRoutinesState(get("routines",DEFAULT_ROUTINES));
        setCustomWarmupState(get("customWarmup",[]));
        setCustomStretchState(get("customStretch",[]));
        setDeletedExState(get("deletedEx",[]));
      }
      setLoading(false);
    }
    loadAll();

    // ── Temps réel : écoute les changements de logs ──
    const channel=supabase.channel("realtime-logs")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"logs"},payload=>{
        const r=payload.new;
        setLogsState(p=>{
          // Évite les doublons si l'entrée existe déjà
          if(p.some(l=>l.id===r.id)) return p;
          return [...p,{id:r.id,user:r.user_id,type:r.type,date:r.date,note:r.note,timeStart:r.time_start||"",timeEnd:r.time_end||"",duration:r.duration||"",planned:r.planned,feeling:r.feeling||null}];
        });
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"logs"},payload=>{
        const r=payload.new;
        setLogsState(p=>p.map(l=>l.id===r.id?{...l,id:r.id,user:r.user_id,type:r.type,date:r.date,note:r.note,timeStart:r.time_start||"",timeEnd:r.time_end||"",duration:r.duration||"",planned:r.planned,feeling:r.feeling||null}:l));
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"logs"},payload=>{
        setLogsState(p=>p.filter(l=>l.id!==payload.old.id));
      })
      .subscribe();
    return ()=>supabase.removeChannel(channel);
  },[]);

  // ── Wrappers qui sync avec Supabase ──
  const logsRef = useRef([]);
  const submittingRef = useRef(false);
  useEffect(()=>{ logsRef.current = logs; },[logs]);

  const setLogs=(fn)=>{
    const prev=logsRef.current;
    const next=typeof fn==="function"?fn(prev):fn;
    logsRef.current=next;
    const prevIds=new Set(prev.map(l=>l.id));
    const nextIds=new Set(next.map(l=>l.id));
    const toInsert=next.filter(l=>!prevIds.has(l.id));
    const toDelete=prev.filter(l=>!nextIds.has(l.id));
    const toUpdate=next.filter(l=>{
      if(!prevIds.has(l.id)) return false;
      const old=prev.find(p=>p.id===l.id);
      return JSON.stringify(l)!==JSON.stringify(old);
    });
    if(toInsert.length>0){
      supabase.from("logs").insert(toInsert.map(l=>({
        id:l.id,user_id:l.user,type:l.type,date:l.date,note:l.note||"",
        time_start:l.timeStart||"",time_end:l.timeEnd||"",
        duration:l.duration||"",planned:l.planned,feeling:l.feeling||null
      }))).then(({error})=>{ if(error) console.error("Insert error:",error); });
    }
    if(toDelete.length>0){
      supabase.from("logs").delete().in("id",toDelete.map(l=>l.id))
        .then(({error})=>{ if(error) console.error("Delete error:",error); });
    }
    if(toUpdate.length>0){
      toUpdate.forEach(l=>{
        supabase.from("logs").update({
          user_id:l.user,type:l.type,date:l.date,note:l.note||"",
          time_start:l.timeStart||"",time_end:l.timeEnd||"",
          duration:l.duration||"",planned:l.planned,feeling:l.feeling||null
        }).eq("id",l.id).then(({error})=>{ if(error) console.error("Update error:",error); });
      });
    }
    setLogsState(next);
  };

  const saveSetting=async(key,value)=>{
    await supabase.from("settings").upsert({key,value},{onConflict:"key"});
  };

  const setRoutines=(fn)=>{
    setRoutinesState(prev=>{
      const next=typeof fn==="function"?fn(prev):fn;
      saveSetting("routines",next);
      return next;
    });
  };
  const setCustomWarmup=(fn)=>{
    setCustomWarmupState(prev=>{
      const next=typeof fn==="function"?fn(prev):fn;
      saveSetting("customWarmup",next);
      return next;
    });
  };
  const setCustomStretch=(fn)=>{
    setCustomStretchState(prev=>{
      const next=typeof fn==="function"?fn(prev):fn;
      saveSetting("customStretch",next);
      return next;
    });
  };
  const setDeletedEx=(fn)=>{
    setDeletedExState(prev=>{
      const next=typeof fn==="function"?fn(prev):fn;
      saveSetting("deletedEx",next);
      return next;
    });
  };

  // UI state
  const [showAdd,setShowAdd]=useState(false);
  const [newAct,setNewAct]=useState({type:"marche",date:today(),note:"",timeStart:"",timeEnd:"",duration:"",feeling:null,planned:false});
  const [agendaView,setAgendaView]=useState("month");
  const [calMonth,setCalMonth]=useState(new Date());
  const [calWeekOff,setCalWeekOff]=useState(0);
  const [calDay,setCalDay]=useState(today());
  const [calFilter,setCalFilter]=useState("all");
  const [actFilter,setActFilter]=useState("all");
  const [actSubTab,setActSubTab]=useState("plan"); // "plan" | "done"
  const [selectedBoth,setSelectedBoth]=useState(false);
  const [journalTab,setJournalTab]=useState("sportDone");
  const [badgeFilter,setBadgeFilter]=useState("all");
  const [openBadge,setOpenBadge]=useState(null);
  const [actDetail,setActDetail]=useState(null); // log object to show in detail popup
  const [openLevelUser,setOpenLevelUser]=useState(null); // "paul" | "alexia" | null
  const [routineSubTab,setRoutineSubTab]=useState("programs");
  const [activeRid,setActiveRid]=useState(null);
  const [editMode,setEditMode]=useState(false);
  const [openWeek,setOpenWeek]=useState(null);
  const [progView,setProgView]=useState("week");
  const [routineWid,setRoutineWid]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [showNewProg,setShowNewProg]=useState(false);
  const [newProgTarget,setNewProgTarget]=useState("paul");
  const [newProgTitle,setNewProgTitle]=useState("");
  const [newProgSub,setNewProgSub]=useState("");
  const [showScheduleModal,setShowScheduleModal]=useState(false);
  const [scheduleRid,setScheduleRid]=useState(null);
  const [scheduleStart,setScheduleStart]=useState(today());
  const [exTab,setExTab]=useState("warmup");
  const [openEx,setOpenEx]=useState(null);
  const [exEditMode,setExEditMode]=useState(false);
  const [showAddEx,setShowAddEx]=useState(false);
  const [newExName,setNewExName]=useState("");
  const [newExDur,setNewExDur]=useState("");
  const [newExMuscles,setNewExMuscles]=useState("");
  const [newExType,setNewExType]=useState("warmup");
  // Prompt generator
  const [pgGoal,setPgGoal]=useState("");
  const [pgWeeks,setPgWeeks]=useState("4");
  const [pgDays,setPgDays]=useState("5");
  const [pgRest,setPgRest]=useState("Samedi, Dimanche");
  const [pgActiveDays,setPgActiveDays]=useState([0,1,2,3,4]);
  const [pgEquip,setPgEquip]=useState([]);           // équipement disponible
  const [pgLieu,setPgLieu]=useState("domicile");     // lieu d'entraînement
  const [pgProfile,setPgProfile]=useState("");       // contexte physique
  const [pgFormat,setPgFormat]=useState("");         // format préféré (optionnel)
  const [pgLevel,setPgLevel]=useState("débutant");
  const [pgType,setPgType]=useState("renforcement");
  const [pgDur,setPgDur]=useState("45");
  const [pgConstraint,setPgConstraint]=useState("");
  const [pgCopied,setPgCopied]=useState(false);
  const [pgJson,setPgJson]=useState("");
  const [pgStatus,setPgStatus]=useState(null);
  const [pgMsg,setPgMsg]=useState("");
  const [pgTarget,setPgTarget]=useState("paul");

  /* Routine helpers */
  const setPersonR=(p,fn)=>setRoutines(r=>({...r,[p]:fn(r[p])}));
  const updR=(p,rid,fn)=>setPersonR(p,list=>list.map(r=>r.id===rid?fn(r):r));
  function addWeekR(p,rid){
    const days=Array.from({length:7},(_,i)=>({id:genId(),dayIndex:i,sections:[]}));
    updR(p,rid,r=>({...r,weeks:[...r.weeks,{id:genId(),title:"Nouvelle semaine",goal:"",startDate:null,days}]}));
  }
  const remWeek=(p,rid,wid)=>updR(p,rid,r=>({...r,weeks:r.weeks.filter(w=>w.id!==wid)}));
  const updWeekR=(p,rid,wid,f,v)=>updR(p,rid,r=>({...r,weeks:r.weeks.map(w=>w.id===wid?{...w,[f]:v}:w)}));
  const addSec=(p,rid,wid,did)=>updR(p,rid,r=>({...r,weeks:r.weeks.map(w=>w.id===wid?{...w,days:w.days.map(d=>d.id===did?{...d,sections:[...d.sections,{id:genId(),icon:"📌",label:"Section",warning:"",items:[""]}]}:d)}:w)}));
  const remSec=(p,rid,wid,did,sid)=>updR(p,rid,r=>({...r,weeks:r.weeks.map(w=>w.id===wid?{...w,days:w.days.map(d=>d.id===did?{...d,sections:d.sections.filter(s=>s.id!==sid)}:d)}:w)}));
  const updSec=(p,rid,wid,did,sid,f,v)=>updR(p,rid,r=>({...r,weeks:r.weeks.map(w=>w.id===wid?{...w,days:w.days.map(d=>d.id===did?{...d,sections:d.sections.map(s=>s.id===sid?{...s,[f]:v}:s)}:d)}:w)}));
  const addItm=(p,rid,wid,did,sid)=>updR(p,rid,r=>({...r,weeks:r.weeks.map(w=>w.id===wid?{...w,days:w.days.map(d=>d.id===did?{...d,sections:d.sections.map(s=>s.id===sid?{...s,items:[...s.items,""]}:s)}:d)}:w)}));
  const updItm=(p,rid,wid,did,sid,idx,v)=>updR(p,rid,r=>({...r,weeks:r.weeks.map(w=>w.id===wid?{...w,days:w.days.map(d=>d.id===did?{...d,sections:d.sections.map(s=>s.id===sid?{...s,items:s.items.map((it,i)=>i===idx?v:it)}:s)}:d)}:w)}));
  const remItm=(p,rid,wid,did,sid,idx)=>updR(p,rid,r=>({...r,weeks:r.weeks.map(w=>w.id===wid?{...w,days:w.days.map(d=>d.id===did?{...d,sections:d.sections.map(s=>s.id===sid?{...s,items:s.items.filter((_,i)=>i!==idx)}:s)}:d)}:w)}));
  function scheduleRoutine(){
    const p=activeUser; updR(p,scheduleRid,r=>({...r,weeks:r.weeks.map((w,i)=>({...w,startDate:addDays(scheduleStart,i*7)}))}));
    setShowScheduleModal(false);
  }
  function delProg(p,rid){setPersonR(p,list=>list.filter(r=>r.id!==rid));setActiveRid(null);setEditMode(false);}

  /* Activity helpers */
  const myLogs=logs.filter(l=>l.user===activeUser);
  const myDone=myLogs.filter(l=>!l.planned&&l.type!=="routine");
  // Routine stats for badges
  const myRoutineDone=myLogs.filter(l=>!l.planned&&l.type==="routine");
  const rtDates=[...new Set(myRoutineDone.map(l=>l.date))].sort();
  const getRtStreak=()=>{
    if(!rtDates.length) return 0;
    let s=1,max=1;
    for(let i=1;i<rtDates.length;i++){
      const diff=(new Date(rtDates[i])-new Date(rtDates[i-1]))/86400000;
      if(diff===1){s++;max=Math.max(max,s);}else s=1;
    }
    return max;
  };
  const getProgDone=()=>{
    const userRoutines=routines[activeUser]||[];
    return userRoutines.filter(r=>r.weeks.length>0&&r.weeks.every(w=>{
      if(!w.startDate) return false;
      return w.days.some(d=>d.sections.length>0&&myRoutineDone.some(l=>l.note===r.id+"_"+w.id+"_"+addDays(w.startDate,(d.dayIndex-(new Date(w.startDate+"T12:00:00").getDay()+6)%7+7)%7)));
    })).length;
  };
  const totalXP=logs.filter(l=>l.user===activeUser&&!l.planned).reduce((s,l)=>{
    if(l.type==="routine"){
      // Find sections for this routine log
      let sections=[];
      (routines[activeUser]||[]).forEach(r=>r.weeks.forEach(w=>{
        if(l.note===r.id+"_"+w.id+"_"+l.date){
          const sDi=(w.startDate?(new Date(w.startDate+"T12:00:00").getDay()+6)%7:0);
          const day=w.days.find(d=>d.dayIndex===sDi)||w.days[0];
          if(day) sections=day.sections;
        }
      }));
      return s+calcRoutineXP(sections);
    }
    return s+calcXP(l);
  },0);
  const lvl=getLvl(totalXP);
  const streak=getStreak(myDone);
  function addActivity(){
    if(!newAct.type||!newAct.date) return;
    if(submittingRef.current) return;
    submittingRef.current=true;
    if(selectedBoth){setLogs(p=>[...p,{id:Date.now(),user:"paul",...newAct},{id:Date.now()+1,user:"alexia",...newAct}]);}else{setLogs(p=>[...p,{id:Date.now(),user:activeUser,...newAct}]);}
    setShowAdd(false); setNewAct({type:"marche",date:today(),note:"",timeStart:"",timeEnd:"",duration:"",feeling:null,planned:false});
    setTimeout(()=>{ submittingRef.current=false; },1000);
  }
  function getDuo(){
    const p=logs.filter(l=>l.user==="paul"&&!l.planned).map(l=>l.date+l.type);
    const a=logs.filter(l=>l.user==="alexia"&&!l.planned).map(l=>l.date+l.type);
    return p.filter(x=>a.includes(x)).length;
  }

  /* Agenda helpers */
  const calY=calMonth.getFullYear(), calM=calMonth.getMonth();
  const calDaysN=new Date(calY,calM+1,0).getDate();
  const calFirst=(new Date(calY,calM,1).getDay()+6)%7;
  const calDs=n=>`${calY}-${String(calM+1).padStart(2,"0")}-${String(n).padStart(2,"0")}`;
  const agWkDays=getWeekDays(calWeekOff);
  function logsForDate(ds){
    return logs.filter(l=>{
      if(l.date!==ds) return false;
      if(l.type==="routine") return false; // routines affichées séparément via routineWeeksForDate
      if(calFilter==="paul") return l.user==="paul";
      if(calFilter==="alexia") return l.user==="alexia";
      if(calFilter==="both") return l.user==="paul"||l.user==="alexia";
      return l.user===activeUser;
    });
  }
  function routineWeeksForDate(ds){
    const res=[];
    const persons=calFilter==="paul"?["paul"]:calFilter==="alexia"?["alexia"]:calFilter==="both"?[]:[activeUser];
    persons.forEach(person=>(routines[person]||[]).forEach(rt=>rt.weeks.forEach((w,i)=>{
      if(w.startDate&&ds>=w.startDate&&ds<=addDays(w.startDate,6)) res.push({person,routineTitle:rt.title,weekTitle:w.title,weekNum:i+1});
    })));
    return res;
  }

  /* Build ap object for ProgramDetail/ProgramList */
  const ap={logs,setLogs,routines,editMode,setEditMode,setActiveRid,setConfirmDelete,setOpenWeek,progView,setProgView,routineWid,setRoutineWid,
    updR,addWeekR,updWeekR,addSec,remSec,updSec,addItm,updItm,remItm,
    setScheduleRid,setScheduleStartDate:setScheduleStart,setShowScheduleModal,setNewProgTarget,setShowNewProg};

  /* ─── RENDER ─── */
  const uColor=USERS[activeUser].color;
  if(loading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#F7F5F2",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:"'DM Serif Display'",fontSize:28,color:"#1C1A17"}}>duo<span style={{color:"#2563EB"}}>fit</span></div>
      <div style={{fontSize:13,color:"#9C9589"}}>Chargement...</div>
    </div>
  );
  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#F7F5F2",minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;} body{background:#F7F5F2;}
        .bp:active{transform:scale(0.97);} input,textarea,select{font-family:'DM Sans',sans-serif;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#D4CFC8;border-radius:3px;}
        .nsc::-webkit-scrollbar{display:none;}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.fi{animation:fi 0.2s ease;}
      `}</style>

      {/* Header */}
      <div style={{padding:"18px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'DM Serif Display'",fontSize:24,color:"#1C1A17",letterSpacing:"-0.5px"}}>duo<span style={{color:uColor}}>fit</span></span>
        <div style={{display:"flex",gap:5,background:"#EDEBE6",borderRadius:20,padding:3}}>
          {["paul","alexia"].map(u=>(
            <button key={u} className="bp" onClick={()=>{setActiveUser(u);setActiveRid(null);setEditMode(false);}} style={{padding:"5px 13px",borderRadius:18,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:500,background:activeUser===u?USERS[u].color:"transparent",color:activeUser===u?"#fff":"#6B6560"}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:4}}><User size={12} strokeWidth={2}/>{USERS[u].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex",padding:"0 8px",borderBottom:"1px solid #E5E1DA",overflowX:"auto",justifyContent:"center"}} className="nsc">
        {["dashboard","agenda","journal","activities","routine","exercises"].map(id=>{
          const labels={dashboard:"Accueil",agenda:"Agenda",journal:"Journal",activities:"Activités",routine:"Routine",exercises:"Exercices"};
          const active=view===id;
          return(
            <button key={id} className="bp" onClick={()=>setView(id)} style={{flex:"0 0 auto",padding:"10px 8px",border:"none",background:"transparent",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,color:active?"#1C1A17":"#9C9589",fontWeight:active?600:400,borderBottom:active?"2px solid #1C1A17":"2px solid transparent",whiteSpace:"nowrap"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <NavIcon id={id} active={active}/>
                <span>{labels[id]}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{padding:"16px 14px 80px"}}>

        {/* ══ DASHBOARD ══ */}
        {view==="dashboard"&&(
          <div className="fi">
            {/* Level cards side by side */}
            <div style={{display:"flex",gap:10,marginBottom:2}}>
            {["paul","alexia"].map(u=>{
              const ux=logs.filter(l=>l.user===u&&!l.planned).reduce((s,l)=>{
                if(l.type==="routine"){let sec=[];(routines[u]||[]).forEach(r=>r.weeks.forEach(w=>{if(l.note===r.id+"_"+w.id+"_"+l.date){const d=w.days[0];if(d)sec=d.sections;}}));return s+calcRoutineXP(sec);}
                return s+calcXP(l);
              },0);
              const ul=getLvl(ux);
              const ust=getStreak(logs.filter(l=>l.user===u&&!l.planned&&l.type!=="routine"));
              const uacts=logs.filter(l=>l.user===u&&!l.planned&&l.type!=="routine").length;
              const isActive=u===activeUser;
              return(
                <div key={u} className="bp" onClick={()=>setOpenLevelUser(u)} style={{flex:1,minWidth:0,background:"#fff",borderRadius:14,padding:12,border:`2px solid ${isActive?USERS[u].color:"#E5E1DA"}`,cursor:"pointer"}}>
                  {/* Header: emoji + name + XP */}
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:USERS[u].color+"22",display:"flex",alignItems:"center",justifyContent:"center"}}><User size={15} strokeWidth={1.8} color={USERS[u].color}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'DM Serif Display'",fontSize:15,color:"#1C1A17"}}>{USERS[u].name}</div>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:1}}>
                        <LvlIcon n={ul.cur.n} size={12}/>
                        <span style={{fontSize:11,fontWeight:600,color:USERS[u].color}}>Niv.{ul.cur.n}</span>
                        <span style={{fontSize:10,color:"#B8B0A6"}}>· {ux} XP</span>
                      </div>
                    </div>
                    {ust>0&&<div style={{display:"flex",alignItems:"center",gap:2,background:"#FFF7ED",borderRadius:20,padding:"2px 7px"}}><Flame size={11} color="#D97706"/><span style={{fontSize:11,fontWeight:600,color:"#D97706"}}>{ust}j</span></div>}
                  </div>
                  {/* XP progress bar */}
                  <div style={{height:5,background:"#F0EDE8",borderRadius:5,overflow:"hidden",marginBottom:6}}>
                    <div style={{height:"100%",borderRadius:5,background:USERS[u].color,width:`${ul.pct}%`,transition:"width .4s"}}/>
                  </div>
                  {/* Footer: activities count + next level */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,color:"#9C9589"}}>{uacts} activité{uacts!==1?"s":""}</span>
                    <span style={{fontSize:10,color:"#9C9589"}}>{ul.nxt?`${ul.needed-ul.inLvl} XP → Niv.${ul.nxt.n}`:"Max !"}</span>
                  </div>
                </div>
              );
            })}
            </div>

            {/* ── Programme du jour ── */}
            {(()=>{
              const t=today();
              // Activités planifiées aujourd'hui
              const plannedActs=logs.filter(l=>{
                if(l.date!==t||l.planned===false||l.type==="routine") return false;
                return l.user===activeUser;
              });
              // Activités faites aujourd'hui
              const doneActs=logs.filter(l=>{
                if(l.date!==t||l.planned!==false||l.type==="routine") return false;
                return l.user===activeUser;
              });
              // Routines prévues aujourd'hui pour l'utilisateur actif uniquement
              const routineItems=[];
              [activeUser].forEach(person=>{
                (routines[person]||[]).forEach(rt=>{
                  rt.weeks.forEach((w,wi)=>{
                    if(!w.startDate) return;
                    for(let d=0;d<7;d++){
                      if(addDays(w.startDate,d)===t){
                        const done=logs.some(l=>l.user===person&&l.type==="routine"&&l.note===rt.id+"_"+w.id+"_"+t&&!l.planned);
                        routineItems.push({person,rtTitle:rt.title,rtId:rt.id,week:w,weekNum:wi+1,done});
                        break;
                      }
                    }
                  });
                });
              });
              if(plannedActs.length===0&&doneActs.length===0&&routineItems.length===0) return null;
              return(
                <div style={{marginTop:4,marginBottom:4}}>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:17,color:"#1C1A17",marginBottom:8}}>Aujourd'hui</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {plannedActs.map(l=>{
                      const at=ACT_TYPES.find(a=>a.id===l.type);
                      return(
                        <button key={l.id} className="bp" onClick={()=>{setView("journal");setJournalTab("sportPlan");}}
                          style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#fff",borderRadius:12,border:"1.5px dashed #8B5CF6",cursor:"pointer",fontFamily:"'DM Sans'",textAlign:"left",width:"100%"}}>
                          <div style={{width:30,height:30,borderRadius:8,background:at?.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ActIcon type={l.type} size={16} color={at?.color}/></div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:500,color:"#1C1A17"}}>{at?.label}</div>
                            <div style={{fontSize:11,color:"#8B5CF6"}}>{USERS[l.user]?.name} · planifié{l.timeStart?" · "+l.timeStart:""}</div>
                          </div>
                          <span style={{fontSize:12,color:"#C4BEB7"}}>›</span>
                        </button>
                      );
                    })}
                    {doneActs.map(l=>{
                      const at=ACT_TYPES.find(a=>a.id===l.type);
                      return(
                        <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#F0FDF4",borderRadius:12,border:"1px solid #BBF7D0"}}>
                          <div style={{width:30,height:30,borderRadius:8,background:at?.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ActIcon type={l.type} size={16} color={at?.color}/></div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:500,color:"#14532D"}}>{at?.label}</div>
                            <div style={{fontSize:11,color:"#15803D"}}>{USERS[l.user]?.name}{l.timeStart&&" · "+l.timeStart+(l.timeEnd?"→"+l.timeEnd:"")}{l.duration&&!l.timeStart&&" · "+l.duration+"min"}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            {l.feeling&&<span style={{fontSize:14}}>{FEELINGS.find(f=>f.v===l.feeling)?.e}</span>}
                            <div style={{fontSize:12,fontWeight:600,color:uColor}}>+{calcXP(l)}XP</div>
                          </div>
                        </div>
                      );
                    })}
                    {routineItems.map((item,i)=>(
                      <button key={i} className="bp" onClick={()=>{setView("journal");setJournalTab("rtPlan");}}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:item.done?"#F0FDF4":"#fff",borderRadius:12,border:item.done?"1px solid #BBF7D0":"1.5px solid #E5E1DA",cursor:"pointer",fontFamily:"'DM Sans'",textAlign:"left",width:"100%"}}>
                        <div style={{width:30,height:30,borderRadius:8,background:item.done?"#DCFCE7":"#F0EDE8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.done?<CheckCircle2 size={16} color="#16A34A"/>:<ClipboardList size={16} color="#9C9589"/>}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:500,color:item.done?"#14532D":"#1C1A17"}}>{item.rtTitle}</div>
                          <div style={{fontSize:11,color:item.done?"#15803D":USERS[item.person].color}}>{USERS[item.person].name} · {item.week.title}</div>
                        </div>
                        <span style={{fontSize:12,color:"#C4BEB7"}}>›</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Badges */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,marginTop:4}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:17,color:"#1C1A17"}}>Badges — {USERS[activeUser].name}</div>
              <div style={{fontSize:11,color:"#9C9589"}}>{BADGES.filter(b=>b.fn(myDone,getDuo(),totalXP,myRoutineDone.length,getRtStreak(),getProgDone())).length}/{BADGES.length}</div>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:10,background:"#EDEBE6",borderRadius:10,padding:3}}>
              {[["all","Tous"],["earned","Obtenus"],["locked","À débloquer"]].map(([k,l])=>(
                <button key={k} className="bp" onClick={()=>setBadgeFilter(k)} style={{flex:1,padding:"5px 3px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:500,background:badgeFilter===k?"#fff":"transparent",color:badgeFilter===k?"#1C1A17":"#9C9589",boxShadow:badgeFilter===k?"0 1px 3px rgba(0,0,0,.07)":"none"}}>{l}</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>
              {BADGES.filter(b=>{
                const e=b.fn(myDone,getDuo(),totalXP,myRoutineDone.length,getRtStreak(),getProgDone());
                if(badgeFilter==="earned") return e;
                if(badgeFilter==="locked") return !e;
                return true;
              }).map(b=>{
                const e=b.fn(myDone,getDuo(),totalXP,myRoutineDone.length,getRtStreak(),getProgDone());
                return(
                  <div key={b.id} className="bp" onClick={()=>setOpenBadge(openBadge===b.id?null:b.id)} style={{background:"#fff",borderRadius:12,padding:"9px 5px",textAlign:"center",border:e?"1px solid #E5E1DA":"1px dashed #E5E1DA",opacity:e?1:0.4,cursor:"pointer",position:"relative"}}>
                    <div style={{display:"flex",justifyContent:"center",height:26,alignItems:"center"}}><BadgeIcon id={b.id} size={20} earned={e}/></div>
                    <div style={{fontSize:8,color:"#6B6560",marginTop:3,lineHeight:1.3}}>{b.label}</div>
                    {e&&<div style={{position:"absolute",top:-2,right:-2,width:7,height:7,borderRadius:"50%",background:"#16A34A",border:"1.5px solid #fff"}}/>}
                    {openBadge===b.id&&<div style={{position:"absolute",bottom:"calc(100% + 5px)",left:"50%",transform:"translateX(-50%)",background:"#1C1A17",color:"#fff",borderRadius:8,padding:"6px 10px",fontSize:10,zIndex:50,maxWidth:150,textAlign:"center",lineHeight:1.4}}>{e&&<div style={{color:"#4ADE80",fontSize:9,marginBottom:2}}>✓ Obtenu</div>}<div style={{color:"#E5E7EB"}}>{BADGE_COND[b.id]||""}</div></div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ AGENDA ══ */}
        {view==="agenda"&&(
          <div className="fi">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{display:"flex",gap:4,background:"#EDEBE6",borderRadius:10,padding:3}}>
                {[["month","Mois"],["week","Sem."],["day","Jour"]].map(([k,l])=>(
                  <button key={k} className="bp" onClick={()=>setAgendaView(k)} style={{padding:"5px 10px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:500,background:agendaView===k?"#fff":"transparent",color:agendaView===k?"#1C1A17":"#9C9589",boxShadow:agendaView===k?"0 1px 3px rgba(0,0,0,.08)":"none"}}>{l}</button>
                ))}
              </div>
              <select value={calFilter} onChange={e=>setCalFilter(e.target.value)} style={{padding:"5px 8px",borderRadius:8,border:"1px solid #E5E1DA",background:"#fff",fontFamily:"'DM Sans'",fontSize:11,color:"#6B6560",outline:"none"}}>
                <option value="all">Mes activités</option><option value="paul">Paul</option><option value="alexia">Alexia</option><option value="both">Ensemble</option>
              </select>
            </div>

            {agendaView==="month"&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <button className="bp" onClick={()=>setCalMonth(m=>{const n=new Date(m);n.setMonth(n.getMonth()-1);return n;})} style={navBtn}>‹</button>
                  <span style={{fontFamily:"'DM Serif Display'",fontSize:18}}>{MONTHS[calM]} {calY}</span>
                  <button className="bp" onClick={()=>setCalMonth(m=>{const n=new Date(m);n.setMonth(n.getMonth()+1);return n;})} style={navBtn}>›</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
                  {DAY_SHORT.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,color:"#9C9589",fontWeight:600}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:10}}>
                  {Array.from({length:calFirst},(_,i)=><div key={"e"+i}/>)}
                  {Array.from({length:calDaysN},(_,i)=>{
                    const n=i+1, ds=calDs(n), isT=ds===today(), isSel=ds===calDay;
                    const dl=logsForDate(ds), rw=routineWeeksForDate(ds);
                    return(
                      <div key={n} className="bp" onClick={()=>{setCalDay(ds);setAgendaView("day");}} style={{background:isSel?"#EEF3FF":isT?"#FFF7ED":"#fff",borderRadius:7,padding:"5px 3px",minHeight:50,border:isT?"2px solid #F59E0B":isSel?"2px solid "+uColor:"1px solid #F0EDE8",cursor:"pointer"}}>
                        <div style={{fontSize:11,color:isT?"#D97706":isSel?uColor:"#3D3A35",fontWeight:isT||isSel?700:400,textAlign:"center"}}>{n}</div>
                        <div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center",marginTop:2}}>
                          {dl.filter(l=>!l.planned).slice(0,1).map(l=><div key={l.id} style={{width:5,height:5,borderRadius:"50%",background:USERS[l.user]?.color||"#ccc"}}/>)}
                          {dl.filter(l=>l.planned).slice(0,1).map(l=><div key={l.id} style={{width:5,height:5,borderRadius:"50%",border:"1.5px dashed "+(USERS[l.user]?.color||"#ccc"),background:"transparent"}}/>)}
                          {rw.slice(0,1).map((r,i)=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#16A34A"}}/>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:10,justifyContent:"center",fontSize:11,color:"#6B6560"}}>
                  {[["#2563EB","Paul"],["#EC4899","Alexia"],["#7C3AED","Ensemble"],["#16A34A","Routine"]].map(([c,l])=>(
                    <span key={l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:c}}/>{l}</span>
                  ))}
                </div>
              </div>
            )}

            {agendaView==="week"&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <button className="bp" onClick={()=>setCalWeekOff(o=>o-1)} style={navBtn}>‹</button>
                  <span style={{fontSize:13,fontWeight:600,color:"#1C1A17"}}>{fmtDate(agWkDays[0],{day:"numeric",month:"short"})} — {fmtDate(agWkDays[6],{day:"numeric",month:"short",year:"numeric"})}</span>
                  <button className="bp" onClick={()=>setCalWeekOff(o=>o+1)} style={navBtn}>›</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {agWkDays.map((ds,i)=>{
                    const isT=ds===today(), dl=logsForDate(ds), rw=routineWeeksForDate(ds);
                    return(
                      <div key={ds} className="bp" onClick={()=>{setCalDay(ds);setAgendaView("day");}} style={{background:"#fff",borderRadius:12,border:isT?"2px solid "+uColor:"1px solid #E5E1DA",padding:"10px 12px",cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div style={{width:40,textAlign:"center",flexShrink:0}}>
                          <div style={{fontSize:10,color:"#9C9589",fontWeight:600}}>{DAY_SHORT[i]}</div>
                          <div style={{fontSize:20,fontWeight:700,color:isT?uColor:"#1C1A17"}}>{new Date(ds+"T12:00:00").getDate()}</div>
                        </div>
                        <div style={{flex:1}}>
                          {dl.length===0&&rw.length===0&&<div style={{fontSize:12,color:"#C4BEB7",paddingTop:3}}>—</div>}
                          {dl.slice(0,2).map(l=>{
                            const at=ACT_TYPES.find(a=>a.id===l.type);
                            return(<div key={l.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><div style={{width:3,height:14,borderRadius:2,background:USERS[l.user]?.color||"#ccc"}}/><span style={{fontSize:12,color:"#1C1A17"}}>{at?.label}</span>{l.timeStart&&<span style={{fontSize:10,color:"#9C9589"}}>{l.timeStart}</span>}</div>);
                          })}
                          {dl.length>2&&<div style={{fontSize:11,color:"#9C9589"}}>+{dl.length-2} autres</div>}
                          {rw.slice(0,1).map((r,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}><div style={{width:3,height:12,borderRadius:2,background:"#16A34A"}}/><span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"#15803D"}}><ClipboardList size={11}/>{r.routineTitle}</span></div>)}
                        </div>
                        <ChevronRight size={14} color="#CBD5E1"/>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {agendaView==="day"&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <button className="bp" onClick={()=>setCalDay(d=>addDays(d,-1))} style={navBtn}>‹</button>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'DM Serif Display'",fontSize:17}}>{fmtDate(calDay,{weekday:"long",day:"numeric",month:"long"})}</div>
                    {calDay===today()&&<div style={{fontSize:11,color:"#D97706",fontWeight:600}}>Aujourd'hui</div>}
                  </div>
                  <button className="bp" onClick={()=>setCalDay(d=>addDays(d,1))} style={navBtn}>›</button>
                </div>
                {(()=>{
                  const dl=logsForDate(calDay), rw=routineWeeksForDate(calDay);
                  if(dl.length===0&&rw.length===0) return <div style={{textAlign:"center",color:"#B8B0A6",fontSize:13,padding:"30px 0"}}>Aucun événement</div>;
                  return(
                    <div style={{display:"flex",flexDirection:"column",gap:7}}>
                      {dl.map(l=>{
                        const at=ACT_TYPES.find(a=>a.id===l.type), uc=USERS[l.user]?.color||"#ccc";
                        return(
                          <div key={l.id} className="bp" onClick={()=>setActDetail(l)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:l.planned?"#FAFAF8":"#fff",borderRadius:10,borderLeft:"3px solid "+uc,border:l.planned?"1.5px dashed "+uc+"88":"1px solid "+uc+"22",borderLeftWidth:3,opacity:l.planned?0.85:1,cursor:"pointer"}}>
                            <div style={{width:28,height:28,borderRadius:7,background:at?.color+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><ActIcon type={l.type} size={15} color={at?.color}/></div>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span style={{fontSize:13,fontWeight:500}}>{at?.label}</span>
                                {l.feeling&&<span style={{fontSize:13}}>{FEELINGS.find(f=>f.v===l.feeling)?.e}</span>}
                              </div>
                              <div style={{fontSize:11,color:"#9C9589",marginTop:1}}>
                                {USERS[l.user]?.name}
                                {l.timeStart&&" · "+l.timeStart+(l.timeEnd?"→"+l.timeEnd:"")}
                                {l.duration&&!l.timeStart&&" · "+l.duration+"min"}
                                {l.planned&&" · planifié"}
                              </div>
                              {l.note&&<div style={{fontSize:10,color:"#B8B0A6",marginTop:1,fontStyle:"italic"}}>"{l.note}"</div>}
                            </div>
                          </div>
                        );
                      })}
                      {rw.map((r,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#F0FDF4",borderRadius:10,borderLeft:"3px solid #16A34A"}}>
                          <BookOpen size={15} color="#16A34A"/>
                          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:"#14532D"}}>{r.routineTitle}</div><div style={{fontSize:11,color:"#15803D"}}>{USERS[r.person]?.name} · {r.weekTitle}</div></div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        )}

        {/* ══ ACTIVITÉS ══ */}
        {view==="activities"&&(
          <div className="fi">
            {/* Header */}
            <div style={{fontFamily:"'DM Serif Display'",fontSize:19,color:"#1C1A17",marginBottom:12}}>
              Activités — {selectedBoth?"Duo":USERS[activeUser].name}
            </div>
            {/* Sous-onglets */}
            <div style={{display:"flex",gap:4,background:"#EDEBE6",borderRadius:10,padding:3,marginBottom:14}}>
              {[["plan","À planifier","#8B5CF6"],["done","Fait",uColor]].map(([k,l,c])=>(
                <button key={k} className="bp" onClick={()=>setActSubTab(k)} style={{flex:1,padding:"7px 4px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:500,background:actSubTab===k?"#fff":"transparent",color:actSubTab===k?c:"#9C9589",boxShadow:actSubTab===k?"0 1px 3px rgba(0,0,0,.08)":"none"}}>{l}</button>
              ))}
            </div>
            {/* Formulaire inline */}
            {(()=>{
              const isPlan = actSubTab==="plan";
              const acColor = selectedBoth?"#7C3AED":uColor;
              const planColor = isPlan?"#8B5CF6":uColor;
              const computeEnd=(start,dur)=>{if(!start||!dur)return"";const[h,m]=start.split(":").map(Number);const tot=h*60+m+parseInt(dur,10);return String(Math.floor(tot/60)%24).padStart(2,"0")+":"+String(tot%60).padStart(2,"0");};
              const DURATIONS=["30","45","60","90","120"];
              const lbl=(t,sub)=>(
                <div style={{marginBottom:6}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#6B6560",textTransform:"uppercase",letterSpacing:"0.04em"}}>{t}</div>
                  {sub&&<div style={{fontSize:10,color:"#B8B0A6",marginTop:1}}>{sub}</div>}
                </div>
              );
              return(
                <div style={{background:"#F7F5F2",borderRadius:14,padding:"14px",marginBottom:16}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1C1A17",marginBottom:12}}>{isPlan?"Planifier une activité":"Enregistrer une activité"}</div>

                  {/* Pour qui */}
                  {lbl("Pour qui")}
                  <div style={{display:"flex",gap:6,marginBottom:14}}>
                    {["paul","alexia"].map(u=>(
                      <button key={u} className="bp" onClick={()=>{setActiveUser(u);setSelectedBoth(false);}}
                        style={{flex:1,padding:"7px 4px",borderRadius:9,
                          border:activeUser===u&&!selectedBoth?"2px solid "+USERS[u].color:"2px solid #E5E1DA",
                          background:activeUser===u&&!selectedBoth?(u==="paul"?"#EEF3FF":"#FDF2F8"):"#fff",
                          cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,
                          fontWeight:activeUser===u&&!selectedBoth?600:400,
                          color:activeUser===u&&!selectedBoth?USERS[u].color:"#6B6560",
                          opacity:selectedBoth?0.4:1}}>
                        <User size={12} strokeWidth={1.8}/> {USERS[u].name}
                      </button>
                    ))}
                    <button className="bp" onClick={()=>setSelectedBoth(b=>!b)}
                      style={{flex:1,padding:"7px 4px",borderRadius:9,
                        border:selectedBoth?"2px solid #7C3AED":"2px solid #E5E1DA",
                        background:selectedBoth?"#F5F3FF":"#fff",
                        cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,
                        fontWeight:selectedBoth?600:400,
                        color:selectedBoth?"#7C3AED":"#6B6560"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}><Users size={12} strokeWidth={1.8}/>Duo</span>
                    </button>
                  </div>

                  {/* Type d'activité */}
                  {lbl("Type d'activité","Choisis le sport pratiqué")}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:14}}>
                    {ACT_TYPES.map(a=>(
                      <button key={a.id} className="bp" onClick={()=>setNewAct(p=>({...p,type:a.id}))} style={{padding:"6px 2px",borderRadius:9,border:newAct.type===a.id?"2px solid "+acColor:"2px solid #E5E1DA",background:newAct.type===a.id?acColor+"12":"#fff",cursor:"pointer",textAlign:"center",fontFamily:"'DM Sans'"}}>
                        <div style={{display:"flex",justifyContent:"center",marginBottom:1}}><ActIcon type={a.id} size={14} color={newAct.type===a.id?acColor:a.color}/></div>
                        <div style={{fontSize:8,color:newAct.type===a.id?acColor:"#6B6560",lineHeight:1.2}}>{a.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* Date */}
                  {lbl("Date",isPlan?"Quand prévois-tu de faire cette activité ?":"Quand as-tu fait cette activité ?")}
                  <input type="date" value={newAct.date} onChange={e=>setNewAct(p=>({...p,date:e.target.value}))} style={{...inp,marginBottom:14,padding:"7px 8px",fontSize:12}}/>

                  {/* Heure de début + fin */}
                  {lbl("Horaires","Optionnel — heure de début et/ou de fin")}
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <div style={{flex:1}}>
                      <input type="time" value={newAct.timeStart} onChange={e=>{const s=e.target.value;setNewAct(p=>({...p,timeStart:s,timeEnd:p.duration?computeEnd(s,p.duration):p.timeEnd}));}} style={{...inp,padding:"7px 8px",fontSize:12}}/>
                      <div style={{fontSize:10,color:"#B8B0A6",marginTop:3,textAlign:"center"}}>Début</div>
                    </div>
                    <div style={{flex:1}}>
                      <input type="time" value={newAct.timeEnd} onChange={e=>setNewAct(p=>({...p,timeEnd:e.target.value}))} style={{...inp,padding:"7px 8px",fontSize:12}}/>
                      <div style={{fontSize:10,color:"#B8B0A6",marginTop:3,textAlign:"center"}}>Fin</div>
                    </div>
                  </div>

                  {/* Durée */}
                  {lbl("Durée","Raccourcis — calcule automatiquement l'heure de fin")}
                  <div style={{display:"flex",gap:4,marginBottom:14}}>
                    {DURATIONS.map(d=>(
                      <button key={d} className="bp" onClick={()=>setNewAct(p=>({...p,duration:d,timeEnd:computeEnd(p.timeStart,d)}))} style={{flex:1,padding:"5px 2px",borderRadius:7,border:newAct.duration===d?"1.5px solid "+acColor:"1px solid #E5E1DA",background:newAct.duration===d?acColor+"12":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:10,color:newAct.duration===d?acColor:"#6B6560"}}>
                        {d<60?d+"min":d/60+"h"}
                      </button>
                    ))}
                  </div>



                  {/* Note */}
                  {lbl("Note","Optionnel — détails, objectifs, impressions...")}
                  <input value={newAct.note} onChange={e=>setNewAct(p=>({...p,note:e.target.value}))} placeholder={isPlan?"ex: Piscine du matin, 40 longueurs prévues":"ex: Bonne séance, on a bien sué !"} style={{...inp,marginBottom:12,padding:"7px 10px",fontSize:12}}/>

                  {/* Bouton */}
                  <button className="bp" onClick={()=>{
                    const act={...newAct,planned:isPlan};
                    if(selectedBoth){setLogs(p=>[...p,{id:Date.now(),user:"paul",...act},{id:Date.now()+1,user:"alexia",...act}]);}
                    else{setLogs(p=>[...p,{id:Date.now(),user:activeUser,...act}]);}
                    setNewAct({type:"marche",date:today(),note:"",timeStart:"",timeEnd:"",duration:"",feeling:null,planned:false});
                    setSelectedBoth(false);
                  }} style={{width:"100%",padding:"11px",borderRadius:11,border:"none",background:selectedBoth?"#7C3AED":acColor,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,fontWeight:600}}>
                    {selectedBoth
                      ? (isPlan?"Planifier ensemble 🤝":"Enregistrer ensemble 🤝")
                      : isPlan
                        ? "Planifier pour "+USERS[activeUser].name
                        : "Enregistrer"+(newAct.duration?" · "+newAct.duration+"min":"")}
                  </button>
                </div>
              );
            })()}
            {/* À planifier */}
            {actSubTab==="plan"&&(()=>{
              const list=logs.filter(l=>l.user===activeUser&&l.planned&&l.type!=="routine").sort((a,b)=>a.date<b.date?-1:1);
              if(list.length===0) return <div style={{textAlign:"center",color:"#B8B0A6",fontSize:13,padding:"20px 0",lineHeight:1.8}}>Aucune activité planifiée.</div>;
              return list.map(l=>{
                const at=ACT_TYPES.find(a=>a.id===l.type);
                return(
                  <div key={l.id} className="bp" onClick={()=>setActDetail(l)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:12,marginBottom:6,background:"#F9F8FF",border:"1.5px dashed #C4B5FD",cursor:"pointer"}}>
                    <div style={{width:34,height:34,borderRadius:9,background:at?.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ActIcon type={l.type} size={17} color={at?.color}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:13,fontWeight:600,color:"#5B21B6"}}>{at?.label}</span></div>
                      <div style={{fontSize:11,color:"#9C9589",marginTop:1}}>{fmtDate(l.date,{weekday:"short",day:"numeric",month:"short"})}{l.timeStart&&" · "+l.timeStart}{l.duration&&" · "+l.duration+"min"}</div>
                      {l.note&&<div style={{fontSize:10,color:"#B8B0A6",fontStyle:"italic",marginTop:1}}>{l.note}</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                      <button className="bp" onClick={()=>setLogs(p=>p.map(x=>x.id===l.id?{...x,planned:false}:x))} style={{fontSize:11,padding:"5px 9px",borderRadius:8,border:"none",background:uColor,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontWeight:600}}>✓ Fait</button>
                      <button onClick={()=>setLogs(p=>p.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#C4BEB7",padding:2}}>✕</button>
                    </div>
                  </div>
                );
              });
            })()}
            {/* Fait */}
            {actSubTab==="done"&&(()=>{
              const list=logs.filter(l=>l.user===activeUser&&!l.planned&&l.type!=="routine").reverse();
              if(list.length===0) return <div style={{textAlign:"center",color:"#B8B0A6",fontSize:13,padding:"20px 0",lineHeight:1.8}}>Aucune activité enregistrée.</div>;
              return list.map(l=>{
                const at=ACT_TYPES.find(a=>a.id===l.type);
                return(
                  <div key={l.id} className="bp" onClick={()=>setActDetail(l)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px",borderRadius:12,marginBottom:4,background:"#fff",cursor:"pointer"}}>
                    <div style={{width:32,height:32,borderRadius:8,background:at?.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ActIcon type={l.type} size={16} color={at?.color}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13,fontWeight:500}}>{at?.label}</span>{l.feeling&&<span style={{fontSize:13}}>{FEELINGS.find(f=>f.v===l.feeling)?.e}</span>}</div>
                      <div style={{fontSize:11,color:"#9C9589",marginTop:2,display:"flex",alignItems:"center",gap:5,overflow:"hidden"}}>
                        <span style={{flexShrink:0}}>{fmtDate(l.date)}{l.timeStart&&" · "+l.timeStart+(l.timeEnd?"→"+l.timeEnd:"")}{l.duration&&!l.timeStart&&" · "+l.duration+"min"}</span>
                        {l.note&&<span style={{color:"#B8B0A6",fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>· {l.note}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                      <div style={{fontSize:12,fontWeight:600,color:uColor}}>+{calcXP(l)}XP</div>
                      <button onClick={()=>setLogs(p=>p.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#C4BEB7",padding:2}}>✕</button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ══ JOURNAL ══ */}
        {view==="journal"&&(
          <div className="fi">
            <div style={{fontFamily:"'DM Serif Display'",fontSize:19,color:"#1C1A17",marginBottom:12}}>Journal — {USERS[activeUser].name}</div>
            {/* 4 sous-onglets en 2 lignes */}
            {(()=>{
              const cntSportDone=logs.filter(l=>l.user===activeUser&&!l.planned&&l.type!=="routine").length;
              const cntSportPlan=logs.filter(l=>l.user===activeUser&&l.planned&&l.type!=="routine").length;
              const cntRtDone=logs.filter(l=>l.user===activeUser&&!l.planned&&l.type==="routine").length;
              let cntRtPlan=0;
              (routines[activeUser]||[]).forEach(rt=>rt.weeks.forEach(w=>{
                if(!w.startDate) return;
                if(today()>=w.startDate&&today()<=addDays(w.startDate,6)){
                  if(!logs.some(l=>l.user===activeUser&&l.type==="routine"&&l.note===rt.id+"_"+w.id+"_"+today()&&!l.planned)) cntRtPlan++;
                }
              }));
              const tabs=[
                ["sportDone","Activité faite",uColor,cntSportDone],
                ["sportPlan","Activité prévue","#8B5CF6",cntSportPlan],
                ["rtDone","Routine faite","#16A34A",cntRtDone],
                ["rtPlan","Routine prévue","#D97706",cntRtPlan],
              ];
              return(
                <div style={{marginBottom:14}}>
                  <div style={{display:"flex",gap:3,background:"#EDEBE6",borderRadius:"10px 10px 0 0",padding:"3px 3px 2px"}}>
                    {tabs.slice(0,2).map(([k,l,c,n])=>(
                      <button key={k} className="bp" onClick={()=>setJournalTab(k)} style={{flex:1,padding:"7px 4px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:500,background:journalTab===k?"#fff":"transparent",color:journalTab===k?c:"#9C9589",boxShadow:journalTab===k?"0 1px 3px rgba(0,0,0,.08)":"none"}}>
                        {l} <span style={{opacity:0.6}}>({n})</span>
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:3,background:"#EDEBE6",borderRadius:"0 0 10px 10px",padding:"2px 3px 3px"}}>
                    {tabs.slice(2).map(([k,l,c,n])=>(
                      <button key={k} className="bp" onClick={()=>setJournalTab(k)} style={{flex:1,padding:"7px 4px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:500,background:journalTab===k?"#fff":"transparent",color:journalTab===k?c:"#9C9589",boxShadow:journalTab===k?"0 1px 3px rgba(0,0,0,.08)":"none"}}>
                        {l} <span style={{opacity:0.6}}>({n})</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Activité faite */}
            {journalTab==="sportDone"&&(()=>{
              const list=logs.filter(l=>l.user===activeUser&&!l.planned&&l.type!=="routine").sort((a,b)=>b.date<a.date?-1:1);
              if(!list.length) return <div style={{textAlign:"center",color:"#B8B0A6",fontSize:13,padding:"30px 0"}}>Aucune activité réalisée.</div>;
              return list.map(l=>{
                const at=ACT_TYPES.find(a=>a.id===l.type);
                return(
                  <div key={l.id} className="bp" onClick={()=>setActDetail(l)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,marginBottom:5,background:"#fff",border:"1px solid #F0EDE8",cursor:"pointer"}}>
                    <div style={{width:32,height:32,borderRadius:8,background:at?.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ActIcon type={l.type} size={16} color={at?.color}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:13,fontWeight:500}}>{at?.label}</span>{l.feeling&&<span style={{fontSize:13}}>{FEELINGS.find(f=>f.v===l.feeling)?.e}</span>}</div>
                      <div style={{fontSize:11,color:"#9C9589",marginTop:1}}>{fmtDate(l.date,{weekday:"short",day:"numeric",month:"short"})}{l.timeStart&&" · "+l.timeStart+(l.timeEnd?"→"+l.timeEnd:"")}{l.duration&&!l.timeStart&&" · "+l.duration+"min"}</div>
                      {l.note&&<div style={{fontSize:10,color:"#B8B0A6",fontStyle:"italic",marginTop:1}}>"{l.note}"</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:uColor}}>+{calcXP(l)}XP</div>
                      <button onClick={e=>{e.stopPropagation();setLogs(p=>p.map(x=>x.id===l.id?{...x,planned:true}:x));}} style={{fontSize:10,padding:"2px 7px",borderRadius:7,border:"1px solid #E5E1DA",background:"#fff",color:"#9C9589",cursor:"pointer",fontFamily:"'DM Sans'"}}>Annuler</button>
                    </div>
                  </div>
                );
              });
            })()}

            {/* Activité prévue */}
            {journalTab==="sportPlan"&&(()=>{
              const list=logs.filter(l=>l.user===activeUser&&l.planned&&l.type!=="routine").sort((a,b)=>a.date<b.date?-1:1);
              if(!list.length) return <div style={{textAlign:"center",color:"#B8B0A6",fontSize:13,padding:"30px 0"}}>Aucune activité planifiée.</div>;
              return list.map(l=>{
                const at=ACT_TYPES.find(a=>a.id===l.type);
                return(
                  <div key={l.id} className="bp" onClick={()=>setActDetail(l)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,marginBottom:5,background:"#F9F8FF",border:"1.5px dashed #C4B5FD",cursor:"pointer"}}>
                    <div style={{width:32,height:32,borderRadius:8,background:at?.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ActIcon type={l.type} size={16} color={at?.color}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:13,fontWeight:600,color:"#5B21B6"}}>{at?.label}</span></div>
                      <div style={{fontSize:11,color:"#9C9589",marginTop:1}}>{fmtDate(l.date,{weekday:"short",day:"numeric",month:"short"})}{l.timeStart&&" · "+l.timeStart}{l.duration&&" · "+l.duration+"min"}</div>
                    </div>
                    <button className="bp" onClick={e=>{e.stopPropagation();setLogs(p=>p.map(x=>x.id===l.id?{...x,planned:false}:x));}} style={{fontSize:11,padding:"5px 9px",borderRadius:8,border:"none",background:uColor,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontWeight:600,flexShrink:0}}>✓ Fait</button>
                  </div>
                );
              });
            })()}

            {/* Routine faite */}
            {journalTab==="rtDone"&&(()=>{
              const list=logs.filter(l=>l.user===activeUser&&!l.planned&&l.type==="routine").sort((a,b)=>b.date<a.date?-1:1);
              if(!list.length) return <div style={{textAlign:"center",color:"#B8B0A6",fontSize:13,padding:"30px 0"}}>Aucune séance de routine complétée.</div>;
              return list.map(l=>{
                let rtTitle="Routine", wTitle="";
                (routines[activeUser]||[]).forEach(r=>{r.weeks.forEach(w=>{if(l.note===r.id+"_"+w.id+"_"+l.date){rtTitle=r.title;wTitle=w.title;}});});
                return(
                  <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,marginBottom:5,background:"#F0FDF4",border:"1px solid #BBF7D0"}}>
                    <div style={{width:32,height:32,borderRadius:8,background:"#DCFCE7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CheckCircle2 size={16} color="#16A34A" strokeWidth={2}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:500,color:"#14532D"}}>{rtTitle}</div>
                      <div style={{fontSize:11,color:"#15803D"}}>{wTitle&&wTitle+" · "}{fmtDate(l.date,{weekday:"short",day:"numeric",month:"short"})}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#16A34A"}}>+{(()=>{let sec=[];(routines[activeUser]||[]).forEach(r=>r.weeks.forEach(w=>{if(l.note===r.id+"_"+w.id+"_"+l.date){const d=w.days[0];if(d)sec=d.sections;}}));return calcRoutineXP(sec);})()}XP</div>
                      <button onClick={()=>setLogs(p=>p.filter(x=>x.id!==l.id))} style={{fontSize:10,padding:"2px 7px",borderRadius:7,border:"1px solid #E5E1DA",background:"#fff",color:"#9C9589",cursor:"pointer",fontFamily:"'DM Sans'"}}>Annuler</button>
                    </div>
                  </div>
                );
              });
            })()}

            {/* Routine prévue */}
            {journalTab==="rtPlan"&&(()=>{
              const t2=today();
              const items=[];
              (routines[activeUser]||[]).forEach(rt=>rt.weeks.forEach((w,wi)=>{
                if(!w.startDate) return;
                if(t2>=w.startDate&&t2<=addDays(w.startDate,6)){
                  const done=logs.some(l=>l.user===activeUser&&l.type==="routine"&&l.note===rt.id+"_"+w.id+"_"+t2&&!l.planned);
                  items.push({rt,w,wi,done});
                }
              }));
              if(!items.length) return <div style={{textAlign:"center",color:"#B8B0A6",fontSize:13,padding:"30px 0"}}>Aucune séance de routine prévue aujourd'hui.</div>;
              return items.map(({rt,w,wi,done})=>{
                const mark=()=>setLogs(p=>[...p,{id:Date.now(),user:activeUser,type:"routine",date:t2,note:rt.id+"_"+w.id+"_"+t2,planned:false,timeStart:"",timeEnd:""}]);
                const unmark=()=>setLogs(p=>p.filter(l=>!(l.user===activeUser&&l.type==="routine"&&l.note===rt.id+"_"+w.id+"_"+t2)));
                return(
                  <div key={rt.id+"_"+w.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:done?"#F0FDF4":"#FFFBEB",borderRadius:12,border:done?"1px solid #BBF7D0":"1px solid #FCD34D",marginBottom:6}}>
                    <div style={{width:28,height:28,borderRadius:7,background:done?"#D1FAE5":"#FEF3C7",display:"flex",alignItems:"center",justifyContent:"center"}}>{done?<CheckCircle2 size={15} color="#16A34A" strokeWidth={2}/>:<BookOpen size={15} color="#D97706" strokeWidth={1.8}/>}</div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:done?"#14532D":"#1C1A17"}}>{rt.title}</div><div style={{fontSize:11,color:done?"#15803D":"#9C9589"}}>{w.title} · S{wi+1}</div></div>
                    {done
                      ?<button className="bp" onClick={unmark} style={{fontSize:10,padding:"3px 7px",borderRadius:7,border:"1px solid #BBF7D0",background:"#fff",color:"#16A34A",cursor:"pointer",fontFamily:"'DM Sans'"}}>Annuler</button>
                      :<button className="bp" onClick={mark} style={{fontSize:11,padding:"5px 10px",borderRadius:8,border:"none",background:"#16A34A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontWeight:600}}>✓ Fait !</button>
                    }
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ══ ROUTINE ══ */}
        {view==="routine"&&(
          <div className="fi">
            <div style={{display:"flex",gap:4,marginBottom:14,background:"#EDEBE6",borderRadius:12,padding:3}}>
              {[["programs","Mes programmes"],["generate","✨ Générer"]].map(([k,l])=>(
                <button key={k} className="bp" onClick={()=>{setRoutineSubTab(k);setActiveRid(null);setEditMode(false);}} style={{flex:1,padding:"7px 4px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:500,background:routineSubTab===k?"#fff":"transparent",color:routineSubTab===k?"#1C1A17":"#9C9589",boxShadow:routineSubTab===k?"0 1px 3px rgba(0,0,0,.08)":"none"}}>{l}</button>
              ))}
            </div>
            {routineSubTab==="programs"&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",gap:4,flex:1,marginRight:8,background:"#EDEBE6",borderRadius:10,padding:3}}>
                    {["paul","alexia"].map(u=>(
                      <button key={u} className="bp" onClick={()=>{setActiveUser(u);setActiveRid(null);setEditMode(false);}} style={{flex:1,padding:"6px 4px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:500,background:activeUser===u?"#fff":"transparent",color:activeUser===u?USERS[u].color:"#9C9589",boxShadow:activeUser===u?"0 1px 3px rgba(0,0,0,.08)":"none"}}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:4}}><User size={12} strokeWidth={2}/>{USERS[u].name}</span>
                      </button>
                    ))}
                  </div>
                  {activeRid&&(
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      {!editMode&&<button className="bp" onClick={()=>{setScheduleRid(activeRid);setScheduleStart(today());setShowScheduleModal(true);}} style={{padding:"6px 10px",borderRadius:10,border:"1.5px solid #8B5CF6",background:"#F5F3FF",color:"#6D28D9",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:600}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><Calendar size={11}/>Planifier</span></button>}
                      <button className="bp" onClick={()=>setEditMode(e=>!e)} style={{padding:"6px 10px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:600,background:editMode?"#1C1A17":"#EDEBE6",color:editMode?"#fff":"#6B6560"}}><span style={{display:"inline-flex",alignItems:"center",gap:3}}>{editMode?<><Check size={11}/>Terminer</>:<><Pencil size={11}/>Modifier</>}</span></button>
                    </div>
                  )}
                </div>
                {activeRid?<ProgramDetail person={activeUser} routine={(routines[activeUser]||[]).find(r=>r.id===activeRid)} ap={ap}/>:<ProgramList person={activeUser} ap={ap}/>}
              </>
            )}
            {routineSubTab==="generate"&&(
              <div>
                {/* Header */}
                <div style={{marginBottom:20}}>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:19,color:"#1C1A17",marginBottom:4}}>Créer un programme avec l'IA</div>
                  <div style={{fontSize:13,color:"#9C9589",lineHeight:1.6}}>Remplis le formulaire, copie le prompt, colle-le dans ChatGPT ou Gemini, puis reviens importer le résultat.</div>
                </div>

                {/* Étape 1 */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"#1C1A17",color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>1</div>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:15,color:"#1C1A17"}}>Décris ton programme</div>
                </div>

                {/* Objectif */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>Objectif</label>
                  <input value={pgGoal} onChange={e=>setPgGoal(e.target.value)} placeholder="ex: Rééduquer mon mollet droit après claquage" style={inp}/>
                  <div style={{fontSize:11,color:"#B8B0A6",marginTop:4}}>Sois précis — l'IA s'adapte à ta situation.</div>
                </div>

                {/* Durée + Séance */}
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <div style={{flex:1}}>
                    <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>Durée</label>
                    <select value={pgWeeks} onChange={e=>setPgWeeks(e.target.value)} style={{...inp,padding:"9px 10px"}}>
                      {[1,2,3,4,6,8,10,12,16,20,24].map(w=><option key={w} value={w}>{w} semaine{w>1?"s":""}</option>)}
                    </select>
                    <div style={{fontSize:10,color:"#B8B0A6",marginTop:3}}>semaines</div>
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>Durée des séances</label>
                    <select value={pgDur} onChange={e=>setPgDur(e.target.value)} style={{...inp,padding:"9px 10px"}}>
                      {[15,20,30,45,60,75,90,120].map(d=><option key={d} value={d}>{d} min</option>)}
                    </select>
                    <div style={{fontSize:10,color:"#B8B0A6",marginTop:3}}>minutes</div>
                  </div>
                </div>

                {/* Type de programme */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Type de programme</label>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {[
                      ["Renforcement","Musculation, gainé, prise de masse — construire et tonifier les muscles"],
                      ["Remise en forme","Programme équilibré pour retrouver une bonne condition physique générale"],
                      ["Endurance","Cardio progressif pour améliorer le souffle et l'effort sur la durée"],
                      ["Mobilité & souplesse","Étirements actifs et passifs pour gagner en amplitude et fluidité"],
                      ["HIIT","Intervalles courts très intenses (20-45s) alternés avec des récupérations — brûle graisses et cardio"],
                      ["Rééducation","Exercices doux et ciblés pour récupérer d'une blessure ou douleur chronique"],
                      ["Yoga & bien-être","Postures, respiration et relaxation pour le corps et l'esprit"],
                      ["Préparation sportive","Entraînement spécifique pour améliorer les performances dans un sport donné"],
                    ].map(([o,desc])=>(
                      <button key={o} className="bp" onClick={()=>setPgType(o.toLowerCase())}
                        style={{padding:"8px 12px",borderRadius:10,border:pgType===o.toLowerCase()?"1.5px solid #1C1A17":"1.5px solid #E5E1DA",background:pgType===o.toLowerCase()?"#1C1A17":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",textAlign:"left",display:"flex",flexDirection:"column",gap:2}}>
                        <span style={{fontSize:12,fontWeight:600,color:pgType===o.toLowerCase()?"#fff":"#1C1A17"}}>{o}</span>
                        <span style={{fontSize:10,color:pgType===o.toLowerCase()?"#D1D5DB":"#9C9589"}}>{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Niveau */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Niveau</label>
                  <div style={{display:"flex",gap:6}}>
                    {["Débutant","Intermédiaire","Avancé"].map(o=>(
                      <button key={o} className="bp" onClick={()=>setPgLevel(o.toLowerCase())}
                        style={{flex:1,padding:"7px 4px",borderRadius:9,border:pgLevel===o.toLowerCase()?"1.5px solid #1C1A17":"1.5px solid #E5E1DA",background:pgLevel===o.toLowerCase()?"#1C1A17":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:pgLevel===o.toLowerCase()?600:400,color:pgLevel===o.toLowerCase()?"#fff":"#6B6560",textAlign:"center"}}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jours actifs */}
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Jours d'entraînement</label>
                  <div style={{fontSize:11,color:"#B8B0A6",marginBottom:8}}>Coche les jours avec exercices — les autres seront des jours de repos.</div>
                  <div style={{display:"flex",gap:4}}>
                    {[["L",0],["M",1],["M",2],["J",3],["V",4],["S",5],["D",6]].map(([label,di])=>{
                      const active=pgActiveDays.includes(di);
                      return(
                        <button key={di} className="bp" onClick={()=>setPgActiveDays(p=>active?p.filter(x=>x!==di):[...p,di].sort())}
                          style={{flex:1,padding:"8px 2px",borderRadius:9,border:active?"2px solid #1C1A17":"2px solid #E5E1DA",background:active?"#1C1A17":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:600,color:active?"#fff":"#9C9589",textAlign:"center"}}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{fontSize:10,color:"#9C9589",marginTop:6}}>
                    {pgActiveDays.length} jour{pgActiveDays.length!==1?"s":""} actif{pgActiveDays.length!==1?"s":""} · {7-pgActiveDays.length} jour{7-pgActiveDays.length!==1?"s":""} de repos
                  </div>
                </div>

                {/* Lieu */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Lieu d'entraînement</label>
                  <div style={{display:"flex",gap:6}}>
                    {[["domicile","🏠 Domicile"],["salle","🏋️ Salle de sport"],["extérieur","🌳 Extérieur"]].map(([v,l])=>(
                      <button key={v} className="bp" onClick={()=>setPgLieu(v)}
                        style={{flex:1,padding:"8px 4px",borderRadius:9,border:pgLieu===v?"2px solid #1C1A17":"2px solid #E5E1DA",background:pgLieu===v?"#1C1A17":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:pgLieu===v?600:400,color:pgLieu===v?"#fff":"#6B6560",textAlign:"center"}}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Équipement */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>Équipement disponible <span style={{fontWeight:400,textTransform:"none",fontSize:10}}>(optionnel)</span></label>
                  <div style={{fontSize:11,color:"#B8B0A6",marginBottom:8}}>Sélectionne ce dont tu disposes.</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {["Poids libres","Barres","Élastiques","TRX","Kettlebell","Tapis","Chaise","Mur","Vélo","Tapis de course","Aucun matériel"].map(eq=>{
                      const on=pgEquip.includes(eq);
                      return(
                        <button key={eq} className="bp" onClick={()=>setPgEquip(p=>on?p.filter(x=>x!==eq):[...p,eq])}
                          style={{padding:"5px 10px",borderRadius:20,border:on?"1.5px solid #1C1A17":"1.5px solid #E5E1DA",background:on?"#1C1A17":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:on?600:400,color:on?"#fff":"#6B6560"}}>
                          {eq}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profil physique */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>Profil & contexte</label>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                    {["Sédentaire qui reprend","Sportif régulier","Sportif qui reprend après blessure","Athlète","Jamais fait de sport","En surpoids","Post-partum"].map(p=>(
                      <button key={p} className="bp" onClick={()=>setPgProfile(pp=>pp===p?"":p)}
                        style={{padding:"5px 10px",borderRadius:20,border:pgProfile===p?"1.5px solid #1C1A17":"1.5px solid #E5E1DA",background:pgProfile===p?"#1C1A17":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:pgProfile===p?600:400,color:pgProfile===p?"#fff":"#6B6560"}}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format préféré */}
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>Format de séance <span style={{fontWeight:400,textTransform:"none",fontSize:10}}>(optionnel)</span></label>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {[
                      ["Exercices isolés","Un exercice à la fois, avec repos entre chaque"],
                      ["Circuit training","Plusieurs exercices enchaînés en boucle, sans pause"],
                      ["EMOM","Chaque minute : X reps dès le départ, repos le reste de la minute"],
                      ["AMRAP","Le max de tours possible d'un circuit en un temps donné"],
                      ["Tabata","20 sec d'effort intense, 10 sec de repos — 8 fois de suite"],
                      ["Libre","L'IA choisit le format adapté à l'objectif"],
                    ].map(([f,desc])=>(
                      <button key={f} className="bp" onClick={()=>setPgFormat(ff=>ff===f?"":f)}
                        style={{padding:"8px 12px",borderRadius:10,border:pgFormat===f?"1.5px solid #1C1A17":"1.5px solid #E5E1DA",background:pgFormat===f?"#1C1A17":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",textAlign:"left",display:"flex",flexDirection:"column",gap:2}}>
                        <span style={{fontSize:12,fontWeight:600,color:pgFormat===f?"#fff":"#1C1A17"}}>{f}</span>
                        <span style={{fontSize:10,color:pgFormat===f?"#D1D5DB":"#9C9589"}}>{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contraintes */}
                <div style={{marginBottom:20}}>
                  <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>Contraintes / blessures <span style={{fontWeight:400,textTransform:"none",fontSize:10}}>(optionnel)</span></label>
                  <input value={pgConstraint} onChange={e=>setPgConstraint(e.target.value)} placeholder="ex: Douleur genou gauche, éviter les sauts" style={inp}/>
                </div>

                {/* Étape 2 : Copier */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"#1C1A17",color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>2</div>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:15,color:"#1C1A17"}}>Copie le prompt et colle-le dans l'IA</div>
                </div>
                <div style={{fontSize:12,color:"#9C9589",marginBottom:10,lineHeight:1.6}}>Ouvre <strong style={{color:"#1C1A17"}}>ChatGPT</strong> ou <strong style={{color:"#1C1A17"}}>Gemini</strong>, colle le prompt et envoie. L'IA te répondra avec un JSON à copier.</div>
                <button className="bp" onClick={()=>{
                  // Jours actifs/repos depuis la sélection directe
                  const dayNames=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
                  const activeIndices=[...pgActiveDays].sort();
                  const restIndices=[0,1,2,3,4,5,6].filter(i=>!activeIndices.includes(i));
                  const activeStr=activeIndices.join(", ");
                  const restStr=restIndices.length>0?"dayIndex "+restIndices.join(", ")+" ("+restIndices.map(i=>dayNames[i]).join(", ")+")":"aucun";
                  // Jour de démarrage réel
                  const startDi=(new Date().getDay()+6)%7;
                  const startDayName=dayNames[startDi];
                  const fmt='{"title":"Titre du programme","subtitle":"Résumé court","weeks":[{"title":"Semaine 1 - Titre","goal":"Objectif de la semaine","days":[{"dayIndex":0,"sections":[{"icon":"💪","label":"Nom de la section","warning":"Point de vigilance si besoin, sinon vide","items":["Nom exercice — Position de départ. Mouvement : description courte. X séries x Y reps ou Z sec. Conseil : astuce clé."]}]},{"dayIndex":1,"sections":[...]},{"dayIndex":2,"sections":[...]},{"dayIndex":3,"sections":[...]},{"dayIndex":4,"sections":[...]},{"dayIndex":5,"sections":[]},{"dayIndex":6,"sections":[]}]}]}';
                  const p="Tu es coach sportif et kinésithérapeute expert. Génère un programme de "+pgType+" pour niveau "+pgLevel+"."
                  +" Objectif : "+(pgGoal||"condition générale")+". Durée : "+pgWeeks+" semaines, "+pgDur+" min/séance."
                  +(pgProfile?" Profil : "+pgProfile+".":"")+" Lieu : "+pgLieu+"."+(pgEquip.length>0?" Équipement disponible : "+pgEquip.join(", ")+".":"")+(pgFormat?" Format de séance préféré : "+pgFormat+".":" ")+(pgConstraint?" Contraintes/blessures : "+pgConstraint+".":" ")
                  +" JOURS ACTIFS (avec exercices) : dayIndex "+activeStr+" — OBLIGATOIRE d'avoir des sections non vides pour ces jours."
                  +" JOURS DE REPOS (sections OBLIGATOIREMENT vides []) : "+restStr+" — ces jours doivent avoir sections:[] sans exception."
                  +" JOUR DE DÉMARRAGE : le programme commence un "+startDayName+" (dayIndex "+startDi+"). La semaine 1 doit donc démarrer par ce jour — adapte le contenu en conséquence (pas de récap ou synthèse en premier jour)."
                  +" Rappel dayIndex : 0=Lundi, 1=Mardi, 2=Mercredi, 3=Jeudi, 4=Vendredi, 5=Samedi, 6=Dimanche."
                  +" RÈGLES :"
                  +" 1) Chaque item d'exercice DOIT contenir : le nom, la position de départ (debout/allongé/assis...), le mouvement en une phrase simple, le volume (séries x reps OU durée), et un conseil ou erreur à éviter."
                  +" Exemple : 'Squat classique — Debout, pieds largeur épaules, orteils légèrement ouverts. Descends jusqu'aux cuisses parallèles au sol en poussant les genoux vers l'extérieur, remonte en contractant les fessiers. 3 x 12 reps. Conseil : poids sur les talons, dos droit.'"
                  +" 2) warning = mise en garde courte et utile (erreur fréquente, douleur à surveiller), ou chaîne vide."
                  +" 3) Progression logique semaine après semaine."
                  +" 4) Format JSON UNIQUEMENT, sans markdown, sans texte autour."
                  +" Format : "+fmt+". Génère les "+pgWeeks+" semaines complètes.";
                  navigator.clipboard.writeText(p).then(()=>{setPgCopied(true);setTimeout(()=>setPgCopied(false),2000);});
                }} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:pgCopied?"#16A34A":"#1C1A17",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,fontWeight:600,marginBottom:24,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {pgCopied?<><CheckCircle2 size={16}/>Prompt copié !</>:<><BookOpen size={16}/>Copier le prompt</>}
                </button>

                {/* Étape 3 : Importer */}
                <div style={{borderTop:"2px dashed #E5E1DA",paddingTop:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:"#7C3AED",color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>3</div>
                    <div style={{fontFamily:"'DM Serif Display'",fontSize:15,color:"#1C1A17"}}>Importe la réponse de l'IA</div>
                  </div>
                  <div style={{fontSize:12,color:"#9C9589",marginBottom:12,lineHeight:1.6}}>L'IA t'a renvoyé un bloc de texte ? Copie-le entièrement et colle-le ci-dessous — l'app s'occupe du reste.</div>

                  <div style={{marginBottom:10}}>
                    <label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>Créer le programme pour</label>
                    <div style={{display:"flex",gap:8}}>
                      {["paul","alexia"].map(u=>(
                        <button key={u} className="bp" onClick={()=>setPgTarget(u)} style={{flex:1,padding:8,borderRadius:10,border:pgTarget===u?"2px solid "+USERS[u].color:"2px solid #E5E1DA",background:pgTarget===u?(u==="paul"?"#EEF3FF":"#FDF2F8"):"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,color:pgTarget===u?USERS[u].color:"#6B6560"}}>
                          <span style={{display:"inline-flex",alignItems:"center",gap:4}}><User size={13}/>{USERS[u].name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea value={pgJson} onChange={e=>setPgJson(e.target.value)} placeholder={"Colle ici la réponse complète de l'IA\n(peu importe si elle contient du texte autour du JSON)"} rows={5} style={{...inp,fontFamily:"monospace",fontSize:11,lineHeight:1.5,resize:"vertical"}}/>
                  {pgStatus&&<div style={{marginTop:6,padding:"8px 12px",borderRadius:8,background:pgStatus==="success"?"#F0FDF4":"#FEF2F2",fontSize:12,color:pgStatus==="success"?"#14532D":"#DC2626",lineHeight:1.5}}>{pgStatus==="success"?"✓ ":""}{pgMsg}</div>}
                  <button className="bp" onClick={()=>{
                    setPgStatus(null);
                    try{
                      const raw=pgJson.trim();
                      const s=raw.indexOf("{"), e=raw.lastIndexOf("}");
                      const data=JSON.parse(s>=0?raw.slice(s,e+1):raw);
                      if(!data.title||!Array.isArray(data.weeks)) throw new Error("Format invalide : 'title' et 'weeks' requis");
                      const newWeeks=data.weeks.map((w,wi)=>({id:genId(),title:w.title||("Semaine "+(wi+1)),goal:w.goal||"",startDate:null,
                        days:Array.from({length:7},(_,di)=>{
                          const dd=(w.days||[]).find(d=>d.dayIndex===di)||{sections:[]};
                          return{id:genId(),dayIndex:di,sections:(dd.sections||[]).map(sec=>({id:genId(),icon:sec.icon||"📌",label:sec.label||"Section",warning:sec.warning||"",items:Array.isArray(sec.items)?sec.items:[]}))};
                        })}));
                      setPersonR(pgTarget,list=>[...(list||[]),{id:genId(),title:data.title,subtitle:data.subtitle||"",weeks:newWeeks}]);
                      setPgStatus("success"); setPgMsg("Programme importé ! "+newWeeks.length+" semaine"+(newWeeks.length>1?"s":""));
                      setPgJson(""); setTimeout(()=>{setRoutineSubTab("programs");setActiveUser(pgTarget);},1000);
                    }catch(err){setPgStatus("error");setPgMsg("Erreur : "+err.message);}
                  }} style={{width:"100%",marginTop:10,padding:12,borderRadius:12,border:"none",background:"#7C3AED",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <Sparkles size={15}/>Importer le programme
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ EXERCICES ══ */}
        {view==="exercises"&&(
          <div className="fi">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div><div style={{fontFamily:"'DM Serif Display'",fontSize:19,color:"#1C1A17"}}>Exercices</div><div style={{fontSize:12,color:"#9C9589"}}>Groupes musculaires</div></div>
              <div style={{display:"flex",gap:6}}>
                <button className="bp" onClick={()=>setShowAddEx(true)} style={{padding:"7px 12px",borderRadius:10,border:"none",background:"#1C1A17",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:600}}>+ Ajouter</button>
                <button className="bp" onClick={()=>setExEditMode(e=>!e)} style={{padding:"7px 12px",borderRadius:10,border:"none",background:exEditMode?"#DC2626":"#EDEBE6",color:exEditMode?"#fff":"#6B6560",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:600}}>{exEditMode?"✓ Terminer":"✏️ Modifier"}</button>
              </div>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:14,background:"#EDEBE6",borderRadius:12,padding:3}}>
              {[["warmup","Échauffement"],["stretch","Étirements"]].map(([k,l])=>(
                <button key={k} className="bp" onClick={()=>{setExTab(k);setOpenEx(null);}} style={{flex:1,padding:"7px 4px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,fontWeight:500,background:exTab===k?"#fff":"transparent",color:exTab===k?(k==="warmup"?"#D97706":"#7C3AED"):"#9C9589",boxShadow:exTab===k?"0 1px 3px rgba(0,0,0,.08)":"none"}}>{l}</button>
              ))}
            </div>
            {(()=>{
              const groups=exTab==="warmup"
                ?[...WARMUP.map(g=>({...g,exercises:g.exercises.filter(e=>!deletedEx.includes(e.id))})).filter(g=>g.exercises.length>0), ...(customWarmup.length>0?[{id:"cwg",label:"Mes exercices",color:"#F59E0B",exercises:customWarmup}]:[])]
                ?.[Symbol.iterator]&&[...WARMUP.map(g=>({...g,exercises:g.exercises.filter(e=>!deletedEx.includes(e.id))})).filter(g=>g.exercises.length>0), ...(customWarmup.length>0?[{id:"cwg",label:"Mes exercices",color:"#F59E0B",exercises:customWarmup}]:[])]
                :[...STRETCH, ...(customStretch.length>0?[{id:"csg",label:"Mes étirements",color:"#F59E0B",exercises:customStretch}]:[])];
              const realGroups=exTab==="warmup"
                ?[...WARMUP.map(g=>({...g,exercises:g.exercises.filter(e=>!deletedEx.includes(e.id))})).filter(g=>g.exercises.length>0), ...(customWarmup.length>0?[{id:"cwg",label:"Mes exercices",color:"#F59E0B",exercises:customWarmup}]:[])]
                :[...STRETCH, ...(customStretch.length>0?[{id:"csg",label:"Mes étirements",color:"#F59E0B",exercises:customStretch}]:[])];
              return realGroups.map(g=>(
                <div key={g.id} style={{marginBottom:8}}>
                  <button className="bp" onClick={()=>setOpenEx(openEx===g.id?null:g.id)} style={{width:"100%",background:"#fff",border:"1px solid "+(openEx===g.id?g.color:"#E5E1DA"),borderRadius:openEx===g.id?"12px 12px 0 0":"12px",padding:"12px 14px",cursor:"pointer",fontFamily:"'DM Sans'",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:9,background:g.color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><Dumbbell size={16} color={g.color} strokeWidth={1.8}/></div>
                      <div><div style={{fontSize:14,fontWeight:600,color:"#1C1A17"}}>{g.label}</div><div style={{fontSize:11,color:"#9C9589"}}>{g.exercises.length} exercice{g.exercises.length!==1?"s":""}</div></div>
                    </div>
                    <ChevronRight size={16} color="#9C9589" style={{transform:openEx===g.id?"rotate(90deg)":"none",transition:"transform .2s"}}/>
                  </button>
                  {openEx===g.id&&(
                    <div style={{background:"#FAFAF9",border:"1px solid "+g.color,borderTop:"none",borderRadius:"0 0 12px 12px",padding:12}}>
                      {g.exercises.map(ex=>(
                        <ExCard key={ex.id} ex={ex} groupColor={g.color} exTab={exTab} exEditMode={exEditMode}
                          onDelete={()=>{if(ex.custom){if(exTab==="warmup")setCustomWarmup(p=>p.filter(e=>e.id!==ex.id));else setCustomStretch(p=>p.filter(e=>e.id!==ex.id));}else setDeletedEx(p=>[...p,ex.id]);}}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        )}

      </div>

      {/* ── MODAL: Confirmation suppression ── */}
      {confirmDelete&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"flex-end",zIndex:200}} onClick={()=>setConfirmDelete(null)}>
          <div className="fi" style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:480,margin:"0 auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{width:48,height:48,borderRadius:14,background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}><Trash2 size={22} color="#DC2626" strokeWidth={1.8}/></div>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:20,marginBottom:5}}>
                {confirmDelete.type==="prog"?"Supprimer ce programme ?":confirmDelete.type==="plan"?"Supprimer la planification ?":"Supprimer cette semaine ?"}
              </div>
              <div style={{fontSize:12,color:"#9C9589"}}>Cette action est irréversible.</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="bp" onClick={()=>setConfirmDelete(null)} style={{flex:1,padding:13,borderRadius:12,border:"2px solid #E5E1DA",background:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#6B6560"}}>Annuler</button>
              <button className="bp" onClick={()=>{
                const cd=confirmDelete;
                if(cd.type==="prog") delProg(cd.person,cd.rid);
                else if(cd.type==="plan") updR(cd.person,cd.rid,r=>({...r,weeks:r.weeks.map(w=>({...w,startDate:null}))}));
                else if(cd.type==="week") remWeek(cd.person,cd.rid,cd.wid);
                setConfirmDelete(null);
              }} style={{flex:1,padding:13,borderRadius:12,border:"none",background:"#DC2626",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#fff",fontWeight:600}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Planifier routine ── */}
      {showScheduleModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"flex-end",zIndex:200}} onClick={()=>setShowScheduleModal(false)}>
          <div className="fi" style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            {(()=>{
              const rt=(routines[activeUser]||[]).find(r=>r.id===scheduleRid);
              if(!rt) return null;
              return(
                <>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:21,marginBottom:6}}>Planifier le programme</div>
                  <div style={{fontSize:13,color:"#9C9589",marginBottom:16}}>{rt.title} · {rt.weeks.length} semaine{rt.weeks.length!==1?"s":""}</div>
                  <label style={{fontSize:12,color:"#9C9589",fontWeight:600,display:"block",marginBottom:5,textTransform:"uppercase"}}>Date de début</label>
                  <input type="date" value={scheduleStart} onChange={e=>setScheduleStart(e.target.value)} style={{...inp,marginBottom:14}}/>
                  <div style={{background:"#F5F3FF",borderRadius:10,padding:12,marginBottom:18}}>
                    {rt.weeks.map((w,i)=>{
                      const s=addDays(scheduleStart,i*7);
                      return(<div key={w.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#4C1D95",padding:"3px 0",borderBottom:i<rt.weeks.length-1?"1px solid #EDE9FE":"none"}}><span style={{fontWeight:500}}>{w.title.slice(0,25)}</span><span style={{color:"#7C3AED"}}>{fmtDate(s,{day:"numeric",month:"short"})} → {fmtDate(addDays(s,6),{day:"numeric",month:"short"})}</span></div>);
                    })}
                  </div>
                  {rt.weeks.some(w=>w.startDate)&&(
                    <button className="bp" onClick={()=>{updR(activeUser,scheduleRid,r=>({...r,weeks:r.weeks.map(w=>({...w,startDate:null}))}));setShowScheduleModal(false);}} style={{width:"100%",padding:10,borderRadius:10,border:"1.5px dashed #FCA5A5",background:"transparent",color:"#DC2626",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:12,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><X size={13}/>Supprimer la planification existante</button>
                  )}
                  <div style={{display:"flex",gap:10}}>
                    <button className="bp" onClick={()=>setShowScheduleModal(false)} style={{flex:1,padding:13,borderRadius:12,border:"2px solid #E5E1DA",background:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#6B6560"}}>Annuler</button>
                    <button className="bp" onClick={scheduleRoutine} style={{flex:2,padding:13,borderRadius:12,border:"none",background:"#6D28D9",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#fff",fontWeight:600}}>Planifier</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── MODAL: Nouveau programme ── */}
      {showNewProg&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"flex-end",zIndex:200}} onClick={()=>setShowNewProg(false)}>
          <div className="fi" style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:480,margin:"0 auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:21,marginBottom:16}}>Nouveau programme</div>
            <label style={{fontSize:12,color:"#9C9589",fontWeight:600,display:"block",marginBottom:6,textTransform:"uppercase"}}>Pour qui ?</label>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {["paul","alexia"].map(u=>(
                <button key={u} className="bp" onClick={()=>setNewProgTarget(u)} style={{flex:1,padding:9,borderRadius:10,border:newProgTarget===u?"2px solid "+USERS[u].color:"2px solid #E5E1DA",background:newProgTarget===u?(u==="paul"?"#EEF3FF":"#FDF2F8"):"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,color:newProgTarget===u?USERS[u].color:"#6B6560"}}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:4}}><User size={13}/>{USERS[u].name}</span>
                </button>
              ))}
            </div>
            <label style={{fontSize:12,color:"#9C9589",fontWeight:600,display:"block",marginBottom:5,textTransform:"uppercase"}}>Titre</label>
            <input value={newProgTitle} onChange={e=>setNewProgTitle(e.target.value)} placeholder="ex: Running débutant 🏃" style={{...inp,marginBottom:12}}/>
            <label style={{fontSize:12,color:"#9C9589",fontWeight:600,display:"block",marginBottom:5,textTransform:"uppercase"}}>Sous-titre (optionnel)</label>
            <input value={newProgSub} onChange={e=>setNewProgSub(e.target.value)} placeholder="ex: 8 semaines · progression" style={inp}/>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="bp" onClick={()=>setShowNewProg(false)} style={{flex:1,padding:13,borderRadius:12,border:"2px solid #E5E1DA",background:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#6B6560"}}>Annuler</button>
              <button className="bp" onClick={()=>{
                const nr={id:genId(),title:newProgTitle||"Mon programme",subtitle:newProgSub,weeks:[]};
                setPersonR(newProgTarget,list=>[...(list||[]),nr]);
                setActiveRid(nr.id);setActiveUser(newProgTarget);setShowNewProg(false);setNewProgTitle("");setNewProgSub("");
              }} style={{flex:2,padding:13,borderRadius:12,border:"none",background:USERS[newProgTarget].color,cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#fff",fontWeight:600}}>Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Ajouter exercice ── */}
      {showAddEx&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"flex-end",zIndex:200}} onClick={()=>setShowAddEx(false)}>
          <div className="fi" style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:480,margin:"0 auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'DM Serif Display'",fontSize:21,marginBottom:16}}>Ajouter un exercice</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {[["warmup","Échauffement"],["stretch","Étirement"]].map(([k,l])=>(
                <button key={k} className="bp" onClick={()=>setNewExType(k)} style={{flex:1,padding:9,borderRadius:10,border:newExType===k?"2px solid #1C1A17":"2px solid #E5E1DA",background:newExType===k?"#F7F5F2":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,fontWeight:newExType===k?600:400}}>{l}</button>
              ))}
            </div>
            <label style={{fontSize:12,color:"#9C9589",fontWeight:600,display:"block",marginBottom:5,textTransform:"uppercase"}}>Nom</label>
            <input value={newExName} onChange={e=>setNewExName(e.target.value)} placeholder="Nom de l'exercice" style={{...inp,marginBottom:12}}/>
            <label style={{fontSize:12,color:"#9C9589",fontWeight:600,display:"block",marginBottom:5,textTransform:"uppercase"}}>Durée</label>
            <input value={newExDur} onChange={e=>setNewExDur(e.target.value)} placeholder="ex: 30 sec / côté" style={{...inp,marginBottom:12}}/>
            <label style={{fontSize:12,color:"#9C9589",fontWeight:600,display:"block",marginBottom:5,textTransform:"uppercase"}}>Muscles ciblés</label>
            <input value={newExMuscles} onChange={e=>setNewExMuscles(e.target.value)} placeholder="ex: Quadriceps, psoas" style={inp}/>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="bp" onClick={()=>setShowAddEx(false)} style={{flex:1,padding:13,borderRadius:12,border:"2px solid #E5E1DA",background:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#6B6560"}}>Annuler</button>
              <button className="bp" onClick={()=>{
                const ex={id:"cx_"+genId(),name:newExName||"Exercice",duration:newExDur||"30 sec",muscles:newExMuscles,custom:true};
                if(newExType==="warmup") setCustomWarmup(p=>[...p,ex]); else setCustomStretch(p=>[...p,ex]);
                setShowAddEx(false);setNewExName("");setNewExDur("");setNewExMuscles("");
              }} style={{flex:2,padding:13,borderRadius:12,border:"none",background:"#1C1A17",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#fff",fontWeight:600}}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Ajouter activité ── */}
      {showAdd&&(()=>{
        // Helpers locaux au modal
        const lbl=(t)=><label style={{fontSize:11,color:"#9C9589",fontWeight:600,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t}</label>;
        const actColor=selectedBoth?"#7C3AED":uColor;
        // Calcul durée ↔ heure de fin
        const computeEnd=(start,durMin)=>{
          if(!start||!durMin) return "";
          const [h,m]=start.split(":").map(Number);
          const total=h*60+m+parseInt(durMin,10);
          return String(Math.floor(total/60)%24).padStart(2,"0")+":"+String(total%60).padStart(2,"0");
        };
        const computeDur=(start,end)=>{
          if(!start||!end) return "";
          const [sh,sm]=start.split(":").map(Number),[eh,em]=end.split(":").map(Number);
          const d=(eh*60+em)-(sh*60+sm); return d>0?String(d):"";
        };
        const DURATIONS=["30","45","60","90","120"];
        return(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"flex-end",zIndex:200}} onClick={()=>setShowAdd(false)}>
          <div className="fi" style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:"22px 20px 28px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"94vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>

            {/* Titre + badge type */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div style={{fontFamily:"'DM Serif Display'",fontSize:21,color:"#1C1A17"}}>{newAct.planned?"Planifier":"Enregistrer"}</div>
              <div style={{width:36,height:36,borderRadius:10,background:actColor+"18",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <ActIcon type={newAct.type} size={18} color={actColor}/>
              </div>
            </div>

            {/* Pour qui */}
            {lbl("Pour")}
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {["paul","alexia"].map(u=>(
                <button key={u} className="bp" onClick={()=>{setActiveUser(u);setSelectedBoth(false);}}
                  style={{flex:1,padding:"8px 6px",borderRadius:10,border:activeUser===u&&!selectedBoth?"2px solid "+USERS[u].color:"2px solid #E5E1DA",background:activeUser===u&&!selectedBoth?(u==="paul"?"#EEF3FF":"#FDF2F8"):"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,fontWeight:activeUser===u&&!selectedBoth?600:400,color:activeUser===u&&!selectedBoth?USERS[u].color:"#6B6560"}}>
                  <User size={13} strokeWidth={1.8}/> {USERS[u].name}
                </button>
              ))}
              <button className="bp" onClick={()=>setSelectedBoth(b=>!b)}
                style={{flex:1,padding:"8px 6px",borderRadius:10,border:selectedBoth?"2px solid #7C3AED":"2px solid #E5E1DA",background:selectedBoth?"#F5F3FF":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,fontWeight:selectedBoth?600:400,color:selectedBoth?"#7C3AED":"#6B6560"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:4}}><Users size={13} strokeWidth={1.8}/>Duo</span>
              </button>
            </div>

            {/* Activité */}
            {lbl("Activité")}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:16}}>
              {ACT_TYPES.map(a=>(
                <button key={a.id} className="bp" onClick={()=>setNewAct(p=>({...p,type:a.id}))}
                  style={{padding:"8px 4px",borderRadius:10,border:newAct.type===a.id?"2px solid "+actColor:"2px solid #E5E1DA",background:newAct.type===a.id?actColor+"12":"#fff",cursor:"pointer",textAlign:"center",fontFamily:"'DM Sans'",transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:2}}><ActIcon type={a.id} size={16} color={newAct.type===a.id?actColor:a.color}/></div>
                  <div style={{fontSize:9,color:newAct.type===a.id?actColor:"#6B6560",lineHeight:1.3,fontWeight:newAct.type===a.id?600:400}}>{a.label}</div>
                </button>
              ))}
            </div>

            {/* Date */}
            {lbl("Date")}
            <input type="date" value={newAct.date} onChange={e=>setNewAct(p=>({...p,date:e.target.value}))} style={{...inp,marginBottom:16}}/>

            {/* Heure de début + durée */}
            {lbl("Heure & durée")}
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{flex:1}}>
                <input type="time" value={newAct.timeStart} onChange={e=>{
                  const s=e.target.value;
                  setNewAct(p=>({...p,timeStart:s,timeEnd:p.duration?computeEnd(s,p.duration):p.timeEnd}));
                }} style={{...inp}} placeholder="Début"/>
                <div style={{fontSize:10,color:"#B8B0A6",marginTop:3,paddingLeft:2}}>Heure de début</div>
              </div>
              <div style={{flex:1}}>
                <input type="time" value={newAct.timeEnd} onChange={e=>{
                  const end=e.target.value;
                  setNewAct(p=>({...p,timeEnd:end,duration:computeDur(p.timeStart,end)}));
                }} style={{...inp}} placeholder="Fin"/>
                <div style={{fontSize:10,color:"#B8B0A6",marginTop:3,paddingLeft:2}}>Heure de fin</div>
              </div>
            </div>
            {/* Raccourcis durée */}
            <div style={{display:"flex",gap:5,marginBottom:16}}>
              {DURATIONS.map(d=>{
                const active=newAct.duration===d;
                return(
                  <button key={d} className="bp" onClick={()=>{
                    setNewAct(p=>({...p,duration:d,timeEnd:computeEnd(p.timeStart,d)}));
                  }} style={{flex:1,padding:"5px 2px",borderRadius:8,border:active?"1.5px solid "+actColor:"1px solid #E5E1DA",background:active?actColor+"12":"#F7F5F2",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:11,fontWeight:active?600:400,color:active?actColor:"#6B6560"}}>
                    {d<60?d+"min":d/60+"h"}
                  </button>
                );
              })}
            </div>

            {/* Ressenti — seulement pour activité réalisée */}
            {!newAct.planned&&(<>
              {lbl("Ressenti")}
              <div style={{display:"flex",gap:6,marginBottom:16}}>
                {FEELINGS.map(f=>(
                  <button key={f.v} className="bp" onClick={()=>setNewAct(p=>({...p,feeling:p.feeling===f.v?null:f.v}))}
                    style={{flex:1,padding:"8px 4px",borderRadius:10,border:newAct.feeling===f.v?"2px solid "+actColor:"2px solid #E5E1DA",background:newAct.feeling===f.v?actColor+"12":"#fff",cursor:"pointer",fontFamily:"'DM Sans'",textAlign:"center"}}>
                    <div style={{fontSize:17,marginBottom:2}}>{f.e}</div>
                    <div style={{fontSize:10,color:newAct.feeling===f.v?actColor:"#9C9589",fontWeight:newAct.feeling===f.v?600:400}}>{f.l}</div>
                  </button>
                ))}
              </div>
            </>)}

            {/* Note */}
            {lbl("Note (optionnel)")}
            <input value={newAct.note} onChange={e=>setNewAct(p=>({...p,note:e.target.value}))} placeholder={newAct.planned?"ex: Piscine du matin, 40 longueurs":"ex: Super séance, bonne progression !"} style={{...inp,marginBottom:18}}/>

            {/* Boutons */}
            <div style={{display:"flex",gap:8}}>
              <button className="bp" onClick={()=>setShowAdd(false)} style={{flex:1,padding:13,borderRadius:12,border:"2px solid #E5E1DA",background:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#6B6560"}}>Annuler</button>
              <button className="bp" onClick={addActivity} style={{flex:2,padding:13,borderRadius:12,border:"none",background:actColor,cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#fff",fontWeight:600}}>
                {newAct.planned
                  ? <span style={{display:"inline-flex",alignItems:"center",gap:6,justifyContent:"center"}}>{selectedBoth?<Users size={14}/>:<Calendar size={14}/>}{selectedBoth?"Planifier ensemble":"Planifier"}</span>
                  : <span style={{display:"inline-flex",alignItems:"center",gap:6,justifyContent:"center"}}>{selectedBoth&&<Users size={14}/>}{"Enregistrer"+(newAct.duration?" · "+newAct.duration+"min":"")}</span>}
              </button>
            </div>

          </div>
        </div>
        );
      })()}

      {/* ── Popup détail activité ── */}
      {/* ── Popup profil ── */}
      {openLevelUser&&(()=>{
        const u=openLevelUser;
        const uColor=USERS[u].color;
        const doneLogs=logs.filter(l=>l.user===u&&!l.planned);
        const uxp=doneLogs.reduce((s,l)=>{
          if(l.type==="routine"){let sec=[];(routines[u]||[]).forEach(r=>r.weeks.forEach(w=>{if(l.note===r.id+"_"+w.id+"_"+l.date){const d=w.days[0];if(d)sec=d.sections;}}));return s+calcRoutineXP(sec);}
          return s+calcXP(l);
        },0);
        const ul=getLvl(uxp);

        // Streak
        const streak=getStreak(doneLogs.filter(l=>l.type!=="routine"));

        // Temps total cumulé (en minutes)
        const totalMin=doneLogs.filter(l=>l.type!=="routine").reduce((s,l)=>{
          if(l.timeStart&&l.timeEnd){const[sh,sm]=l.timeStart.split(":").map(Number),[eh,em]=l.timeEnd.split(":").map(Number);const d=(eh*60+em)-(sh*60+sm);return s+(d>0?d:0);}
          if(l.duration) return s+parseInt(l.duration,10);
          return s+45; // défaut 45min
        },0);
        const totalH=Math.floor(totalMin/60), totalM=totalMin%60;

        // Activité favorite
        const counts={};
        doneLogs.filter(l=>l.type!=="routine").forEach(l=>{counts[l.type]=(counts[l.type]||0)+1;});
        const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
        const favoriteType=sorted[0]?sorted[0][0]:null;
        const favoriteAt=favoriteType?ACT_TYPES.find(a=>a.id===favoriteType):null;

        // Routines
        const rtCount=doneLogs.filter(l=>l.type==="routine").length;

        const sep=<div style={{borderTop:"1px solid #F0EDE8",margin:"16px 0"}}/>;
        const sectionTitle=(t)=><div style={{fontSize:11,fontWeight:600,color:"#9C9589",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>{t}</div>;

        return(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setOpenLevelUser(null)}>
            <div className="fi" style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:"24px 20px 32px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>

              {/* ── Header ── */}
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:uColor+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><User size={26} color={uColor}/></div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:22,color:"#1C1A17"}}>{USERS[u].name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}>
                    <LvlIcon n={ul.cur.n} size={13}/>
                    <span style={{fontSize:12,fontWeight:600,color:uColor}}>Niv.{ul.cur.n} — {ul.cur.title}</span>
                    <span style={{fontSize:11,color:"#B8B0A6"}}>· {uxp.toLocaleString()} XP</span>
                  </div>
                </div>
                {streak>0&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",background:"#FFF7ED",borderRadius:12,padding:"8px 10px",flexShrink:0}}>
                  <Flame size={18} color="#D97706"/>
                  <span style={{fontSize:16,fontWeight:700,color:"#D97706",lineHeight:1.2}}>{streak}</span>
                  <span style={{fontSize:9,color:"#D97706"}}>jours</span>
                </div>}
              </div>

              {/* ── Stats rapides ── */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
                <div style={{background:"#F7F5F2",borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:uColor}}>{sorted.length>0?sorted.reduce((s,[,n])=>s+n,0):0}</div>
                  <div style={{fontSize:10,color:"#9C9589",marginTop:2}}>activités</div>
                </div>
                <div style={{background:"#F7F5F2",borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:uColor}}>{totalH>0?`${totalH}h${totalM>0?totalM+"m":""}`:`${totalM}m`}</div>
                  <div style={{fontSize:10,color:"#9C9589",marginTop:2}}>temps total</div>
                </div>
                <div style={{background:"#F7F5F2",borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:"#16A34A"}}>{rtCount}</div>
                  <div style={{fontSize:10,color:"#9C9589",marginTop:2}}>routines</div>
                </div>
              </div>

              {/* ── Activité favorite ── */}
              {favoriteAt&&<div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,background:favoriteAt.color+"10",border:"1px solid "+favoriteAt.color+"30",marginBottom:20}}>
                <div style={{width:36,height:36,borderRadius:10,background:favoriteAt.color+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ActIcon type={favoriteType} size={18} color={favoriteAt.color}/></div>
                <div>
                  <div style={{fontSize:11,color:"#9C9589",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>Activité favorite</div>
                  <div style={{fontSize:14,fontWeight:600,color:"#1C1A17",marginTop:1}}>{favoriteAt.label} <span style={{fontSize:11,color:uColor,fontWeight:400}}>· {sorted[0][1]}× pratiqué{sorted[0][1]>1?"s":""}</span></div>
                </div>
              </div>}

              {sep}

              {/* ── Progression ── */}
              {sectionTitle("Progression")}
              {ul.nxt&&<div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#9C9589",marginBottom:6}}>
                  <span>{ul.inLvl.toLocaleString()} / {ul.needed.toLocaleString()} XP</span>
                  <span>{(ul.needed-ul.inLvl).toLocaleString()} XP pour Niv.{ul.nxt.n}</span>
                </div>
                <div style={{height:8,background:"#F0EDE8",borderRadius:8,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:8,background:uColor,width:`${ul.pct}%`,transition:"width .4s"}}/>
                </div>
              </div>}
              <div style={{display:"flex",gap:8,marginBottom:20}}>
                <div style={{flex:1,padding:"12px 14px",borderRadius:12,background:uColor+"12",border:"2px solid "+uColor}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <LvlIcon n={ul.cur.n} size={14}/>
                    <span style={{fontSize:12,fontWeight:700,color:uColor}}>Niv.{ul.cur.n}</span>
                    <span style={{fontSize:9,background:uColor,color:"#fff",padding:"1px 6px",borderRadius:20}}>Actuel</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:"#1C1A17"}}>{ul.cur.title}</div>
                  <div style={{fontSize:10,color:"#9C9589"}}>{ul.cur.xp===0?"Départ":ul.cur.xp.toLocaleString()+" XP"}</div>
                </div>
                {ul.nxt&&<div style={{flex:1,padding:"12px 14px",borderRadius:12,background:"#F7F5F2",border:"1px dashed #E5E1DA",opacity:0.75}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <LvlIcon n={ul.nxt.n} size={14}/>
                    <span style={{fontSize:12,fontWeight:600,color:"#6B6560"}}>Niv.{ul.nxt.n}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:"#1C1A17"}}>{ul.nxt.title}</div>
                  <div style={{fontSize:10,color:"#9C9589"}}>{ul.nxt.xp.toLocaleString()} XP</div>
                </div>}
              </div>

              {sep}

              {/* ── Activités pratiquées ── */}
              {sorted.length>0&&<>
                {sectionTitle("Activités pratiquées")}
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:4}}>
                  {sorted.map(([type,count])=>{
                    const at=ACT_TYPES.find(a=>a.id===type);
                    return(
                      <div key={type} style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:28,height:28,borderRadius:7,background:at?.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ActIcon type={type} size={14} color={at?.color}/></div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:12,fontWeight:500,color:"#1C1A17"}}>{at?.label||type}</span>
                            <span style={{fontSize:12,fontWeight:600,color:uColor}}>{count}×</span>
                          </div>
                          <div style={{height:4,background:"#F0EDE8",borderRadius:4,overflow:"hidden"}}>
                            <div style={{height:"100%",borderRadius:4,background:at?.color||uColor,width:`${Math.round(count/sorted[0][1]*100)}%`}}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>}

              <button className="bp" onClick={()=>setOpenLevelUser(null)} style={{width:"100%",marginTop:20,padding:13,borderRadius:12,border:"2px solid #E5E1DA",background:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:14,color:"#6B6560"}}>Fermer</button>
            </div>
          </div>
        );
      })()}

      {actDetail&&(()=>{
        const l=actDetail;
        const at=ACT_TYPES.find(a=>a.id===l.type);
        const uc=USERS[l.user]?.color||"#ccc";
        const feel=FEELINGS.find(f=>f.v===l.feeling);
        return(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={()=>setActDetail(null)}>
            <div className="fi" style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:"24px 20px 32px",width:"100%",maxWidth:480,margin:"0 auto"}} onClick={e=>e.stopPropagation()}>

              {/* En-tête */}
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
                <div style={{width:48,height:48,borderRadius:13,background:at?.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <ActIcon type={l.type} size={24} color={at?.color}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'DM Serif Display'",fontSize:20,color:"#1C1A17"}}>{at?.label}</div>
                  <div style={{fontSize:12,color:"#9C9589",marginTop:2}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5}}><><User size={12}/>{USERS[l.user]?.name||l.user}</></span>
                    {l.planned&&<span style={{marginLeft:6,fontSize:11,color:"#8B5CF6",background:"#F5F3FF",padding:"1px 7px",borderRadius:20}}>planifié</span>}
                  </div>
                </div>
                {feel&&<div style={{textAlign:"center"}}>
                  <div style={{fontSize:28}}>{feel.e}</div>
                  <div style={{fontSize:10,fontWeight:600,color:FEEL_COLOR[l.feeling]}}>{feel.l}</div>
                </div>}
              </div>

              {/* Infos */}
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#F7F5F2",borderRadius:12}}>
                  <Calendar size={16} color="#9C9589"/>
                  <span style={{fontSize:13,color:"#1C1A17"}}>{fmtDate(l.date,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span>
                </div>
                {(l.timeStart||l.duration)&&(
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#F7F5F2",borderRadius:12}}>
                    <Timer size={16} color="#9C9589"/>
                    <div>
                      {l.timeStart&&<span style={{fontSize:13,color:"#1C1A17"}}>{l.timeStart}{l.timeEnd&&" → "+l.timeEnd}</span>}
                      {l.duration&&<span style={{fontSize:13,color:"#1C1A17",marginLeft:l.timeStart?8:0}}>{l.duration} min</span>}
                    </div>
                    {!l.planned&&l.timeStart&&l.timeEnd&&<span style={{marginLeft:"auto",fontSize:12,fontWeight:600,color:uc}}>+{calcXP(l)} XP</span>}
                  </div>
                )}
                {l.note&&(
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",background:"#F7F5F2",borderRadius:12}}>
                    <MessageSquare size={16} color="#9C9589" style={{flexShrink:0}}/>
                    <span style={{fontSize:13,color:"#3D3A35",lineHeight:1.6,fontStyle:"italic"}}>"{l.note}"</span>
                  </div>
                )}
                {!l.planned&&!l.timeStart&&(
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#F7F5F2",borderRadius:12}}>
                    <Zap size={16} color="#9C9589"/>
                    <span style={{fontSize:13,color:"#1C1A17",fontWeight:600,color:uc}}>+{calcXP(l)} XP</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{display:"flex",gap:8}}>
                <button className="bp" onClick={()=>{setLogs(p=>p.filter(x=>x.id!==l.id));setActDetail(null);}} style={{flex:1,padding:12,borderRadius:12,border:"1.5px solid #FCA5A5",background:"#FFF5F5",color:"#DC2626",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,fontWeight:600}}>Supprimer</button>
                <button className="bp" onClick={()=>setActDetail(null)} style={{flex:1,padding:12,borderRadius:12,border:"2px solid #E5E1DA",background:"#fff",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,color:"#6B6560"}}>Fermer</button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
