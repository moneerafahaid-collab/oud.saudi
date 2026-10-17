import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cwsiColor, type ThermalSample } from "@/lib/cwsi/engine";
import { useThermalTelemetry } from "@/hooks/useThermalTelemetry";

const BAND_AR: Record<string, string> = {
  optimal: "وضع مثالي — لا إجهاد",
  moderate: "إجهاد متوسط",
  critical: "إجهاد حرج",
};

const SPEEDS = [1, 5, 60] as const;

function Gauge({ cwsi }: { cwsi: number }) {
  const deg = Math.round(cwsi * 180);
  return (
    <div className="relative mx-auto h-24 w-44">
      <div
        className="absolute inset-x-0 bottom-0 h-20 overflow-hidden rounded-t-full"
        style={{
          background: "conic-gradient(from 180deg, #047857 0deg, #D97706 90deg, #B91C1C 180deg)",
        }}
      />
      <div className="absolute inset-x-[14px] bottom-0 h-[68px] rounded-t-full bg-white" />
      <div
        className="absolute bottom-1 left-1/2 h-[62px] w-0.5 origin-bottom bg-slate-800"
        style={{ transform: `translateX(-50%) rotate(${deg - 90}deg)` }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-lg font-black tabular-nums" style={{ color: cwsiColor(cwsi) }}>
        {cwsi.toFixed(2)}
      </div>
    </div>
  );
}

export function ThermalCwsiDashboard({ zone = "infection" }: { zone?: "field" | "infection" }) {
  const t = useThermalTelemetry({ zone, autoStart: true, startHour: 10.5 });
  const s = t.sample;
  if (!s) return null;

  const chart = t.history.map((p: ThermalSample) => ({
    t: p.timestamp,
    CWSI: p.cwsi,
    Tc: p.Tc,
    Ta: p.Ta,
  }));

  return (
    <div dir="rtl" className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: "#D8E0D6", fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-black" style={{ color: "#0F2E1F" }}>رصد حراري حي · CWSI</h3>
          <p className="text-xs" style={{ color: "#6B7C6B" }}>محاكاة دورة يومية — حرارة المظلة والإشعاع وعجز البخار</p>
        </div>
        <span className="rounded px-2 py-0.5 text-[11px] font-bold" style={{ background: `${cwsiColor(s.cwsi)}22`, color: cwsiColor(s.cwsi) }}>
          {BAND_AR[s.band]}
        </span>
      </div>

      <Gauge cwsi={s.cwsi} />

      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        {[
          ["Tc مظلة", `${s.Tc}°C`],
          ["Ta هواء", `${s.Ta}°C`],
          ["VPD", `${s.VPD} kPa`],
          ["إشعاع", `${s.Rs} W/m²`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between rounded-lg px-2 py-1.5" style={{ background: "#F7FAF6" }}>
            <span style={{ color: "#6B7C6B" }}>{k}</span>
            <strong className="tabular-nums">{v}</strong>
          </div>
        ))}
      </div>

      <div className="mt-3 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E0" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} minTickGap={24} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} width={28} />
            <Tooltip />
            <Area type="monotone" dataKey="CWSI" stroke="#B91C1C" fill="#FEE2E2" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="rounded-md px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#1A4731" }} onClick={() => (t.playing ? t.pause() : t.play())}>
          {t.playing ? "إيقاف" : "تشغيل"}
        </button>
        {SPEEDS.map((n) => (
          <button
            key={n}
            type="button"
            className="rounded-md border px-2 py-1.5 text-xs font-bold"
            style={{ borderColor: t.speed === n ? "#C9A84C" : "#D8E0D6", background: t.speed === n ? "#FEF9EE" : "#fff" }}
            onClick={() => t.setSpeed(n)}
          >
            {n}x
          </button>
        ))}
        <label className="ms-auto flex items-center gap-1 text-[11px]">
          <input type="checkbox" checked={t.liveMode} onChange={(e) => t.setLiveMode(e.target.checked)} />
          رصد حي
        </label>
      </div>
      <input
        type="range"
        min={0}
        max={239}
        value={Math.round(t.hour * 10)}
        onChange={(e) => t.setHour(Number(e.target.value) / 10)}
        className="mt-2 w-full"
      />
      <div className="text-center text-[11px] tabular-nums" style={{ color: "#6B7C6B" }}>
        الوقت المحاكى {s.timestamp}
      </div>
    </div>
  );
}
