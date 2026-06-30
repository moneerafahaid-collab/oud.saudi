import { useState, useRef, useEffect, type ChangeEvent } from "react";
import {
  Recycle, BookOpen, MessageCircle, ClipboardList, User,
  LogIn, LogOut, MapPin, Send, Camera, Calendar,
  CheckCircle, Menu, X, ChevronLeft, ChevronDown, Bell,
  Shield, FileText, HelpCircle, AlertCircle, Clock,
  Leaf, Sprout, Award, Info, Search, ArrowLeft,
  TrendingUp, Globe, Phone, Mail, ExternalLink,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { HailMap, type RegionId } from "@/app/components/HailMap";
import platformLogo from "@/imports/logo.png";
import osheibaAvatar from "@/imports/osheiba.png";
import storyBg from "@/imports/hero-bg.png";
import ctaBg from "@/imports/image-3.png";

const F = "'Noto Kufi Arabic', 'Cairo', sans-serif";
const G = "#1A4731";   // primary green
const GD = "#0F2E1F";  // dark green
const GOLD = "#C9A84C"; // gold accent
const QASSIM = "#5C3D2E"; // qassim brown

const REGION_CITIES: Record<RegionId, { l: string; icon: string; c: string }[]> = {
  hail: [
    { l: "حائل", icon: "🌆", c: G },
    { l: "بقعاء", icon: "🏘️", c: G },
    { l: "الشنان", icon: "🏡", c: G },
    { l: "موقق", icon: "🌄", c: G },
    { l: "السليمي", icon: "🏜️", c: G },
    { l: "الغزالة", icon: "🌾", c: G },
  ],
  qassim: [
    { l: "بريدة", icon: "🌴", c: QASSIM },
    { l: "عنيزة", icon: "🌾", c: QASSIM },
    { l: "الرس", icon: "🌿", c: QASSIM },
    { l: "المذنب", icon: "🌳", c: QASSIM },
    { l: "البكيرية", icon: "🌱", c: QASSIM },
    { l: "رياض الخبراء", icon: "🏘️", c: QASSIM },
  ],
};

const ALL_CITIES = [
  ...REGION_CITIES.hail.slice(0, 3),
  ...REGION_CITIES.qassim.slice(0, 3),
];
// بانر رسمي — معيار 1920×560 بكسل (نسبة 24:7) لبوابات الجهات
const HERO_BANNER = "h-[380px] sm:h-[480px] lg:h-[560px]";

type Page = "home" | "login" | "dashboard" | "service" | "workshops";
type Message = { id: number; from: "user" | "bot"; text: string; imageUrl?: string };

const WORKSHOPS = [
  { id:1, title:"تحويل سعف النخيل إلى منتجات حرفية", desc:"تعلّم كيف تصنع سلالاً وزخارف من مخلفات النخيل بطريقة مستدامة.", date:"15 يوليو 2025", time:"9:00 ص", location:"حضوري – قاعة التدريب، حائل", seats:18, level:"مبتدئ", category:"حرف يدوية", emoji:"🧺" },
  { id:2, title:"إدارة مخلفات المزرعة وتحويلها إلى سماد", desc:"دورة متكاملة للمزارعين حول تقنيات التسميد العضوي.", date:"22 يوليو 2025", time:"10:00 ص", location:"عن بعد – Zoom", seats:40, level:"متوسط", category:"تدريب مزارعين", emoji:"♻️" },
  { id:3, title:"صناعة الفحم الحيوي من النفايات الزراعية", desc:"استخدام البيوتشار لتحويل المخلفات إلى محسّن تربة.", date:"5 أغسطس 2025", time:"8:00 ص", location:"حضوري – مركز حائل الزراعي", seats:12, level:"متقدم", category:"إعادة تدوير", emoji:"🌿" },
  { id:4, title:"التسويق الرقمي للمنتجات الحرفية", desc:"كيف تسوّق منتجاتك الحرفية عبر الإنترنت بأسلوب احترافي.", date:"18 أغسطس 2025", time:"5:00 م", location:"عن بعد – Google Meet", seats:50, level:"مبتدئ", category:"حرف يدوية", emoji:"📱" },
];

const ORDERS = [
  { id:"SRV-2025-00142", date:"3 يونيو 2025", type:"سعف نخيل", weight:"3 أطنان", status:"مكتملة", sc:"green", fertilizer:"1.8 طن" },
  { id:"SRV-2025-00198", date:"19 يونيو 2025", type:"أغصان أشجار", weight:"1.5 طن", status:"قيد التنفيذ", sc:"blue", fertilizer:"0.9 طن" },
  { id:"SRV-2025-00231", date:"28 يونيو 2025", type:"سعف نخيل وأغصان", weight:"5 أطنان", status:"بانتظار المراجعة", sc:"amber", fertilizer:"3 أطنان" },
];

const RECYCLE_CATEGORIES = [
  {
    id: "glass",
    label: "الزجاج",
    emoji: "🫙",
    keywords: ["زجاج", "زجاجات", "قارورة", "برطمان"],
    badKeywords: ["مكسور", "ملوث", "دهان", "زيت", "مخلوط"],
    recyclableTips: [
      "فصل الزجاج النظيف عن الأغطية المعدنية أو البلاستيكية",
      "غسل الزجاج وإزالة الملصقات قبل التسليم لنقاط التجميع",
      "إعادة استخدام البرطمانات لتخزين البذور أو السماد العضوي",
    ],
    badReason: "الزجاج المكسور أو الملوث لا يُعاد تدويره بأمان عبر القنوات العادية.",
    safeDisposal: [
      "لف القطع الحادة بورق مقوى وضعها في حاوية مغلقة مكتوب عليها «زجاج»",
      "سلّمها لمراكز التخلص الآمن أو برنامج جمع المخلفات المعتمد في منطقتك",
      "لا تخلط الزجاج المكسور مع النفايات العضوية أو الورق",
    ],
    workshopId: 3,
  },
  {
    id: "paper",
    label: "الورق والكرتون",
    emoji: "📄",
    keywords: ["ورق", "كرتون", "ورق مقوى", "صحف", "كراتين"],
    badKeywords: ["مبلل", "دهان", "شمع", "زيت", "ملوث", "مختلط"],
    recyclableTips: [
      "تجفيف الورق وفصله عن البلاستيك والشريط اللاصق",
      "طي الكرتون لتقليل الحجم قبل التسليم",
      "تحويل الورق النظيف إلى نشارة تغطية للتربة أو حرف يدوية",
    ],
    badReason: "الورق المبلل أو المدهون يفقد أليافه ولا يصلح لإعادة التدوير.",
    safeDisposal: [
      "ضع الورق الملوث في حاوية النفايات العامة بعد لفه",
      "لا تحرق الورق المدهون — يطلق أبخرة ضارة",
      "استخدم نشارة الورق النظيف فقط كملِّح للتربة بعد التحلل",
    ],
    workshopId: 3,
  },
  {
    id: "plastic",
    label: "البلاستيك",
    emoji: "♻️",
    keywords: ["بلاستيك", "بلاستيكية", "عبوة", "نايلون", "أكياس"],
    badKeywords: ["ملوث", "زيت", "طعام", "مكسور", "حرق", "أسود"],
    recyclableTips: [
      "غسل العبوات وإزالة الأغطية قبل الفرز",
      "جمع البلاستيك الشفاف والأبيض في أكياس منفصلة",
      "إعادة استخدام الأحواض والعبوات الكبيرة في الزراعة",
    ],
    badReason: "البلاستيك الملوث بالزيوت أو الطعام أو المحروق لا يُعاد تدويره.",
    safeDisposal: [
      "تسليم البلاستيك غير القابل للتدوير لنقاط الجمع المعتمدة",
      "لا تحرق البلاستيك — يطلق غازات ضارة",
      "خزّن الأكياس في مكان جاف بعيداً عن أشعة الشمس حتى التسليم",
    ],
    workshopId: 3,
  },
  {
    id: "metal",
    label: "الحديد والمعادن",
    emoji: "🔩",
    keywords: ["حديد", "معادن", "معدن", "ألومنيوم", "نحاس", "حاويات معدنية", "علب معدنية"],
    badKeywords: ["ملوث", "زيت", "بطارية", "دهان", "صدأ شديد"],
    recyclableTips: [
      "فصل المعادن عن البلاستيك والزجاج",
      "تنظيف العلب المعدنية وكبسها لتوفير المساحة",
      "بيع أو تسليم الخردة لمراكز إعادة التدوير المعتمدة",
    ],
    badReason: "المعادن الملوثة بالزيوت أو المواد الكيميائية تحتاج معالجة خاصة.",
    safeDisposal: [
      "سلّم المعادن الملوثة لمراكز التخلص الآمن للنفايات الخطرة",
      "لا تدفن المعادن في التربة الزراعية",
      "افصل البطاريات والمعادن المدهونة عن الخردة العادية",
    ],
    workshopId: 3,
  },
  {
    id: "palm",
    label: "سعف النخيل",
    emoji: "🌴",
    keywords: ["سعف", "سعف نخيل"],
    badKeywords: ["محترق", "مبيد", "ملوث", "مبلل بالزيت"],
    recyclableTips: [
      "تحويل السعف إلى سماد عضوي (نسبة تحويل تقريباً 60٪)",
      "صناعة سلال وحصائر حرفية تراثية",
      "استخدامه مالشاً لحماية رطوبة التربة",
    ],
    badReason: "السعف المعالج كيميائياً أو المحترق لا يصلح للتدوير الزراعي.",
    safeDisposal: [
      "تقديم طلب إزالة عبر منصة عَود لنقله ومعالجته بأمان",
      "لا تحرق السعف — يضر بجودة الهواء والتربة",
      "خزّنه في مكان جاف ومهوى بعيداً عن مصادر الاشتعال",
    ],
    workshopId: 1,
  },
  {
    id: "palm-waste",
    label: "مخلفات النخيل",
    emoji: "🌿",
    keywords: ["نخيل", "جريد", "جذوع", "مخلفات نخيل"],
    badKeywords: ["محترق", "مبيد", "ملوث"],
    recyclableTips: [
      "الجريد والسعف → سماد عضوي فاخر",
      "الألياف → منتجات حرفية تراثية",
      "الجذوع → فحم حيوي (بيوتشار) لتحسين التربة",
    ],
    badReason: "مخلفات النخيل الملوثة أو المعالجة بمبيدات لا تُستخدم في السماد العضوي.",
    safeDisposal: [
      "اطلب خدمة الإزالة من منصة عَود للمعالجة الآمنة",
      "لا تخلطها مع نفايات بلاستيكية أو زجاجية",
      "خزّنها مؤقتاً في نقطة بعيدة عن المياه الجوفية",
    ],
    workshopId: 2,
  },
  {
    id: "wood",
    label: "أغصان وأشجار",
    emoji: "🌳",
    keywords: ["أغصان", "أشجار", "خشب", "تقليم", "غصن"],
    badKeywords: ["مبيد", "ملوث", "مشع", "دهان", "معالج"],
    recyclableTips: [
      "كومبوست غني بالكربون (تحويل تقريباً 50٪)",
      "فحم حيوي لمعالجة التربة",
      "تغطية زراعية طبيعية (مالش)",
    ],
    badReason: "الأخشاب المعالجة كيميائياً أو المدهونة غير آمنة للتسميد.",
    safeDisposal: [
      "سلّم الأخشاب المعالجة لمراكز التخلص المعتمدة",
      "لا تحرق الخشب المدهون أو الملوث",
      "اطلب خدمة الإزالة للكميات الكبيرة عبر منصة عَود",
    ],
    workshopId: 3,
  },
] as const;

function workshopLine(id: number) {
  const w = WORKSHOPS.find((x) => x.id === id);
  if (!w) return "";
  return `\n\n📚 ورشة مناسبة:\n«${w.title}» ${w.emoji}\n📅 ${w.date} · ${w.time}\n📍 ${w.location}`;
}

function matchCategory(text: string) {
  const t = text.trim();
  const sorted = [...RECYCLE_CATEGORIES].sort(
    (a, b) => Math.max(...b.keywords.map((k) => k.length)) - Math.max(...a.keywords.map((k) => k.length)),
  );
  for (const cat of sorted) {
    if (cat.keywords.some((k) => t.includes(k))) return cat;
  }
  return null;
}

function isNonRecyclable(text: string, cat: (typeof RECYCLE_CATEGORIES)[number]) {
  return cat.badKeywords.some((k) => text.includes(k));
}

function botReply(t: string) {
  const cat = matchCategory(t);
  if (!cat) {
    return (
      "اختر فئة المادة أو صِف ما لديك:\n" +
      "🫙 زجاج · 📄 ورق · ♻️ بلاستيك · 🔩 حديد\n" +
      "🌴 سعف نخيل · 🌿 مخلفات نخيل · 🌳 أغصان\n\n" +
      "سأخبرك إن كانت صالحة لإعادة التدوير، وأقترح ورشة مناسبة، أو أرشدك للتخلص الآمن."
    );
  }

  if (isNonRecyclable(t, cat)) {
    return (
      `${cat.emoji} ${cat.label} — غير صالح لإعادة التدوير ⚠️\n\n` +
      `${cat.badReason}\n\n` +
      `🌿 التخلص الآمن (يدعم الاستدامة):\n` +
      cat.safeDisposal.map((s) => `• ${s}`).join("\n") +
      workshopLine(cat.workshopId)
    );
  }

  return (
    `${cat.emoji} ${cat.label} — صالح لإعادة التدوير ✅\n\n` +
    `♻️ اقتراحات التدوير:\n` +
    cat.recyclableTips.map((s) => `• ${s}`).join("\n") +
    workshopLine(cat.workshopId)
  );
}

const CHAT_CATEGORY_CHIPS = [
  "زجاج",
  "ورق",
  "بلاستيك",
  "حديد",
  "سعف النخيل",
  "جريد نخيل",
  "أغصان أشجار",
] as const;

type ImageAnalysis = { query: string; label: string; confidence: number };

function guessFromFileName(name: string): ImageAnalysis | null {
  const n = name.toLowerCase();
  for (const cat of RECYCLE_CATEGORIES) {
    if (cat.keywords.some((k) => n.includes(k))) {
      return { query: cat.keywords[0], label: cat.label, confidence: 88 };
    }
  }
  return null;
}

function loadImageFromFile(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });
}

