import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";

const G = "#1A4731";
const F = "'Noto Kufi Arabic', 'Cairo', sans-serif";
const HAIL: L.LatLngExpression = [27.5114, 41.6907];

export type PickedLocation = {
  lat: number;
  lng: number;
  label: string;
};

function pinIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${G};border:2px solid #fff;transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,.35);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

async function reverseLabel(lat: number, lng: number): Promise<string> {
  const fallback = `${lat.toFixed(5)}°، ${lng.toFixed(5)}°`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
    if (!res.ok) return fallback;
    const data = await res.json();
    const a = data.address ?? {};
    const parts = [a.village, a.town, a.city, a.suburb, a.county, a.state]
      .filter(Boolean)
      .filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i);
    if (parts.length) return parts.slice(0, 3).join("، ");
    if (typeof data.display_name === "string") return data.display_name.split(",").slice(0, 3).join("، ");
  } catch {
    /* keep fallback */
  } finally {
    clearTimeout(timer);
  }
  return fallback;
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: PickedLocation | null;
  onChange: (loc: PickedLocation) => void;
}) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsErr, setGpsErr] = useState("");

  onChangeRef.current = onChange;

  function placeMarker(map: L.Map, lat: number, lng: number) {
    const pos: L.LatLngExpression = [lat, lng];
    if (markerRef.current) markerRef.current.setLatLng(pos);
    else markerRef.current = L.marker(pos, { icon: pinIcon(), draggable: true }).addTo(map);
    markerRef.current.off("dragend");
    markerRef.current.on("dragend", () => {
      const p = markerRef.current?.getLatLng();
      if (p) void commit(p.lat, p.lng);
    });
  }

  async function commit(lat: number, lng: number) {
    const map = mapRef.current;
    if (map) {
      placeMarker(map, lat, lng);
      const z = map.getZoom();
      map.setView([lat, lng], z < 13 ? 14 : z);
    }
    const coordsLabel = `${lat.toFixed(5)}°، ${lng.toFixed(5)}°`;
    onChangeRef.current({ lat, lng, label: coordsLabel });
    const label = await reverseLabel(lat, lng);
    onChangeRef.current({ lat, lng, label });
  }

  useEffect(() => {
    const el = mapElRef.current;
    if (!el) return;

    const map = L.map(el, { scrollWheelZoom: true, zoomControl: true }).setView(HAIL, 11);
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      void commit(e.latlng.lat, e.latlng.lng);
    });

    const fix = () => map.invalidateSize();
    requestAnimationFrame(fix);
    setTimeout(fix, 200);
    setReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    placeMarker(map, value.lat, value.lng);
  }, [value, ready]);

  function useGps() {
    if (!navigator.geolocation) {
      setGpsErr("المتصفح لا يدعم تحديد الموقع.");
      return;
    }
    setGpsBusy(true);
    setGpsErr("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsBusy(false);
        void commit(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGpsBusy(false);
        setGpsErr("تعذّر الوصول للموقع. اسمح بالصلاحية أو حدّد النقطة على الخريطة.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  return (
    <div className="space-y-2" style={{ fontFamily: F }}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={useGps}
          disabled={gpsBusy || !ready}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-bold text-white disabled:opacity-50"
          style={{ background: G }}
        >
          <Navigation size={13} />
          {gpsBusy ? "جاري تحديد موقعك…" : "استخدم موقعي الحالي"}
        </button>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          أو اضغط على الخريطة لوضع الدبوس
        </span>
      </div>
      {gpsErr && (
        <p className="text-xs" style={{ color: "#B91C1C" }}>{gpsErr}</p>
      )}
      <div
        ref={mapElRef}
        className="w-full rounded-sm overflow-hidden border"
        style={{ height: 240, minHeight: 240, borderColor: "var(--border)", background: "#dde3e8" }}
      />
      {value ? (
        <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-sm border" style={{ borderColor: `${G}30`, background: `${G}08`, color: G }}>
          <MapPin size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{value.label}</div>
            <div style={{ color: "var(--muted-foreground)" }}>
              {value.lat.toFixed(5)}، {value.lng.toFixed(5)}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>لم يُحدَّد موقع بعد.</p>
      )}
    </div>
  );
}
