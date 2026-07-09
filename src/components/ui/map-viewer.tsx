import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

type Marker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  /** Color band — 'green' (>=70), 'yellow' (40-69), 'red' (<40). Default falls back to brand blue. */
  tone?: "green" | "yellow" | "red";
  onClick?: () => void;
};
type Props = {
  markers: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  /** When true, also renders a heatmap layer over the same points. */
  heatmap?: boolean;
  /** Lightweight grid clustering at low zoom levels. */
  cluster?: boolean;
};

const TONE_COLORS: Record<NonNullable<Marker["tone"]>, string> = {
  green: "#2E7D32",
  yellow: "#F59E0B",
  red: "#D32F2F",
};

// Grid-based cluster (simple, no external dep). Returns an array of cells.
function cluster(markers: Marker[], cellSize: number) {
  const cells = new Map<string, Marker[]>();
  markers.forEach((m) => {
    const cx = Math.round(m.lat / cellSize) * cellSize;
    const cy = Math.round(m.lng / cellSize) * cellSize;
    const key = `${cx},${cy}`;
    const arr = cells.get(key) ?? [];
    arr.push(m);
    cells.set(key, arr);
  });
  return [...cells.values()];
}

export function MapView({
  markers,
  center,
  zoom = 11,
  className,
  heatmap = false,
  cluster: doCluster = false,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatRef = useRef<L.HeatLayer | null>(null);

  // إنشاء الخريطة مرة واحدة بس
  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const initCenter =
      center ??
      (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 30.0444, lng: 31.2358 });

    const map = L.map(ref.current, {
      center: [initCenter.lat, initCenter.lng],
      zoom,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحديث الماركرز والـ heatmap
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const groups =
      doCluster && markers.length > 30 ? cluster(markers, 0.05) : markers.map((m) => [m]);

    groups.forEach((group) => {
      if (group.length > 1) {
        const lat = group.reduce((s, m) => s + m.lat, 0) / group.length;
        const lng = group.reduce((s, m) => s + m.lng, 0) / group.length;
        const icon = L.divIcon({
          html: `<div style="background:#0F4C81;color:#fff;font-weight:700;font-size:13px;width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)">${group.length}</div>`,
          className: "",
          iconSize: [32, 32],
        });
        const marker = L.marker([lat, lng], { icon });
        marker.on("click", () => map.setZoom(map.getZoom() + 2));
        marker.addTo(layerGroup);
      } else {
        const m = group[0];
        const color = m.tone ? TONE_COLORS[m.tone] : "#0F4C81";
        const marker = L.circleMarker([m.lat, m.lng], {
          radius: 9,
          fillColor: color,
          fillOpacity: 0.95,
          color: "#ffffff",
          weight: 2,
        }).bindTooltip(m.title);
        if (m.onClick) marker.on("click", m.onClick);
        marker.addTo(layerGroup);
      }
    });

    if (markers.length) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    if (heatRef.current) {
      map.removeLayer(heatRef.current);
      heatRef.current = null;
    }
    if (heatmap && markers.length) {
      heatRef.current = L.heatLayer(
        markers.map((m) => [m.lat, m.lng, 0.6]),
        { radius: 28, blur: 20 },
      ).addTo(map);
    }
  }, [markers, heatmap, doCluster]);

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Map"
      className={className ?? "w-full h-[480px] rounded-2xl border bg-muted"}
    />
  );
}
