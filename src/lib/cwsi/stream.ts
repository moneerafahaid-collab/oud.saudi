import { sampleAt, type ThermalSample } from "./engine";

export type StreamState = {
  playing: boolean;
  speed: number;
  liveMode: boolean;
  hour: number;
  sample: ThermalSample;
};

type Listener = (state: StreamState) => void;

const RIYADH_OFFSET_H = 3;

function wallClockHourRiyadh() {
  const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
  const d = new Date(utc + RIYADH_OFFSET_H * 3600000);
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
}

export function createThermalStream(opts?: {
  intervalMs?: number;
  zone?: "field" | "infection";
  startHour?: number;
}) {
  const intervalMs = opts?.intervalMs ?? 280;
  const zone = opts?.zone ?? "infection";
  let playing = true;
  let speed = 1;
  let liveMode = false;
  let hour = opts?.startHour ?? 10.5;
  let timer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<Listener>();

  const emit = () => {
    const sample = sampleAt(hour, { zone });
    const state: StreamState = { playing, speed, liveMode, hour, sample };
    listeners.forEach((fn) => fn(state));
  };

  const tick = () => {
    if (!playing) return;
    if (liveMode) hour = wallClockHourRiyadh();
    else hour = (hour + (speed * intervalMs) / 60000) % 24;
    emit();
  };

  const startTimer = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(tick, intervalMs);
  };

  startTimer();
  emit();

  return {
    play() {
      playing = true;
      emit();
    },
    pause() {
      playing = false;
      emit();
    },
    setSpeed(n: number) {
      speed = n;
      emit();
    },
    setHour(h: number) {
      hour = ((h % 24) + 24) % 24;
      liveMode = false;
      emit();
    },
    setLiveMode(on: boolean) {
      liveMode = on;
      if (on) hour = wallClockHourRiyadh();
      emit();
    },
    subscribe(fn: Listener) {
      listeners.add(fn);
      fn({ playing, speed, liveMode, hour, sample: sampleAt(hour, { zone }) });
      return () => listeners.delete(fn);
    },
    snapshot() {
      return { playing, speed, liveMode, hour, sample: sampleAt(hour, { zone }) } as StreamState;
    },
    dispose() {
      if (timer) clearInterval(timer);
      timer = null;
      listeners.clear();
    },
  };
}

export type ThermalStream = ReturnType<typeof createThermalStream>;
