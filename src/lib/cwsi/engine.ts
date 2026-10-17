/** Crop Water Stress Index + thermal remote-sensing diurnal model (Hail / date-palm orchard). */

export type StressBand = "optimal" | "moderate" | "critical";

export type ThermalSample = {
  hour: number;
  timestamp: string;
  Tc: number;
  Ta: number;
  VPD: number;
  Rs: number;
  RH: number;
  dT: number;
  dTll: number;
  dTul: number;
  cwsi: number;
  band: StressBand;
};

export type EngineOpts = {
  extraStress?: number;
  zone?: "field" | "infection";
  noise?: number;
};

const CLAMP = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Tetens saturation vapor pressure (kPa). */
export function satVaporKpa(tC: number) {
  return 0.6108 * Math.exp((17.27 * tC) / (tC + 237.3));
}

/** Clear-sky solar radiation W/m² for Hail (~27.9°N, mid-season). */
export function solarRadiation(hour: number) {
  const sunrise = 6.05;
  const sunset = 17.72;
  if (hour < sunrise || hour > sunset) return 0;
  const x = (hour - sunrise) / (sunset - sunrise);
  return 990 * Math.sin(Math.PI * x);
}

/** Diurnal air temperature: min ~05:30, max ~14:30. */
export function airTemp(hour: number) {
  const tmin = 16.4;
  const tmax = 33.6;
  const peak = 14.45;
  const wave = Math.cos((2 * Math.PI * (hour - peak)) / 24);
  return (tmax + tmin) / 2 + ((tmax - tmin) / 2) * wave;
}

export function relativeHumidity(hour: number) {
  const t = airTemp(hour);
  return CLAMP(62 - (t - 16.4) * 2.55, 12, 74);
}

export function stressBand(cwsi: number): StressBand {
  if (cwsi < 0.3) return "optimal";
  if (cwsi < 0.6) return "moderate";
  return "critical";
}

export function cwsiColor(cwsi: number) {
  if (cwsi < 0.3) return "#047857";
  if (cwsi < 0.6) return "#D97706";
  return "#B91C1C";
}

/**
 * Idso / Jackson empirical CWSI.
 * Non-water-stressed baseline (NWSB): dTll = a + b·VPD  (arid orchard)
 * Upper limit dTul grows with net radiation when stomata close.
 */
export function sampleAt(hour: number, opts: EngineOpts = {}): ThermalSample {
  const h = ((hour % 24) + 24) % 24;
  const Rs = solarRadiation(h);
  const Ta = airTemp(h);
  const RH = relativeHumidity(h);
  const es = satVaporKpa(Ta);
  const VPD = Math.max(0.08, es * (1 - RH / 100));

  const dTll = 2.14 - 1.72 * VPD;
  const dTul = Math.max(dTll + 0.9, 4.05 + 1.85 * (Rs / 1000));

  const afternoon = CLAMP((h - 8) / 8, 0, 1);
  const zoneBase =
    opts.zone === "infection"
      ? 0.5 + 0.26 * Math.sin((Math.PI * afternoon) / 1.15)
      : 0.1 + 0.16 * (Rs / 1000);

  const noise = (opts.noise ?? 0.018) * Math.sin(h * 13.7 + (opts.extraStress ?? 0) * 9);
  const trueStress = CLAMP(zoneBase + (opts.extraStress ?? 0) + noise, 0, 0.97);

  const dT = dTll + trueStress * (dTul - dTll);
  const Tc = Ta + dT;
  const cwsi = CLAMP((dT - dTll) / Math.max(0.35, dTul - dTll), 0, 1);
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);

  return {
    hour: h,
    timestamp: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
    Tc: +Tc.toFixed(2),
    Ta: +Ta.toFixed(2),
    VPD: +VPD.toFixed(3),
    Rs: +Rs.toFixed(0),
    RH: +RH.toFixed(1),
    dT: +dT.toFixed(2),
    dTll: +dTll.toFixed(2),
    dTul: +dTul.toFixed(2),
    cwsi: +cwsi.toFixed(3),
    band: stressBand(cwsi),
  };
}
