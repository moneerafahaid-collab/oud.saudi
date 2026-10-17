import { useEffect, useMemo, useRef, useState } from "react";
import { createThermalStream, type StreamState } from "@/lib/cwsi/stream";
import type { ThermalSample } from "@/lib/cwsi/engine";

const HISTORY_MAX = 72;

export function useThermalTelemetry(opts?: {
  autoStart?: boolean;
  zone?: "field" | "infection";
  startHour?: number;
}) {
  const streamRef = useRef<ReturnType<typeof createThermalStream> | null>(null);
  const [state, setState] = useState<StreamState | null>(null);
  const [history, setHistory] = useState<ThermalSample[]>([]);

  const stream = useMemo(
    () =>
      createThermalStream({
        zone: opts?.zone ?? "infection",
        startHour: opts?.startHour ?? 10.5,
      }),
    [opts?.zone, opts?.startHour]
  );

  useEffect(() => {
    streamRef.current = stream;
    if (opts?.autoStart === false) stream.pause();
    const unsub = stream.subscribe((s) => {
      setState(s);
      setHistory((prev) => {
        const next = [...prev, s.sample];
        return next.length > HISTORY_MAX ? next.slice(-HISTORY_MAX) : next;
      });
    });
    return () => {
      unsub();
      stream.dispose();
    };
  }, [stream, opts?.autoStart]);

  return {
    state,
    sample: state?.sample ?? null,
    history,
    playing: state?.playing ?? false,
    speed: state?.speed ?? 1,
    liveMode: state?.liveMode ?? false,
    hour: state?.hour ?? 10.5,
    play: () => streamRef.current?.play(),
    pause: () => streamRef.current?.pause(),
    setSpeed: (n: number) => streamRef.current?.setSpeed(n),
    setHour: (h: number) => streamRef.current?.setHour(h),
    setLiveMode: (on: boolean) => streamRef.current?.setLiveMode(on),
  };
}
