import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import regionsData from "@/data/regions-boundaries.json";

const G = "#1A4731";
const GOLD = "#C9A84C";
const BROWN_D = "#4E342E";
const BROWN_L = "#C4A57B";

export type RegionId = "hail" | "qassim";

const REGIONS: Record<
  RegionId,
  { label: string; name: string; subtitle: string; fill: string; border: string; center: L.LatLngExpression }
> = {
  hail: {
    label: "حائل",
    name: "منطقة حائل",
    subtitle: "نطاق خدمة منصة عَود",
    fill: G,
    border: GOLD,
    center: [27.45, 41.55],
  },
  qassim: {
    label: "القصيم",
    name: "منطقة القصيم",
    subtitle: "نطاق خدمة منصة عَود",
    fill: BROWN_D,
    border: BROWN_L,
    center: [26.2, 43.6],
  },
};

function popupHtml(name: string, subtitle: string, color: string) {
  return `<div dir="rtl" style="font-family:sans-serif;text-align:right;font-size:14px;line-height:1.6">
    <strong>${name}</strong><br/>
    <span style="color:${color}">${subtitle}</span>
  </div>`;
}

export function HailMap({
  height = 360,
  onRegionChange,
}: {
  height?: number;
  onRegionChange?: (region: RegionId | null) => void;
}) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Partial<Record<RegionId, L.GeoJSON>>>({});
  const allBoundsRef = useRef<L.LatLngBounds | null>(null);
  const focusRegionRef = useRef<(id: RegionId) => void>(() => {});
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<RegionId | null>(null);

  useEffect(() => {
    const el = mapElRef.current;
    if (!el) return;

    const map = L.map(el, { scrollWheelZoom: true, zoomControl: true });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);

    const allLayer = L.geoJSON(regionsData as GeoJSON.FeatureCollection, {
      style(feature) {
        const id = feature?.properties?.id as RegionId;
        const r = REGIONS[id];
        return {
          color: r.border,
          weight: 3,
          fillColor: r.fill,
          fillOpacity: 0.4,
        };
      },
      onEachFeature(feature, layer) {
        const id = feature.properties?.id as RegionId;
        const r = REGIONS[id];
        layersRef.current[id] = layer as L.GeoJSON;

        layer.on("click", () => focusRegionRef.current(id));
      },
    }).addTo(map);

    allBoundsRef.current = allLayer.getBounds();
    if (allBoundsRef.current.isValid()) {
      map.fitBounds(allBoundsRef.current, { padding: [20, 20], maxZoom: 8 });
    }

    const fix = () => map.invalidateSize();
    requestAnimationFrame(fix);
    setTimeout(fix, 200);
    setTimeout(fix, 600);
    setReady(true);

    return () => {
      setReady(false);
      map.remove();
      mapRef.current = null;
      layersRef.current = {};
      allBoundsRef.current = null;
    };
  }, []);

  const selectRegion = useCallback((id: RegionId) => {
    const map = mapRef.current;
    const layer = layersRef.current[id];
    const r = REGIONS[id];
    if (!map || !layer) return;

    setActive(id);
    onRegionChange?.(id);
    const b = layer.getBounds();
    map.fitBounds(b, { padding: [40, 40], maxZoom: 9 });
    L.popup({ maxWidth: 280 })
      .setLatLng(r.center)
      .setContent(popupHtml(r.name, r.subtitle, r.fill))
      .openOn(map);

    layer.setStyle({ fillOpacity: 0.55, weight: 4 });
    const other = id === "hail" ? "qassim" : "hail";
    layersRef.current[other]?.setStyle({ fillOpacity: 0.4, weight: 3 });
  }, [onRegionChange]);

  focusRegionRef.current = selectRegion;

  const showAll = useCallback(() => {
    const map = mapRef.current;
    const bounds = allBoundsRef.current;
    if (!map || !bounds?.isValid()) return;
    setActive(null);
    onRegionChange?.(null);
    map.closePopup();
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 8 });
    layersRef.current.hail?.setStyle({ fillOpacity: 0.4, weight: 3 });
    layersRef.current.qassim?.setStyle({ fillOpacity: 0.4, weight: 3 });
  }, [onRegionChange]);

  return (
    <div className="w-full" style={{ fontFamily: "sans-serif" }}>
      {/* أزرار خارج الخريطة — دائماً قابلة للنقر */}
      <div dir="rtl" className="flex flex-wrap items-center gap-2 mb-2 px-1">
        <span className="text-xs font-bold text-gray-500">اختر المنطقة:</span>
        {(["hail", "qassim"] as RegionId[]).map((id) => {
          const r = REGIONS[id];
          const on = active === id;
          return (
            <button
              key={id}
              type="button"
              disabled={!ready}
              onClick={() => selectRegion(id)}
              className="px-4 py-2 rounded-sm text-sm font-bold transition-all disabled:opacity-50"
              style={{
                background: on ? r.fill : "#fff",
                color: on ? "#fff" : r.fill,
                border: `2px solid ${r.border}`,
                cursor: ready ? "pointer" : "wait",
              }}
            >
              {r.label}
            </button>
          );
        })}
        {active && (
          <button
            type="button"
            onClick={showAll}
            className="text-xs underline text-gray-500 px-2 py-1"
            style={{ cursor: "pointer" }}
          >
            عرض الكل
          </button>
        )}
      </div>

      {/* الخريطة */}
      <div
        ref={mapElRef}
        className="w-full rounded-sm overflow-hidden border"
        style={{
          height,
          minHeight: height,
          background: "#dde3e8",
          borderColor: "#ccc",
        }}
      />

      {!ready && (
        <p dir="rtl" className="text-xs text-center mt-1 text-gray-400">
          جاري تحميل الخريطة...
        </p>
      )}
    </div>
  );
}