async function analyzeImageFile(file: File): Promise<ImageAnalysis> {
  const fromName = guessFromFileName(file.name);
  if (fromName) return fromName;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImageFromFile(url);
    const canvas = document.createElement("canvas");
    const size = 56;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { query: "سعف النخيل", label: "سعف النخيل", confidence: 55 };

    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let n = 0;
    let green = 0;
    let brown = 0;
    let gray = 0;
    let bright = 0;
    let colorful = 0;

    for (let i = 0; i < data.length; i += 4) {
      const pr = data[i];
      const pg = data[i + 1];
      const pb = data[i + 2];
      const a = data[i + 3];
      if (a < 100) continue;
      n++;
      const max = Math.max(pr, pg, pb);
      const min = Math.min(pr, pg, pb);
      const sat = max - min;
      const lum = (pr + pg + pb) / 3;
      if (pg > pr + 15 && pg > pb + 10 && sat > 18) green++;
      if (pr > 70 && pg > 50 && pb < 80 && pr >= pb) brown++;
      if (sat < 22 && lum > 35 && lum < 210) gray++;
      if (lum > 195 && sat < 35) bright++;
      if (sat > 55 && lum > 40) colorful++;
    }

    if (!n) return { query: "بلاستيك", label: "البلاستيك", confidence: 50 };

    const ratios: Record<string, number> = {
      palm: (green + brown * 1.2) / n,
      wood: (brown + green * 0.6) / n,
      metal: gray / n,
      paper: bright / n,
      plastic: colorful / n,
      glass: (bright * 0.45 + gray * 0.35) / n,
    };

    const bestId = Object.entries(ratios).sort((a, b) => b[1] - a[1])[0][0];
    const cat = RECYCLE_CATEGORIES.find((c) => c.id === bestId) ?? RECYCLE_CATEGORIES[4];
    const conf = Math.min(91, Math.max(57, Math.round(ratios[bestId] * 95 + 48)));

    return { query: cat.keywords[0], label: cat.label, confidence: conf };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function botReplyFromPhoto(analysis: ImageAnalysis) {
  return (
    `📸 نتيجة تحليل الصورة:\n` +
    `التوقع: ${analysis.label} (ثقة ~${analysis.confidence}%)\n\n` +
    `💡 إن كان التوقع غير دقيق، اكتب الوصف يدوياً بالأسفل.\n\n` +
    botReply(analysis.query)
  );
}

// ─── HRDA-style geometric SVG decoration ─────────────────────────────────────
function HexPattern({ color = "#ffffff", opacity = 0.05 }: { color?: string; opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={`hex-${color.replace("#","")}`} x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon points="30,2 58,17 58,47 30,62 2,47 2,17" fill="none" stroke={color} strokeWidth="0.8"/>
          <circle cx="30" cy="26" r="2" fill={color}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#hex-${color.replace("#","")})`}/>
    </svg>
  );
}

function GoldLine() {
  return <div className="h-0.5 w-12" style={{ background: GOLD }} />;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function Badge({ status, color }: { status: string; color: string }) {
  const m: Record<string,string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const d: Record<string,string> = { green:"bg-emerald-500", blue:"bg-sky-500", amber:"bg-amber-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold border ${m[color]||m.blue}`} style={{fontFamily:F}}>
      <span className={`w-1.5 h-1.5 rounded-full ${d[color]||d.blue}`}/>
      {status}
    </span>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ items }: { items: { label:string; onClick?:()=>void }[] }) {
  return (
    <nav dir="rtl" className="flex items-center gap-1 text-xs py-3" style={{color:"var(--muted-foreground)",fontFamily:F}}>
      {items.map((item,i)=>(
        <span key={i} className="flex items-center gap-1">
          {i>0 && <ChevronLeft size={12} className="opacity-40 rotate-180"/>}
          {item.onClick
            ? <button onClick={item.onClick} className="hover:underline" style={{color:G}}>{item.label}</button>
            : <span style={{color:"var(--foreground)",fontWeight:700}}>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

// ─── Shared Button ────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant="primary", type="button", disabled=false, className="" }:{
  children:React.ReactNode; onClick?:()=>void;
  variant?:"primary"|"secondary"|"outline"|"ghost"|"gold";
  type?:"button"|"submit"; disabled?:boolean; className?:string;
}) {
  const v: Record<string,string> = {
    primary: `text-white hover:opacity-90 shadow-sm`,
    secondary: `text-white hover:opacity-90 shadow-sm`,
    outline: `border text-white hover:opacity-80`,
    ghost: `hover:opacity-80`,
    gold: `text-white hover:opacity-90 shadow-sm`,
  };
  const bg: Record<string,string> = {
    primary: G, secondary: "#5A3A1A", outline: "transparent",
    ghost: "transparent", gold: GOLD,
  };
  const border: Record<string,string> = {
    primary:"transparent", secondary:"transparent",
    outline:"rgba(255,255,255,0.4)", ghost:"transparent", gold:"transparent",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm text-sm font-bold transition-all disabled:opacity-40 ${v[variant]} ${className}`}
      style={{fontFamily:F, background:bg[variant], borderColor:border[variant], border: variant==="outline"?`1px solid ${border[variant]}`:"none"}}>
      {children}
    </button>
  );
}

// ─── Form Fields ─────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }:{ label:string; required?:boolean; children:React.ReactNode; hint?:string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold" style={{fontFamily:F,color:"var(--foreground)"}}>
        {label}{required && <span className="mr-1" style={{color:"#B91C1C"}}>*</span>}
      </label>
      {children}
      {hint && <p className="text-xs" style={{fontFamily:F,color:"var(--muted-foreground)"}}>{hint}</p>}
    </div>
  );
}

function TInput({ placeholder, value, onChange, type="text" }:{ placeholder?:string; value:string; onChange:(v:string)=>void; type?:string }) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all rounded-sm"
      style={{fontFamily:F,background:"var(--input-background)",borderColor:"var(--border)",color:"var(--foreground)"}}/>
  );
}

function TSelect({ value, onChange, options }:{ value:string; onChange:(v:string)=>void; options:string[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm border appearance-none focus:outline-none focus:ring-2 transition-all rounded-sm"
        style={{fontFamily:F,background:"var(--input-background)",borderColor:"var(--border)",color:"var(--foreground)"}}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--muted-foreground)"}}/>
    </div>
  );
}

function AlertBox({ msg, variant="info" }:{ msg:string; variant?:"info"|"success"|"warning" }) {
  const s = {
    info:{ cls:"bg-sky-50 border-sky-200 text-sky-800", icon:<Info size={14}/> },
    success:{ cls:"bg-emerald-50 border-emerald-200 text-emerald-800", icon:<CheckCircle size={14}/> },
    warning:{ cls:"bg-amber-50 border-amber-200 text-amber-800", icon:<AlertCircle size={14}/> },
  }[variant];
  return (
    <div className={`flex gap-2 p-3 rounded-sm border text-sm ${s.cls}`} style={{fontFamily:F}}>
      <span className="flex-shrink-0 mt-0.5">{s.icon}</span>
      <span>{msg}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HEADER — HRDA style: white top, green identity bar
// ═══════════════════════════════════════════════════════════════
function Header({ page, setPage, loggedIn, setLoggedIn }:{
  page:Page; setPage:(p:Page)=>void; loggedIn:boolean; setLoggedIn:(v:boolean)=>void;
}) {
  const [mob, setMob] = useState(false);

  const nav = [
    { label:"الرئيسية", p:"home" as Page },
    { label:"الخدمات", p:"service" as Page },
    { label:"الورش التدريبية", p:"workshops" as Page },
  ];

  const dashTabs = [
    { label:"معلوماتي", p:"dashboard" as Page },
    { label:"ورشاتي", p:"dashboard" as Page },
    { label:"طلباتي", p:"dashboard" as Page },
  ];

  return (
    <header dir="rtl" className="sticky top-0 z-50 w-full" style={{fontFamily:F}}>
      {/* ── Utility strip ── */}
      <div className="h-8 flex items-center border-b" style={{background:"#F8FAF8",borderColor:"var(--border)"}}>
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs" style={{color:"var(--muted-foreground)"}}>
            <span className="flex items-center gap-1"><Shield size={10} style={{color:G}}/> بوابة موثوقة</span>
            <span className="hidden sm:flex items-center gap-1"><Globe size={10} style={{color:G}}/> حائل – المملكة العربية السعودية</span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{color:"var(--muted-foreground)"}}>
            <button className="hover:underline transition-colors">English</button>
            <span style={{color:"var(--border)"}}>|</span>
            <button className="flex items-center gap-1 hover:underline"><Phone size={10}/> ٩٢٠٠٠١٢٣٤</button>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <div className="bg-white border-b shadow-sm" style={{borderColor:"var(--border)"}}>
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between gap-4 py-2">
          {/* Brand */}
          <button onClick={()=>setPage("home")} className="flex items-center gap-3 flex-shrink-0 hover:opacity-90 transition-opacity">
            <ImageWithFallback src={platformLogo} alt="عَود" className="h-14 w-auto object-contain"/>
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-xs" style={{color:"var(--muted-foreground)"}}>منصة عَوُد السعودية</div>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0">
            {nav.map(n=>(
              <button key={n.p} onClick={()=>setPage(n.p)}
                className="relative px-4 py-5 text-sm font-semibold transition-all group"
                style={{color:page===n.p?G:"var(--foreground)",fontFamily:F}}>
                {n.label}
                <span className="absolute bottom-0 inset-x-0 h-0.5 transition-all" style={{background:GOLD,transform:page===n.p?"scaleX(1)":"scaleX(0)",transformOrigin:"right"}}/>
                <span className="absolute bottom-0 inset-x-0 h-0.5 transition-all opacity-0 group-hover:opacity-100 group-hover:scaleX-1" style={{background:`${GOLD}60`}}/>
              </button>
            ))}
          </nav>

          {/* Auth + Tabs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {loggedIn ? (
              <>
                {/* Dashboard tabs pill */}
                <div className="hidden lg:flex items-center rounded-sm border overflow-hidden" style={{borderColor:"var(--border)"}}>
                  {dashTabs.map((t,i)=>(
                    <button key={t.label} onClick={()=>setPage(t.p)}
                      className="px-3 py-1.5 text-xs font-bold transition-all border-l first:border-l-0"
                      style={{fontFamily:F,borderColor:"var(--border)",background:page===t.p?G:"white",color:page===t.p?"white":"var(--foreground)"}}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <button className="p-2 rounded-sm border transition-all hover:bg-gray-50" style={{borderColor:"var(--border)"}}>
                  <Bell size={16} style={{color:"var(--muted-foreground)"}}/>
                </button>
                <button onClick={()=>{setLoggedIn(false);setPage("home");}}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all hover:bg-gray-50"
                  style={{fontFamily:F,borderColor:"var(--border)",color:"var(--foreground)"}}>
                  <LogOut size={13}/> خروج
                </button>
              </>
            ):(
              <button onClick={()=>setPage("login")}
                className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold text-white shadow-sm transition-all hover:opacity-90"
                style={{fontFamily:F,background:G}}>
                <LogIn size={15}/> تسجيل الدخول
              </button>
            )}
            <button className="md:hidden p-2 rounded-sm border" style={{borderColor:"var(--border)"}} onClick={()=>setMob(!mob)}>
              {mob?<X size={18}/>:<Menu size={18}/>}
            </button>
          </div>
        </div>

        {/* Gold accent line under header */}
        <div className="h-0.5 w-full" style={{background:`linear-gradient(90deg, ${G} 0%, ${GOLD} 50%, ${G} 100%)`}}/>
      </div>

      {/* Mobile menu */}
      {mob && (
        <div className="md:hidden bg-white border-b shadow-lg px-4 py-3 space-y-1" style={{borderColor:"var(--border)"}}>
          {nav.map(n=>(
            <button key={n.p} onClick={()=>{setPage(n.p);setMob(false);}}
              className="w-full text-right px-3 py-2.5 rounded-sm text-sm font-semibold transition-all border-r-2"
              style={{fontFamily:F,borderColor:page===n.p?G:"transparent",background:page===n.p?`${G}08`:"transparent",color:page===n.p?G:"var(--foreground)"}}>
              {n.label}
            </button>
          ))}
          {loggedIn && dashTabs.map(t=>(
            <button key={t.label} onClick={()=>{setPage(t.p);setMob(false);}}
              className="w-full text-right px-3 py-2.5 rounded-sm text-sm transition-all"
              style={{fontFamily:F,color:"var(--muted-foreground)"}}>
              — {t.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER — dark green, multi-column, HRDA style
// ═══════════════════════════════════════════════════════════════
function Footer({ setPage, onOpenChat }:{ setPage:(p:Page)=>void; onOpenChat:()=>void }) {
  return (
    <footer dir="rtl" style={{fontFamily:F,background:GD}}>
      {/* Gold top line */}
      <div className="h-1" style={{background:`linear-gradient(90deg, ${GD}, ${GOLD}, ${GD})`}}/>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand col */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ImageWithFallback src={platformLogo} alt="عَود" className="w-11 h-11 object-contain"/>
              <span className="font-black text-xl text-white" style={{fontFamily:F}}>عَود</span>
            </div>
            <p className="text-xs leading-relaxed" style={{color:"#7A9A7A"}}>منصة إعادة تدوير مخلفات النخيل والأشجار. مبادرة من منطقة حائل لدعم الاستدامة الزراعية ورؤية 2030.</p>
            {/* Social */}
            <div className="flex gap-2 mt-4">
              {["𝕏","in","f","▶"].map(s=>(
                <div key={s} className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold transition-all hover:opacity-80 cursor-pointer" style={{background:"rgba(255,255,255,0.08)",color:"#A8C490"}}>
                  {s}
                </div>
              ))}
            </div>
          </div>
          {/* Links */}
          {[
            { title:"الخدمات", links:[{l:"إزالة المخلفات",p:"service" as Page},{l:"الورش التدريبية",p:"workshops" as Page},{l:"المساعد الذكي",chat:true}] },
            { title:"حسابي", links:[{l:"معلوماتي",p:"dashboard"},{l:"طلباتي",p:"dashboard"},{l:"ورشاتي",p:"dashboard"}] },
            { title:"تواصل معنا", links:[], extra:["📞 920001234","✉️ support@aoud.sa","📍 حائل، المملكة العربية السعودية"] },
          ].map(col=>(
            <div key={col.title}>
              <h4 className="font-black text-sm mb-4 pb-2 border-b" style={{color:GOLD,borderColor:"rgba(255,255,255,0.1)"}}>
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links?.map(l=>(
                  <li key={l.l}>
                    {"chat" in l && l.chat ? (
                      <button onClick={onOpenChat} className="text-xs hover:text-white transition-colors flex items-center gap-1.5" style={{color:"#7A9A7A"}}>
                        <span style={{color:GOLD,fontSize:"0.5rem"}}>◆</span> {l.l}
                      </button>
                    ) : (
                      <button onClick={()=>setPage(l.p as Page)} className="text-xs hover:text-white transition-colors flex items-center gap-1.5" style={{color:"#7A9A7A"}}>
                        <span style={{color:GOLD,fontSize:"0.5rem"}}>◆</span> {l.l}
                      </button>
                    )}
                  </li>
                ))}
                {col.extra?.map(e=><li key={e} className="text-xs" style={{color:"#7A9A7A"}}>{e}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{borderColor:"rgba(255,255,255,0.08)"}}>
          <span className="text-xs" style={{color:"#4A6A4A"}}>جميع الحقوق محفوظة © 2026 – فريق صقور طويق</span>
          <div className="flex gap-4">
            {["سياسة الخصوصية","شروط الاستخدام","إمكانية الوصول"].map(l=>(
              <button key={l} className="text-xs hover:text-white transition-colors" style={{color:"#4A6A4A"}}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME PAGE — full HRDA-style
// ═══════════════════════════════════════════════════════════════
function HomePage({ setPage, onOpenChat }:{ setPage:(p:Page)=>void; onOpenChat:()=>void }) {
  const [serviceRegion, setServiceRegion] = useState<RegionId | null>(null);
  const cities = serviceRegion ? REGION_CITIES[serviceRegion] : ALL_CITIES;
  const regionTitle =
    serviceRegion === "hail" ? "نخدم منطقة حائل" :
    serviceRegion === "qassim" ? "نخدم منطقة القصيم" :
    "نخدم حائل والقصيم";
  const regionAccent = serviceRegion === "qassim" ? QASSIM : G;

  return (
    <div dir="rtl" style={{fontFamily:F}}>

      {/* ══ HERO — بانر رسمي 1920×560 ══ */}
      <section className={`relative overflow-hidden w-full ${HERO_BANNER}`}>
        {/* BG photo */}
        <div className="absolute inset-0" style={{background:GD}}>
          <ImageWithFallback
            src={storyBg}
            alt="مزارع نخيل حائل"
            className="w-full h-full"
            style={{objectFit:"cover",objectPosition:"center center",display:"block"}}
          />
          <div className="absolute inset-0" style={{background:`linear-gradient(105deg, ${GD}D9 0%, ${GD}B3 42%, ${GD}80 72%, ${GD}59 100%)`}}/>
        </div>
        <HexPattern color="#ffffff" opacity={0.03}/>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-sm text-xs font-bold" style={{background:GOLD,color:GD}}>
              <Leaf size={11}/> رؤية 2030 · الاقتصاد الأخضر · حائل
            </div>
            <h1 className="text-white font-black mb-3 leading-snug" style={{fontSize:"clamp(1.75rem,3.5vw,2.5rem)",fontFamily:F}}>
              قصة مشوار عَود
            </h1>
            <div className="h-1 w-16 mb-4 rounded-full" style={{background:GOLD}}/>
            <p className="text-sm leading-relaxed mb-6 line-clamp-3 sm:line-clamp-none" style={{color:"#C4D9B4",maxWidth:"32rem"}}>
              انبثقت فكرة منصة عَود من أبناء مؤمنين بأن لنا حقًا في صون تراثنا وطبيعتنا بأفضل صورة، وأن نمنح الأجيال القادمة بيئة أكثر استدامة. جاءت المنصة لتحويل مخلفات النخيل والأشجار إلى سماد طبيعي، وتمكين المزارعين بحلول تقنية وتدريبية، في انسجام مع رؤية السعودية 2030 نحو اقتصاد أخضر وتحول رقمي واعٍ.
            </p>
            <div className="flex flex-wrap gap-3">
              <Btn onClick={()=>setPage("service")} variant="gold">
                <Recycle size={16}/> طلب خدمة الإزالة
              </Btn>
              <Btn onClick={()=>setPage("workshops")} variant="outline">
                <BookOpen size={16}/> الورش التدريبية
              </Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR – seamless below hero ══ */}
      <section className="relative" style={{background:G}}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-x-reverse" style={{divideColor:"rgba(255,255,255,0.15)"}}>
            {[
              {n:"١٢٠٠",unit:"+",l:"مزارع مستفيد",icon:<User size={20}/>},
              {n:"٤٨٠",unit:"ط",l:"سماد عضوي منتج",icon:<Sprout size={20}/>},
              {n:"٣٦",unit:"",l:"ورشة تدريبية",icon:<BookOpen size={20}/>},
              {n:"٩٨",unit:"٪",l:"رضا المستفيدين",icon:<Award size={20}/>},
            ].map(s=>(
              <div key={s.l} className="px-6 py-2 text-center border-r border-white/15 first:border-r-0">
                <div className="flex justify-center mb-2" style={{color:`${GOLD}`}}>{s.icon}</div>
                <div className="font-black text-3xl text-white" style={{fontFamily:F}}>{s.n}<span style={{color:GOLD}}>{s.unit}</span></div>
                <div className="text-xs mt-1" style={{color:"#A8C490"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold mb-2" style={{color:GOLD}}>● خدماتنا الإلكترونية</p>
            <h2 className="font-black text-2xl" style={{fontFamily:F,color:"var(--foreground)"}}>ماذا تحتاج اليوم؟</h2>
            <div className="h-0.5 w-10 mt-2 rounded-full" style={{background:G}}/>
          </div>
          <button className="hidden sm:flex items-center gap-1.5 text-sm font-bold hover:underline" style={{color:G,fontFamily:F}}>
            عرض الكل <ArrowLeft size={14} className="rotate-180"/>
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {icon:<Recycle size={28}/>,title:"إزالة مخلفات النخيل",desc:"فريق متخصص يزور مزرعتك ويحوّل المخلفات إلى سماد عضوي طبيعي مجاناً.",cta:"تقديم طلب",p:"service" as Page},
            {icon:<BookOpen size={28}/>,title:"الورش التدريبية",desc:"دورات عملية لإعادة التدوير والحرف اليدوية وإدارة مخلفات المزارع.",cta:"استعرض الورش",p:"workshops" as Page},
            {icon:<MessageCircle size={28}/>,title:"المساعد الذكي",desc:"صوّر أو اكتب عن المخلفات لديك واحصل على توصيات إعادة التدوير فوراً.",cta:"ابدأ المحادثة",chat:true},
          ].map(s=>(
            <button key={s.title} onClick={()=>"chat" in s && s.chat ? onOpenChat() : setPage((s as {p:Page}).p)}
              className="text-right group relative bg-white border hover:shadow-lg transition-all overflow-hidden rounded-sm"
              style={{borderColor:"var(--border)"}}>
              {/* Top green bar */}
              <div className="h-1" style={{background:G,transition:"height 0.2s"}}/>
              <div className="p-6">
                <div className="w-14 h-14 rounded-sm mb-5 flex items-center justify-center transition-all" style={{background:`${G}12`,color:G}}>
                  {s.icon}
                </div>
                <h3 className="font-black text-base mb-2 group-hover:text-primary transition-colors" style={{fontFamily:F,color:"var(--foreground)"}}>{s.title}</h3>
                <p className="text-xs leading-relaxed mb-5" style={{color:"var(--muted-foreground)",fontFamily:F}}>{s.desc}</p>
                <div className="flex items-center gap-1 text-xs font-bold" style={{color:G,fontFamily:F}}>
                  {s.cta} <ArrowLeft size={13} className="rotate-180"/>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ══ LOCATION SECTION ══ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text side */}
          <div>
            <p className="text-xs font-bold mb-2" style={{color:GOLD}}>● نطاق الخدمة</p>
            <h2 className="font-black text-2xl mb-2 transition-all" style={{fontFamily:F,color:"var(--foreground)"}}>{regionTitle}</h2>
            <div className="h-0.5 w-10 mb-4 rounded-full transition-all" style={{background:regionAccent}}/>
            <p className="text-sm leading-loose mb-6" style={{color:"var(--muted-foreground)",fontFamily:F}}>
              {serviceRegion === "hail"
                ? "تغطي منصة عَود محافظات منطقة حائل. اضغط على المنطقة في الخريطة لعرض المدن، وفريقنا يصل إلى مزرعتك لإزالة مخلفات النخيل والأشجار."
                : serviceRegion === "qassim"
                ? "تغطي منصة عَود محافظات منطقة القصيم. اضغط على المنطقة في الخريطة لعرض المدن، وفريقنا يصل إلى مزرعتك لإزالة مخلفات النخيل والأشجار."
                : "تغطي منصة عَود محافظات منطقتي حائل والقصيم. اضغط على أي منطقة في الخريطة لعرض المدن، وفريقنا يصل إلى مزرعتك لإزالة مخلفات النخيل والأشجار وتحويلها إلى سماد عضوي."}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {cities.map(c=>(
                <div key={c.l} className="flex items-center gap-2 text-sm px-3 py-2 rounded-sm border transition-all" style={{borderColor:"var(--border)",background:"var(--card)",fontFamily:F,color:"var(--foreground)"}}>
                  <span>{c.icon}</span>
                  <span className="font-semibold">{c.l}</span>
                  <CheckCircle size={13} className="mr-auto" style={{color:c.c}}/>
                </div>
              ))}
            </div>
            <button onClick={()=>setPage("service")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-black text-white transition-all hover:opacity-90"
              style={{background:G,fontFamily:F}}>
              <MapPin size={15}/> قدّم طلبك الآن
            </button>
          </div>

          {/* Map side */}
          <div className="relative">
            <div className="relative rounded-sm overflow-hidden border shadow-lg" style={{borderColor:"var(--border)"}}>
              {/* Decorative header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{borderColor:"var(--border)",background:GD}}>
                <div className="w-2.5 h-2.5 rounded-full" style={{background:GOLD}}/>
                <div className="w-2.5 h-2.5 rounded-full" style={{background:`${GOLD}80`}}/>
                <div className="w-2.5 h-2.5 rounded-full" style={{background:`${GOLD}40`}}/>
                <span className="mr-2 text-xs font-bold" style={{color:"rgba(255,255,255,0.6)",fontFamily:F}}>خريطة حائل والقصيم</span>
              </div>
              {/* Interactive map */}
              <div className="relative p-2" style={{background:"#f8faf8"}}>
                <HailMap height={360} onRegionChange={setServiceRegion} />
              </div>
              <div className="h-1" style={{background:`linear-gradient(90deg,${G},${GOLD},${G})`}}/>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WORKSHOPS PREVIEW ══ */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold mb-2" style={{color:GOLD}}>● تعلّم وطوّر مهاراتك</p>
            <h2 className="font-black text-2xl" style={{fontFamily:F,color:"var(--foreground)"}}>أبرز الورش القادمة</h2>
            <div className="h-0.5 w-10 mt-2 rounded-full" style={{background:G}}/>
          </div>
          <button onClick={()=>setPage("workshops")}
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold hover:underline" style={{color:G,fontFamily:F}}>
            كل الورش <ArrowLeft size={14} className="rotate-180"/>
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKSHOPS.slice(0,3).map(w=>(
            <div key={w.id} className="bg-white border rounded-sm overflow-hidden hover:shadow-md transition-all" style={{borderColor:"var(--border)"}}>
              <div className="h-1.5" style={{background:GOLD}}/>
              <div className="p-5">
                <span className="text-2xl">{w.emoji}</span>
                <h3 className="font-bold text-sm mt-2 mb-1" style={{fontFamily:F,color:"var(--foreground)"}}>{w.title}</h3>
                <p className="text-xs leading-relaxed mb-3" style={{color:"var(--muted-foreground)",fontFamily:F}}>{w.desc}</p>
                <div className="flex flex-col gap-1 text-xs mb-4" style={{color:"var(--muted-foreground)"}}>
                  <span className="flex items-center gap-1.5"><Calendar size={11} style={{color:G}}/>{w.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={11} style={{color:G}}/>{w.location.split("–")[0]}</span>
                </div>
                <button onClick={()=>setPage("workshops")}
                  className="w-full py-2 rounded-sm text-xs font-bold border transition-all hover:opacity-90"
                  style={{fontFamily:F,borderColor:G,color:G}}>
                  سجّل الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ GREEN CTA BAND – below workshops ══ */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0" style={{background:GD}}>
          <ImageWithFallback
            src={ctaBg}
            alt="مزارع نخيل حائل"
            className="w-full h-full"
            style={{objectFit:"cover",objectPosition:"center",display:"block"}}
          />
          <div className="absolute inset-0" style={{background:`linear-gradient(105deg, ${GD}EE 0%, ${GD}CC 40%, ${G}AA 70%, ${G}88 100%)`}}/>
        </div>
        <HexPattern color="#ffffff" opacity={0.03}/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{color:GOLD}}>
              <span className="inline-block w-6 h-px" style={{background:GOLD}}/> التزامنا بالاستدامة
            </p>
            <h2 className="font-black text-white leading-snug mb-3" style={{fontFamily:F, fontSize:"clamp(1.4rem,3vw,2rem)"}}>
              من النخلة إلى الأرض… دورة حياة مكتملة 🌴
            </h2>
            <div className="h-0.5 w-12 mb-4 rounded-full" style={{background:GOLD}}/>
            <p className="text-sm leading-loose" style={{color:"#C4D9B4",fontFamily:F}}>
              كل طن مُعالَج يُوفّر حرق ٨٠٠ كجم من الكربون ويُغني التربة بمغذيات طبيعية تدوم ثلاث سنوات، مما يُقلّل تكلفة السماد الكيميائي بنسبة 65٪.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <Btn onClick={()=>setPage("service")} variant="gold" className="!px-7 !py-3 text-base">
              <TrendingUp size={16}/> سجّل الآن مجاناً
            </Btn>
            <p className="text-xs" style={{color:"rgba(255,255,255,0.5)",fontFamily:F}}>خدمة مجانية لمزارعي حائل</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
function LoginPage({ setLoggedIn, setPage }:{ setLoggedIn:(v:boolean)=>void; setPage:(p:Page)=>void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  return (
    <div dir="rtl" className="min-h-screen flex" style={{fontFamily:F}}>
      {/* Left panel – brand */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden" style={{background:GD}}>
        <HexPattern color="#ffffff" opacity={0.04}/>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <ImageWithFallback src={platformLogo} alt="عَود" className="w-12 h-12 object-contain"/>
            <span className="font-black text-2xl text-white" style={{fontFamily:F}}>عَود</span>
          </div>
          <div className="h-0.5 w-12 mb-6 rounded-full" style={{background:GOLD}}/>
          <h2 className="font-black text-white text-2xl mb-4 leading-snug" style={{fontFamily:F}}>منصة إعادة تدوير مخلفات النخيل</h2>
          <p className="text-sm leading-loose" style={{color:"#7A9A7A"}}>حلول تقنية مستدامة لمزارعي حائل. تحويل المخلفات إلى قيمة مضافة، بما يحقق أهداف رؤية 2030.</p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[["١٢٠٠+","مزارع مستفيد"],["٤٨٠ط","سماد منتج"]].map(([n,l])=>(
            <div key={l} className="rounded-sm p-4 text-center" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
              <div className="font-black text-xl" style={{color:GOLD,fontFamily:F}}>{n}</div>
              <div className="text-xs mt-1" style={{color:"#7A9A7A"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{background:"var(--background)"}}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <ImageWithFallback src={platformLogo} alt="عَود" className="w-12 h-12 object-contain"/>
            <span className="font-black text-2xl" style={{color:G,fontFamily:F}}>عَود</span>
          </div>

          <div className="bg-white rounded-sm border shadow-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
            <div className="h-1" style={{background:`linear-gradient(90deg,${G},${GOLD})`}}/>
            <div className="p-7">
              <h1 className="font-black text-lg mb-1" style={{fontFamily:F,color:"var(--foreground)"}}>تسجيل الدخول</h1>
              <p className="text-xs mb-6" style={{color:"var(--muted-foreground)",fontFamily:F}}>أدخل بياناتك للوصول إلى منصة عَود</p>

              <form onSubmit={e=>{e.preventDefault();user.trim()&&pass.trim()?(setLoggedIn(true),setPage("dashboard")):setErr("يرجى إدخال جميع البيانات");}} className="space-y-4">
                <Field label="اسم المستخدم" required>
                  <TInput placeholder="أدخل اسم المستخدم" value={user} onChange={setUser}/>
                </Field>
                <Field label="كلمة المرور" required>
                  <TInput placeholder="••••••••" value={pass} onChange={setPass} type="password"/>
                </Field>
                {err && <AlertBox msg={err} variant="warning"/>}
                <button type="submit" className="w-full py-2.5 rounded-sm text-sm font-black text-white transition-all hover:opacity-90 shadow"
                  style={{background:G,fontFamily:F}}>
                  دخول
                </button>
              </form>

              <div className="text-center text-xs mt-4" style={{color:"var(--muted-foreground)",fontFamily:F}}>
                ليس لديك حساب؟ <button className="font-bold hover:underline" style={{color:G}}>إنشاء حساب جديد</button>
              </div>
              <div className="mt-4 pt-4 border-t text-center text-xs" style={{borderColor:"var(--border)",color:"var(--muted-foreground)",fontFamily:F}}>
                يمكنك الدخول بأي بيانات للتجربة
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function DashboardPage({ tab, setTab, setPage }:{ tab:string; setTab:(t:string)=>void; setPage:(p:Page)=>void }) {
  const tabs = [{id:"info",label:"معلوماتي",icon:<User size={14}/>},{id:"workshops",label:"ورشاتي",icon:<BookOpen size={14}/>},{id:"orders",label:"طلباتي",icon:<ClipboardList size={14}/>}];
  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 py-6" style={{fontFamily:F}}>
      <Breadcrumb items={[{label:"الرئيسية",onClick:()=>setPage("home")},{label:"حسابي"}]}/>

      {/* Profile banner */}
      <div className="relative rounded-sm overflow-hidden mb-6 shadow-sm">
        <div className="absolute inset-0" style={{background:`linear-gradient(135deg,${GD},${G})`}}/>
        <HexPattern color="#ffffff" opacity={0.04}/>
        <div className="h-1" style={{background:GOLD}}/>
        <div className="relative z-10 px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-sm flex items-center justify-center text-2xl border-2" style={{background:"rgba(255,255,255,0.15)",borderColor:"rgba(255,255,255,0.25)"}}>👨‍🌾</div>
          <div>
            <h2 className="font-black text-white" style={{fontFamily:F}}>عبدالرحمن محمد الشمري</h2>
            <p className="text-xs mt-0.5" style={{color:"#A8C490"}}>مزارع · حائل · عضو منذ 2024</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {l:"طلبات مكتملة",v:"١٢",icon:<CheckCircle size={16}/>,c:"#2E7D52"},
          {l:"أطنان سماد",v:"٨.٤",icon:<Sprout size={16}/>,c:G},
          {l:"ورش حضرتها",v:"٥",icon:<BookOpen size={16}/>,c:"#8B5E1A"},
          {l:"نقاط الاستدامة",v:"٤٢٠",icon:<Award size={16}/>,c:GOLD},
        ].map(s=>(
          <div key={s.l} className="bg-white border rounded-sm p-4 shadow-sm" style={{borderColor:"var(--border)"}}>
            <div className="mb-2" style={{color:s.c}}>{s.icon}</div>
            <div className="font-black text-2xl" style={{fontFamily:F,color:"var(--foreground)"}}>{s.v}</div>
            <div className="text-xs mt-0.5" style={{color:"var(--muted-foreground)",fontFamily:F}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border rounded-sm shadow-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
        <div className="h-0.5" style={{background:G}}/>
        <div className="border-b flex overflow-x-auto" style={{borderColor:"var(--border)"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all"
              style={{borderColor:tab===t.id?GOLD:"transparent",color:tab===t.id?G:"var(--muted-foreground)",background:tab===t.id?`${G}06`:"transparent",fontFamily:F}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab==="info" && (
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {title:"البيانات الشخصية",rows:[["الاسم الكامل","عبدالرحمن محمد الشمري"],["رقم الهوية","١٠١٢٣٤٥٦٧٨"],["الجوال","٠٥٠ ١٢٣ ٤٥٦٧"],["البريد","alshammari@example.sa"]]},
                {title:"بيانات المزرعة",rows:[["اسم المزرعة","مزرعة الشمري"],["الموقع","حائل، طريق الملك عبدالعزيز"],["المساحة","٢٠ هكتار"],["عدد النخيل","٨٥٠ نخلة"]]},
              ].map(sec=>(
                <div key={sec.title} className="border rounded-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
                  <div className="px-4 py-2.5 border-b font-bold text-sm" style={{background:"var(--muted)",borderColor:"var(--border)",fontFamily:F,color:"var(--foreground)"}}>{sec.title}</div>
                  <div className="divide-y" style={{divideColor:"var(--border)"}}>
                    {sec.rows.map(([k,v])=>(
                      <div key={k} className="flex justify-between items-center px-4 py-2.5 text-sm border-b last:border-b-0" style={{borderColor:"var(--border)"}}>
                        <span style={{color:"var(--muted-foreground)",fontFamily:F}}>{k}</span>
                        <span style={{fontWeight:700,color:"var(--foreground)",fontFamily:F}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab==="workshops" && (
            <div className="space-y-3">
              <AlertBox msg="يمكنك متابعة الورش المسجل فيها والمواد التدريبية من هنا." variant="info"/>
              {WORKSHOPS.slice(0,3).map(w=>(
                <div key={w.id} className="flex items-center gap-4 border rounded-sm p-4" style={{borderColor:"var(--border)"}}>
                  <span className="text-2xl">{w.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate" style={{color:"var(--foreground)",fontFamily:F}}>{w.title}</h4>
                    <div className="flex gap-3 mt-1 text-xs" style={{color:"var(--muted-foreground)"}}>
                      <span className="flex items-center gap-1"><Calendar size={10} style={{color:G}}/>{w.date}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} style={{color:G}}/>{w.location.split("–")[0]}</span>
                    </div>
                  </div>
                  <Badge status={w.id===1?"مسجّل":"مهتم"} color={w.id===1?"green":"blue"}/>
                </div>
              ))}
            </div>
          )}
          {tab==="orders" && (
            <div className="space-y-3">
              {ORDERS.map(o=>(
                <div key={o.id} className="border rounded-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
                  <div className="flex items-center justify-between px-4 py-2 border-b" style={{background:"var(--muted)",borderColor:"var(--border)"}}>
                    <span className="font-mono text-xs" style={{color:"var(--muted-foreground)"}}>{o.id}</span>
                    <Badge status={o.status} color={o.sc}/>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    {[["نوع المخلفات",o.type],["الكمية",o.weight],["السماد المتوقع",o.fertilizer]].map(([k,v])=>(
                      <div key={k} className="px-4 py-3 border-l last:border-l-0" style={{borderColor:"var(--border)"}}>
                        <div className="text-xs mb-0.5" style={{color:"var(--muted-foreground)",fontFamily:F}}>{k}</div>
                        <div style={{fontWeight:700,color:k==="السماد المتوقع"?G:"var(--foreground)",fontFamily:F}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SERVICE PAGE
// ═══════════════════════════════════════════════════════════════
function ServicePage() {
  const [location,setLocation]=useState("");
  const [wasteType,setWasteType]=useState("سعف نخيل");
  const [tons,setTons]=useState("");
  const [notes,setNotes]=useState("");
  const [calc,setCalc]=useState<{min:number;max:number}|null>(null);
  const [step,setStep]=useState(1);
  const [done,setDone]=useState(false);

  function doCalc(){const t=parseFloat(tons);if(!isNaN(t)&&t>0)setCalc({min:+(t*0.5).toFixed(2),max:+(t*0.7).toFixed(2)});}

  if(done) return (
    <div dir="rtl" className="max-w-xl mx-auto px-4 py-14" style={{fontFamily:F}}>
      <div className="bg-white border rounded-sm shadow-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
        <div className="h-1" style={{background:"#2E7D52"}}/>
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{background:"#E8F5EC",border:"2px solid #86CFB0"}}>
            <CheckCircle size={32} style={{color:"#2E7D52"}}/>
          </div>
          <h2 className="font-black text-lg mb-2" style={{fontFamily:F,color:"var(--foreground)"}}>تم إرسال طلبك بنجاح!</h2>
          <p className="text-sm mb-5" style={{color:"var(--muted-foreground)",fontFamily:F}}>سيتواصل معك فريقنا خلال ٢٤ ساعة</p>
          <div className="border rounded-sm p-4 text-sm text-right mb-5 space-y-2" style={{background:"var(--muted)",borderColor:"var(--border)"}}>
            {[["رقم الطلب","SRV-2025-00289"],["النوع",wasteType],["الكمية",`${tons} طن`],...(calc?[["السماد المتوقع",`${calc.min}–${calc.max} طن`]]:[])]
              .map(([k,v])=>(
                <div key={k} className="flex justify-between"><span style={{color:"var(--muted-foreground)"}}>{k}</span><span style={{fontWeight:700}}>{v}</span></div>
              ))}
          </div>
          <button onClick={()=>{setDone(false);setStep(1);setTons("");setCalc(null);setLocation("");}}
            className="px-6 py-2.5 rounded-sm text-sm font-bold text-white" style={{background:G,fontFamily:F}}>
            تقديم طلب جديد
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 py-6" style={{fontFamily:F}}>
      <Breadcrumb items={[{label:"الرئيسية"},{label:"الخدمات"},{label:"إزالة مخلفات النخيل"}]}/>
      {/* Page title */}
      <div className="mb-6 pb-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3" style={{borderColor:"var(--border)"}}>
        <div>
          <div className="h-0.5 w-8 mb-2 rounded-full" style={{background:GOLD}}/>
          <h1 className="font-black text-xl" style={{fontFamily:F,color:"var(--foreground)"}}>خدمة إزالة مخلفات النخيل والأشجار</h1>
          <p className="text-sm mt-1" style={{color:"var(--muted-foreground)",fontFamily:F}}>فريق متخصص يزور مزرعتك ويحوّل المخلفات إلى سماد عضوي طبيعي</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-sm border" style={{background:"var(--muted)",borderColor:"var(--border)",color:"var(--muted-foreground)"}}>
          <Shield size={12} style={{color:G}}/> خدمة مجانية للمزارعين
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto">
        {["بيانات الطلب","الحساب الذكي","المراجعة والإرسال"].map((s,i)=>(
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-bold whitespace-nowrap"
              style={{background:step===i+1?G:step>i+1?"#E8F5EC":"var(--muted)",color:step===i+1?"white":step>i+1?"#2E7D52":"var(--muted-foreground)"}}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                style={{background:step===i+1?"rgba(255,255,255,0.2)":step>i+1?"#2E7D52":"var(--border)",color:step>i+1?"white":"inherit"}}>
                {step>i+1?"✓":i+1}
              </span>
              {s}
            </div>
            {i<2 && <div className="h-px w-6" style={{background:step>i+1?"#86CFB0":"var(--border)"}}/>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          {step===1 && (
            <div className="bg-white border rounded-sm shadow-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
              <div className="h-0.5" style={{background:G}}/>
              <div className="px-5 py-3 border-b" style={{background:"var(--muted)",borderColor:"var(--border)"}}>
                <h2 className="font-bold text-sm flex items-center gap-2" style={{fontFamily:F,color:"var(--foreground)"}}>
                  <FileText size={14} style={{color:G}}/> بيانات الطلب
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <Field label="موقع المزرعة" required><TInput placeholder="حائل، طريق الملك عبدالعزيز..." value={location} onChange={setLocation}/></Field>
                <Field label="نوع المخلفات" required><TSelect value={wasteType} onChange={setWasteType} options={["سعف نخيل","أغصان أشجار","جريد النخيل","مخلفات مختلطة"]}/></Field>
                <Field label="تقدير الكمية (بالطن)" required hint="أدخل الكمية التقريبية"><TInput placeholder="مثال: 3" value={tons} onChange={setTons} type="number"/></Field>
                <Field label="ملاحظات"><TInput placeholder="أي تفاصيل أخرى..." value={notes} onChange={setNotes}/></Field>
                <AlertBox msg="سيتم التواصل معك خلال ٢٤ ساعة من تقديم الطلب لتنسيق موعد الزيارة." variant="info"/>
                <button onClick={()=>{if(location&&tons){doCalc();setStep(2);}}}
                  className="w-full py-2.5 rounded-sm text-sm font-black text-white transition-all hover:opacity-90"
                  style={{background:G,fontFamily:F}}>
                  التالي: الحساب الذكي ←
                </button>
              </div>
            </div>
          )}

          {step===2 && (
            <div className="bg-white border rounded-sm shadow-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
              <div className="h-0.5" style={{background:G}}/>
              <div className="px-5 py-3 border-b" style={{background:"var(--muted)",borderColor:"var(--border)"}}>
                <h2 className="font-bold text-sm" style={{fontFamily:F,color:"var(--foreground)"}}>الحساب الذكي للسماد</h2>
              </div>
              <div className="p-5">
                {/* Result card */}
                <div className="border-2 rounded-sm p-6 mb-5 text-center" style={{background:`${G}06`,borderColor:`${G}25`}}>
                  <p className="text-xs mb-1" style={{color:"var(--muted-foreground)",fontFamily:F}}>كمية المخلفات المُدخلة</p>
                  <div className="font-black text-4xl mb-1" style={{fontFamily:F,color:"var(--foreground)"}}>
                    {tons} <span className="text-xl font-normal" style={{color:"var(--muted-foreground)"}}>طن</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 my-5">
                    <div className="flex-1 h-px" style={{background:"var(--border)"}}/>
                    <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{background:G,color:"white"}}>
                      <Sprout size={18}/>
                    </div>
                    <div className="flex-1 h-px" style={{background:"var(--border)"}}/>
                  </div>
                  <p className="text-xs mb-1" style={{color:"var(--muted-foreground)",fontFamily:F}}>السماد العضوي المتوقع</p>
                  <div className="font-black" style={{fontFamily:F,color:G,fontSize:"3.5rem",lineHeight:1}}>
                    {calc?`${calc.min}–${calc.max}`:"–"}
                  </div>
                  <p className="font-black mt-1" style={{color:G,fontFamily:F}}>طن سماد عضوي</p>
                  <div className="mt-3 inline-block px-3 py-1 rounded-sm text-xs font-bold" style={{background:`${GOLD}20`,color:GOLD}}>
                    نسبة التحويل: 50٪ – 70٪
                  </div>
                </div>
                {/* Table */}
                <div className="border rounded-sm overflow-hidden mb-4" style={{borderColor:"var(--border)"}}>
                  <div className="px-4 py-2 text-xs font-bold border-b" style={{background:"var(--muted)",borderColor:"var(--border)",fontFamily:F,color:"var(--muted-foreground)"}}>جدول معدلات التحويل المعتمدة</div>
                  {[[1,"0.5–0.7"],[2,"1–1.4"],[5,"2.5–3.5"],[10,"5–7"]].map(([t,r])=>(
                    <div key={t} className="flex justify-between px-4 py-2.5 text-sm border-b last:border-b-0" style={{borderColor:"var(--border)",background:tons&&parseFloat(tons)===t?`${G}08`:"transparent"}}>
                      <span style={{color:"var(--muted-foreground)",fontFamily:F}}>{t} طن مخلفات</span>
                      <span style={{fontWeight:700,color:G,fontFamily:F}}>{r} طن سماد</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>setStep(1)} className="px-5 py-2.5 rounded-sm text-sm font-bold border transition-all hover:bg-gray-50" style={{borderColor:"var(--border)",fontFamily:F,color:"var(--foreground)"}}>← العودة</button>
                  <button onClick={()=>setStep(3)} className="flex-1 py-2.5 rounded-sm text-sm font-black text-white hover:opacity-90" style={{background:G,fontFamily:F}}>التالي: المراجعة ←</button>
                </div>
              </div>
            </div>
          )}

          {step===3 && (
            <div className="bg-white border rounded-sm shadow-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
              <div className="h-0.5" style={{background:G}}/>
              <div className="px-5 py-3 border-b" style={{background:"var(--muted)",borderColor:"var(--border)"}}>
                <h2 className="font-bold text-sm" style={{fontFamily:F,color:"var(--foreground)"}}>مراجعة الطلب قبل الإرسال</h2>
              </div>
              <div className="p-5">
                <AlertBox msg="تأكد من صحة البيانات. سيتم التواصل معك لتأكيد الطلب." variant="warning"/>
                <div className="mt-4 border rounded-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
                  {[["موقع المزرعة",location],["نوع المخلفات",wasteType],["الكمية",`${tons} طن`],["السماد المتوقع",calc?`${calc.min}–${calc.max} طن`:"–"],...(notes?[["الملاحظات",notes]]:[])]
                    .map(([k,v])=>(
                      <div key={k} className="flex justify-between items-center px-4 py-3 text-sm border-b last:border-b-0" style={{borderColor:"var(--border)"}}>
                        <span style={{color:"var(--muted-foreground)",fontFamily:F}}>{k}</span>
                        <span style={{fontWeight:700,color:"var(--foreground)",fontFamily:F}}>{v}</span>
                      </div>
                    ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={()=>setStep(2)} className="px-5 py-2.5 rounded-sm text-sm font-bold border hover:bg-gray-50" style={{borderColor:"var(--border)",fontFamily:F}}>← العودة</button>
                  <button onClick={()=>setDone(true)} className="flex-1 py-2.5 rounded-sm text-sm font-black text-white hover:opacity-90 flex items-center justify-center gap-2" style={{background:G,fontFamily:F}}>
                    <Recycle size={15}/> إرسال الطلب
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border rounded-sm shadow-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
            <div className="h-0.5" style={{background:GOLD}}/>
            <div className="px-4 py-2.5 border-b" style={{background:"var(--muted)",borderColor:"var(--border)"}}>
              <h3 className="font-bold text-sm" style={{fontFamily:F,color:"var(--foreground)"}}>كيف تعمل الخدمة؟</h3>
            </div>
            <div className="p-4 space-y-3">
              {[["١","قدّم طلبك"],["٢","نتصل بك خلال ٢٤ ساعة"],["٣","نزور مزرعتك"],["٤","نحوّل المخلفات إلى سماد"],["٥","تستلم السماد جاهزاً"]].map(([n,t])=>(
                <div key={n} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-sm flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{background:G,fontFamily:F}}>{n}</span>
                  <span style={{color:"var(--foreground)",fontFamily:F}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-sm border p-4" style={{background:`${G}08`,borderColor:`${G}20`}}>
            <h4 className="font-bold text-sm mb-2 flex items-center gap-1" style={{color:G,fontFamily:F}}><Leaf size={13}/> الأثر البيئي</h4>
            <p className="text-xs leading-relaxed" style={{color:"var(--muted-foreground)",fontFamily:F}}>كل طن مُعالَج يوفّر حرق ٨٠٠ كجم كربون ويُغني التربة لـ٣ سنوات.</p>
          </div>

          {/* Map card */}
          <div className="bg-white border rounded-sm shadow-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
            <div className="h-0.5" style={{background:GOLD}}/>
            <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{background:"var(--muted)",borderColor:"var(--border)"}}>
              <MapPin size={13} style={{color:G}}/>
              <h3 className="font-bold text-sm" style={{fontFamily:F,color:"var(--foreground)"}}>نطاق الخدمة – حائل والقصيم</h3>
            </div>
            <div className="p-2 overflow-hidden" style={{background:"#f8faf8"}}>
              <HailMap height={220} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WORKSHOPS
// ═══════════════════════════════════════════════════════════════
function WorkshopsPage() {
  const [filter,setFilter]=useState("الكل");
  const [reg,setReg]=useState<number[]>([]);
  const cats=["الكل","إعادة تدوير","حرف يدوية","تدريب مزارعين"];
  const filtered=filter==="الكل"?WORKSHOPS:WORKSHOPS.filter(w=>w.category===filter);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 py-6" style={{fontFamily:F}}>
      <Breadcrumb items={[{label:"الرئيسية"},{label:"الورش التدريبية"}]}/>
      <div className="mb-6 pb-5 border-b" style={{borderColor:"var(--border)"}}>
        <div className="h-0.5 w-8 mb-2 rounded-full" style={{background:GOLD}}/>
        <h1 className="font-black text-xl" style={{fontFamily:F,color:"var(--foreground)"}}>الورش التدريبية لإعادة التدوير</h1>
        <p className="text-sm mt-1" style={{color:"var(--muted-foreground)",fontFamily:F}}>دورات متخصصة لمزارعي حائل في إعادة تدوير مخلفات النخيل</p>
      </div>

      <div className="flex items-center gap-0 border-b mb-6 overflow-x-auto" style={{borderColor:"var(--border)"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)}
            className="px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all"
            style={{borderColor:filter===c?GOLD:"transparent",color:filter===c?G:"var(--muted-foreground)",fontFamily:F}}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {filtered.map(w=>(
          <div key={w.id} className="bg-white border rounded-sm shadow-sm overflow-hidden hover:shadow-md transition-all" style={{borderColor:"var(--border)"}}>
            <div className="h-1" style={{background:w.level==="مبتدئ"?"#2E7D52":w.level==="متوسط"?GOLD:"#8B2000"}}/>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{background:"var(--muted)",borderColor:"var(--border)"}}>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded-sm font-bold" style={{background:w.level==="مبتدئ"?"#E8F5EC":w.level==="متوسط"?`${GOLD}20`:"#FEF0EE",color:w.level==="مبتدئ"?"#2E7D52":w.level==="متوسط"?"#8B6914":"#8B2000"}}>{w.level}</span>
                <span className="text-xs px-2 py-0.5 rounded-sm font-bold" style={{background:w.location.includes("بعد")?"#EFF6FF":"var(--muted)",color:w.location.includes("بعد")?"#1D4ED8":"var(--muted-foreground)",border:"1px solid var(--border)"}}>{w.location.includes("بعد")?"عن بعد":"حضوري"}</span>
              </div>
              <span className="text-xs font-semibold" style={{color:"var(--muted-foreground)"}}>{w.category}</span>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{w.emoji}</span>
                <h3 className="font-black text-base leading-snug" style={{fontFamily:F,color:"var(--foreground)"}}>{w.title}</h3>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{color:"var(--muted-foreground)",fontFamily:F}}>{w.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4" style={{color:"var(--muted-foreground)"}}>
                <span className="flex items-center gap-1.5"><Calendar size={11} style={{color:G}}/>{w.date}</span>
                <span className="flex items-center gap-1.5"><Clock size={11} style={{color:G}}/>{w.time}</span>
                <span className="flex items-center gap-1.5 col-span-2"><MapPin size={11} style={{color:G}}/>{w.location}</span>
                <span className="flex items-center gap-1.5"><User size={11} style={{color:G}}/>{w.seats} مقعد متاح</span>
              </div>
              <button onClick={()=>setReg(p=>p.includes(w.id)?p.filter(id=>id!==w.id):[...p,w.id])}
                className="w-full py-2.5 rounded-sm text-sm font-black transition-all hover:opacity-90"
                style={{fontFamily:F,background:reg.includes(w.id)?"transparent":G,color:reg.includes(w.id)?G:"white",border:reg.includes(w.id)?`1.5px solid ${G}`:"none"}}>
                {reg.includes(w.id)?<span className="flex items-center justify-center gap-1.5"><CheckCircle size={14}/> تم التسجيل</span>:"سجّل الآن"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Crafts */}
      <div className="bg-white border rounded-sm shadow-sm overflow-hidden" style={{borderColor:"var(--border)"}}>
        <div className="h-0.5" style={{background:GOLD}}/>
        <div className="px-5 py-3 border-b" style={{background:"var(--muted)",borderColor:"var(--border)"}}>
          <h2 className="font-bold text-sm" style={{fontFamily:F,color:"var(--foreground)"}}>منتجات حرفية من مخلفات النخيل</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[["🧺","سلال النخيل"],["🖼️","قطع ديكور"],["🏡","حصائر يدوية"],["🎁","تحف هدايا"],["🪑","أثاث طبيعي"],["🌱","مستلزمات زراعية"]].map(([icon,name])=>(
            <div key={name} className="border rounded-sm p-4 text-center hover:border-primary transition-all" style={{borderColor:"var(--border)"}}>
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-xs font-bold" style={{color:"var(--foreground)",fontFamily:F}}>{name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FLOATING CHATBOT
// ═══════════════════════════════════════════════════════════════
function FloatingChatbot({ open, onOpenChange }:{ open:boolean; onOpenChange:(v:boolean)=>void }) {
  const [msgs,setMsgs]=useState<Message[]>([{id:0,from:"bot",text:"أهلاً! أنا عشيبة AI 🌿 مساعدتك الذكية في منصة عود.\n\nصوّري المادة أو اكتبي وصفها، وأرشدك: هل تصلح لإعادة التدوير؟ وأي ورشة تناسبك؟\n\n🫙 زجاج · 📄 ورق · ♻️ بلاستيك · 🔩 حديد · 🌴 سعف نخيل"}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [analyzing,setAnalyzing]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const imageUrlsRef=useRef<string[]>([]);

  useEffect(()=>{ if(open) ref.current?.scrollIntoView({behavior:"smooth"}); },[msgs,typing,analyzing,open]);

  useEffect(() => () => {
    imageUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    imageUrlsRef.current = [];
  }, []);

  function send(text?:string){
    const t=text??input; if(!t.trim()) return;
    setMsgs(m=>[...m,{id:Date.now(),from:"user",text:t}]);
    if(!text) setInput(""); setTyping(true);
    setTimeout(()=>{setMsgs(m=>[...m,{id:Date.now()+1,from:"bot",text:botReply(t)}]);setTyping(false);},1100);
  }

  function openCamera(){
    fileRef.current?.click();
  }

  async function onPhotoSelected(e: ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;

    const previewUrl = URL.createObjectURL(file);
    imageUrlsRef.current.push(previewUrl);

    setMsgs(m=>[...m,{id:Date.now(),from:"user",text:"📷 صورة المادة",imageUrl:previewUrl}]);
    setAnalyzing(true);

    try {
      const analysis = await analyzeImageFile(file);
      setMsgs(m=>[...m,{id:Date.now()+1,from:"bot",text:botReplyFromPhoto(analysis)}]);
    } catch {
      setMsgs(m=>[...m,{id:Date.now()+1,from:"bot",text:"تعذّر تحليل الصورة. صِف المادة يدوياً (مثل: زجاج، ورق، سعف نخيل)."}]);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <>
      {open && (
        <div
          dir="rtl"
          className="fixed z-[9998] flex flex-col bg-white border rounded-sm shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{
            fontFamily: F,
            borderColor: "var(--border)",
            bottom: "5.5rem",
            left: "2.5rem",
            width: "min(380px, calc(100vw - 2rem))",
            height: "min(520px, calc(100vh - 7rem))",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{background:`linear-gradient(135deg,${GD},${G})`,borderColor:"rgba(255,255,255,0.1)"}}>
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 flex-shrink-0" style={{borderColor:GOLD,background:"white"}}>
                <ImageWithFallback src={osheibaAvatar} alt="عشيبة AI" className="w-full h-full object-cover" style={{objectPosition:"center 15%"}}/>
              </div>
              <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border border-white" style={{background:"#4CAF50"}}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-white truncate" style={{fontFamily:F}}>عشيبة AI</p>
              <p className="text-xs flex items-center gap-1" style={{color:"#86CF90"}}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"/> مساعدتك الذكية · متصلة
              </p>
            </div>
            <button
              type="button"
              onClick={()=>onOpenChange(false)}
              className="w-8 h-8 rounded-sm flex items-center justify-center transition-all hover:bg-white/10 flex-shrink-0"
              aria-label="إغلاق المحادثة"
            >
              <X size={18} className="text-white"/>
            </button>
          </div>

          {/* Hint */}
          <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{ background: `${GOLD}10`, borderColor: "var(--border)" }}>
            <HelpCircle size={14} style={{ color: GOLD }} className="flex-shrink-0" />
            <p className="text-xs leading-snug" style={{ color: "var(--muted-foreground)", fontFamily: F }}>
              📷 تصوير + تحليل تلقائي · ✍️ أو إدخال يدوي
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{background:"var(--background)",minHeight:0}}>
            {msgs.map(msg=>(
              <div key={msg.id} className={`flex items-end gap-2 ${msg.from==="user"?"flex-row-reverse":"flex-row"}`}>
                {msg.from==="bot" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border flex-shrink-0" style={{borderColor:`${GOLD}80`,background:"white"}}>
                    <ImageWithFallback src={osheibaAvatar} alt="عشيبة" className="w-full h-full object-cover" style={{objectPosition:"center 15%"}}/>
                  </div>
                )}
                <div className="max-w-[82%] px-3 py-2 rounded-sm text-xs leading-relaxed whitespace-pre-line shadow-sm"
                  style={msg.from==="user"
                    ?{background:G,color:"white",borderBottomLeftRadius:2,fontFamily:F}
                    :{background:"white",border:"1px solid var(--border)",color:"var(--foreground)",borderBottomRightRadius:2,fontFamily:F}}>
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="صورة المادة"
                      className="w-full max-w-[200px] rounded-sm mb-1.5 border border-white/30 object-cover"
                      style={{ maxHeight: 120 }}
                    />
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {(typing || analyzing) && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border flex-shrink-0" style={{borderColor:`${GOLD}80`,background:"white"}}>
                  <ImageWithFallback src={osheibaAvatar} alt="عشيبة" className="w-full h-full object-cover" style={{objectPosition:"center 15%"}}/>
                </div>
                <div className="px-3 py-2 rounded-sm border shadow-sm" style={{background:"white",borderColor:"var(--border)"}}>
                  {analyzing ? (
                    <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: F }}>جاري تحليل الصورة…</p>
                  ) : (
                    <div className="flex gap-1">
                      {[0,150,300].map(d=><span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:"var(--muted-foreground)",animationDelay:`${d}ms`}}/>)}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={ref}/>
          </div>

          {/* فئات إعادة التدوير */}
          <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-t flex-shrink-0" style={{borderColor:"var(--border)",background:"var(--muted)"}}>
            {CHAT_CATEGORY_CHIPS.map(s=>(
              <button key={s} type="button" onClick={()=>send(s)}
                className="whitespace-nowrap text-xs px-2.5 py-1 rounded-sm border flex-shrink-0 transition-all hover:opacity-80"
                style={{borderColor:`${G}30`,color:G,background:`${G}08`,fontFamily:F}}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPhotoSelected}
          />
          <div className="flex items-center gap-2 px-3 py-2.5 border-t flex-shrink-0" style={{borderColor:"var(--border)",background:"white"}}>
            <button type="button" onClick={openCamera} disabled={analyzing} className="w-8 h-8 rounded-sm border flex items-center justify-center transition-all hover:bg-gray-50 flex-shrink-0 disabled:opacity-40" style={{borderColor:"var(--border)",color:G}} title="تصوير أو رفع صورة">
              <Camera size={15}/>
            </button>
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
              placeholder="أو اكتب يدوياً: زجاج، ورق، سعف..."
              className="flex-1 min-w-0 px-3 py-2 rounded-sm border text-xs focus:outline-none"
              style={{fontFamily:F,background:"var(--input-background)",borderColor:"var(--border)",color:"var(--foreground)"}}/>
            <button type="button" onClick={()=>send()} disabled={!input.trim()}
              className="w-8 h-8 rounded-sm text-white flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40 flex-shrink-0"
              style={{background:G}}>
              <Send size={14}/>
            </button>
          </div>
        </div>
      )}

      {/* زر الشات + تلميح صغير */}
      <div className="fixed z-[9999] group" style={{ bottom: "1rem", left: "2.5rem", fontFamily: F }}>
        {!open && (
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md border transition-all hover:scale-105 active:scale-95 animate-bounce"
            style={{
              background: "white",
              color: G,
              borderColor: `${G}25`,
              animationDuration: "2.5s",
            }}
          >
            محتار باللي بيدك؟
            <span
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b bg-white"
              style={{ borderColor: `${G}25` }}
            />
          </button>
        )}
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="relative flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 overflow-hidden"
          style={{
            width: "4rem",
            height: "4rem",
            border: open ? `3px solid ${GOLD}` : `3px solid white`,
            boxShadow: `0 4px 20px ${G}66`,
            background: open ? GD : "white",
          }}
          aria-label={open ? "إغلاق عشيبة AI" : "فتح عشيبة AI"}
        >
          {open ? (
            <X size={22} className="text-white"/>
          ) : (
            <ImageWithFallback
              src={osheibaAvatar}
              alt="عشيبة AI"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 12%" }}
            />
          )}
          {!open && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white animate-pulse" style={{ background: GOLD }}/>
          )}
        </button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [page,setPage]=useState<Page>("home");
  const [loggedIn,setLoggedIn]=useState(false);
  const [dashTab,setDashTab]=useState("info");
  const [chatOpen,setChatOpen]=useState(false);

  function nav(p:Page){if(p==="dashboard"&&!loggedIn){setPage("login");return;}setPage(p);}

  return (
    <div className="min-h-screen flex flex-col" style={{fontFamily:F,direction:"rtl",background:"var(--background)"}}>
      {page!=="login" && <Header page={page} setPage={nav} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}
      <main className="flex-1">
        {page==="home" && <HomePage setPage={nav} onOpenChat={()=>setChatOpen(true)}/>}
        {page==="login" && <LoginPage setLoggedIn={setLoggedIn} setPage={setPage}/>}
        {page==="dashboard" && <DashboardPage tab={dashTab} setTab={setDashTab} setPage={nav}/>}
        {page==="service" && <ServicePage/>}
        {page==="workshops" && <WorkshopsPage/>}
      </main>
      {page!=="login" && <Footer setPage={nav} onOpenChat={()=>setChatOpen(true)}/>}
      {page!=="login" && <FloatingChatbot open={chatOpen} onOpenChange={setChatOpen}/>}
    </div>
  );
}
