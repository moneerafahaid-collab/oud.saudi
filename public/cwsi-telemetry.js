/**
 * CWSI + thermal remote-sensing diurnal simulator (Hail orchard).
 * Exposed as window.CwsiTelemetry for the field-test scan page.
 */
(function (root) {
  const CLAMP = (v, a, b) => Math.min(b, Math.max(a, v));

  function satVaporKpa(tC) {
    return 0.6108 * Math.exp((17.27 * tC) / (tC + 237.3));
  }

  function solarRadiation(hour) {
    const sunrise = 6.05;
    const sunset = 17.72;
    if (hour < sunrise || hour > sunset) return 0;
    const x = (hour - sunrise) / (sunset - sunrise);
    return 990 * Math.sin(Math.PI * x);
  }

  function airTemp(hour) {
    const tmin = 16.4;
    const tmax = 33.6;
    const peak = 14.45;
    const wave = Math.cos((2 * Math.PI * (hour - peak)) / 24);
    return (tmax + tmin) / 2 + ((tmax - tmin) / 2) * wave;
  }

  function relativeHumidity(hour) {
    const t = airTemp(hour);
    return CLAMP(62 - (t - 16.4) * 2.55, 12, 74);
  }

  function stressBand(cwsi) {
    if (cwsi < 0.3) return "optimal";
    if (cwsi < 0.6) return "moderate";
    return "critical";
  }

  function cwsiColor(cwsi) {
    if (cwsi < 0.3) return "#047857";
    if (cwsi < 0.6) return "#D97706";
    return "#B91C1C";
  }

  /** Agricultural LST / ET false-color: cool irrigated blue → hot desert orange. */
  const IRONBOW = [
    [0, 22, 52, 140],
    [0.16, 36, 110, 196],
    [0.32, 46, 168, 168],
    [0.48, 92, 186, 92],
    [0.62, 214, 196, 72],
    [0.76, 232, 154, 58],
    [0.88, 224, 112, 40],
    [1, 196, 74, 24],
  ];

  function ironbow(t) {
    const u = CLAMP(t, 0, 1);
    for (let i = 1; i < IRONBOW.length; i++) {
      const a = IRONBOW[i - 1];
      const b = IRONBOW[i];
      if (u <= b[0]) {
        const f = (u - a[0]) / Math.max(1e-6, b[0] - a[0]);
        return [
          Math.round(a[1] + (b[1] - a[1]) * f),
          Math.round(a[2] + (b[2] - a[2]) * f),
          Math.round(a[3] + (b[3] - a[3]) * f),
        ];
      }
    }
    return [255, 255, 255];
  }

  function ironbowCss(t) {
    const c = ironbow(t);
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }

  function sampleAt(hour, opts) {
    opts = opts || {};
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
      opts.zone === "field"
        ? 0.1 + 0.16 * (Rs / 1000)
        : 0.5 + 0.26 * Math.sin((Math.PI * afternoon) / 1.15);
    const noise = (opts.noise ?? 0.018) * Math.sin(h * 13.7 + (opts.extraStress || 0) * 9);
    const trueStress = CLAMP(zoneBase + (opts.extraStress || 0) + noise, 0, 0.97);
    const dT = dTll + trueStress * (dTul - dTll);
    const Tc = Ta + dT;
    const cwsi = CLAMP((dT - dTll) / Math.max(0.35, dTul - dTll), 0, 1);
    const hh = Math.floor(h);
    const mm = Math.floor((h - hh) * 60);
    return {
      hour: h,
      timestamp: String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0"),
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

  function wallClockHourRiyadh() {
    const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
    const d = new Date(utc + 3 * 3600000);
    return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  }

  function createStream(options) {
    options = options || {};
    const intervalMs = options.intervalMs || 280;
    const zone = options.zone || "infection";
    let playing = true;
    let speed = 1;
    let liveMode = false;
    let hour = options.startHour != null ? options.startHour : 10.5;
    let timer = null;
    const listeners = new Set();

    function snapshot() {
      return { playing, speed, liveMode, hour, sample: sampleAt(hour, { zone }) };
    }

    function emit() {
      const state = snapshot();
      listeners.forEach((fn) => fn(state));
    }

    function tick() {
      if (!playing) return;
      if (liveMode) hour = wallClockHourRiyadh();
      else hour = (hour + (speed * intervalMs) / 60000) % 24;
      emit();
    }

    timer = setInterval(tick, intervalMs);
    emit();

    return {
      play() { playing = true; emit(); },
      pause() { playing = false; emit(); },
      setSpeed(n) { speed = n; emit(); },
      setHour(h) {
        hour = ((h % 24) + 24) % 24;
        liveMode = false;
        emit();
      },
      setLiveMode(on) {
        liveMode = !!on;
        if (liveMode) hour = wallClockHourRiyadh();
        emit();
      },
      subscribe(fn) {
        listeners.add(fn);
        fn(snapshot());
        return () => listeners.delete(fn);
      },
      snapshot,
      dispose() {
        if (timer) clearInterval(timer);
        timer = null;
        listeners.clear();
      },
    };
  }

  root.CwsiTelemetry = {
    sampleAt,
    stressBand,
    cwsiColor,
    ironbow,
    ironbowCss,
    createStream,
    solarRadiation,
    airTemp,
  };
})(typeof window !== "undefined" ? window : globalThis);
