"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimelineEvent } from "@/data/demo";
import { formatDate, resolveImageUrl, getCategoryColor } from "@/lib/utils";
import { useTheme } from "@/components/ui/ThemeProvider";
import { logger } from "@/lib/logger";
import Image from "next/image";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface EventMapProps {
  events: TimelineEvent[];
}

export default function EventMap({ events }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const cleanupFnsRef = useRef<(() => void)[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { theme } = useTheme();

  const eventsWithCoords = useMemo(
    () => events.filter((e) => e.latitude !== undefined && e.longitude !== undefined),
    [events]
  );

  // Derive legend from actual event categories with distinct colors
  const legendCategories = useMemo(() => {
    const catMap = new Map<string, string>();
    eventsWithCoords.forEach((e) => {
      if (e.category && !catMap.has(e.category)) {
        catMap.set(e.category, getCategoryColor(e.category));
      }
    });
    return Array.from(catMap.entries()).map(([name, color]) => ({
      label: name.charAt(0).toUpperCase() + name.slice(1),
      color,
    }));
  }, [eventsWithCoords]);

  // Initialize map (runs once)
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    try {
      const map = L.map(mapRef.current, {
        center: [39.5, -98.0],
        zoom: 4,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const tileUrl = theme === "light"
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

      const tileLayer = L.tileLayer(tileUrl, { maxZoom: 19, subdomains: "abcd" }).addTo(map);
      tileLayerRef.current = tileLayer;

      leafletMap.current = map;
      setMapLoaded(true);
    } catch (error) {
      logger.error("Failed to initialize map", { error: String(error) });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Swap tile layer when theme changes
  useEffect(() => {
    if (!leafletMap.current || !tileLayerRef.current) return;
    const tileUrl = theme === "light"
      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    tileLayerRef.current.setUrl(tileUrl);
  }, [theme]);

  // Manage markers when events change
  useEffect(() => {
    if (!mapLoaded || !leafletMap.current) return;
    const map = leafletMap.current;

    // Clean up previous listeners, markers, and polylines
    cleanupFnsRef.current.forEach((fn) => fn());
    cleanupFnsRef.current = [];
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    // Add new markers with safety checks
    eventsWithCoords.forEach((event) => {
      if (event.latitude === undefined || event.longitude === undefined) return;
      const color = getCategoryColor(event.category);
      const markerHtml = `
        <div style="position:relative;width:12px;height:12px;">
          <div style="
            width:12px;height:12px;border-radius:50%;
            background:rgba(255,255,255,0.12);
            border:1.5px solid ${color};
            box-shadow:0 0 20px ${color};
          "></div>
          <div style="
            position:absolute;inset:-4px;border-radius:50%;
            border:1px solid ${color};
            opacity:0.3;
            animation:markerPulse 2s ease-out infinite;
          "></div>
          <div style="
            position:absolute;inset:-8px;border-radius:50%;
            border:1px solid ${color};
            opacity:0.15;
            animation:markerPulse 2s ease-out infinite 0.5s;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([event.latitude, event.longitude], { icon }).addTo(map);

      const popupContent = `
        <div style="
          background:var(--chrono-surface);
          border:1px solid var(--line-strong);
          padding:12px 16px;
          font-family:var(--font-body),system-ui,sans-serif;
          min-width:160px;
        ">
          <div style="font-size:13px;color:var(--chrono-text);font-weight:200;margin-bottom:4px;">
            ${escapeHtml(event.title)}
          </div>
          <div style="font-size:11px;color:var(--chrono-muted);">
            ${escapeHtml(event.location || "")}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "chrono-popup",
        closeButton: false,
        offset: [0, -5],
      });

      marker.on("click", () => setSelectedEvent(event));

      // Keyboard accessibility: make markers focusable and operable
      const el = marker.getElement();
      if (el) {
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", `${event.title}${event.location ? `, ${event.location}` : ""}`);
        const keydownHandler = (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            marker.openPopup();
            setSelectedEvent(event);
          }
        };
        el.addEventListener("keydown", keydownHandler);
        cleanupFnsRef.current.push(() => el.removeEventListener("keydown", keydownHandler));
      }

      markersRef.current.push(marker);
    });

    // Add polylines connecting markers
    if (eventsWithCoords.length > 1) {
      const latlngs: L.LatLngExpression[] = eventsWithCoords
        .filter((e) => e.latitude !== undefined && e.longitude !== undefined)
        .map((e) => [e.latitude as number, e.longitude as number]);
      const polyline = L.polyline(latlngs, {
        color: "rgba(255,255,255,0.1)",
        weight: 1,
        dashArray: "4 8",
      }).addTo(map);
      polylinesRef.current.push(polyline);
    }

    // Auto-fit map to event bounds
    if (eventsWithCoords.length > 0) {
      const latlngs: L.LatLngExpression[] = eventsWithCoords
        .filter((e) => e.latitude !== undefined && e.longitude !== undefined)
        .map((e) => [e.latitude as number, e.longitude as number]);
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
    return () => {
      cleanupFnsRef.current.forEach((fn) => fn());
      cleanupFnsRef.current = [];
    };
  }, [mapLoaded, eventsWithCoords]);

  return (
    <div className="relative w-full h-full min-h-[360px] md:min-h-[700px] bg-chrono-surface overflow-hidden border border-[var(--line-strong)]">
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {mapLoaded && eventsWithCoords.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-sm font-body font-extralight text-chrono-muted text-center px-6">
            <p className="mb-1">No pinned locations yet</p>
            <p className="text-xs text-chrono-muted/60">Add events with coordinates to see them on the map</p>
          </div>
        </div>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-chrono-surface">
          <div className="text-sm font-body font-extralight text-chrono-muted animate-pulse">
            Loading map...
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-4 right-4 left-4 sm:left-auto sm:w-80 glass-strong overflow-hidden z-20"
          >
            {selectedEvent.imageUrl && (
              <div className="relative h-40">
                <Image
                  src={resolveImageUrl(selectedEvent.imageUrl) || selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover archival-img"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,5,0.45)] via-transparent to-transparent" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-chrono-accent" />
                <span className="text-xs font-body font-extralight text-chrono-muted">
                  {formatDate(selectedEvent.date)}
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-chrono-text mb-1">
                {selectedEvent.title}
              </h3>
              {selectedEvent.location && (
                <p className="text-xs font-body font-extralight text-chrono-muted mb-3 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  {selectedEvent.location}
                </p>
              )}
              {selectedEvent.description && (
                <p className="text-sm font-body font-extralight leading-relaxed text-chrono-muted">
                  {selectedEvent.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href={`/timeline?q=${encodeURIComponent(selectedEvent.title)}`}
                  className="text-xs font-body font-extralight text-chrono-accent hover:text-chrono-text transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View in Timeline
                </Link>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-xs font-body font-extralight text-chrono-muted hover:text-chrono-text transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {legendCategories.length > 0 && (
        <div className="absolute bottom-4 left-4 glass px-4 py-3 z-20" role="region" aria-label="Map legend">
          <div className="section-label mb-2">Legend</div>
          <div className="flex flex-wrap gap-3" role="list">
            {legendCategories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-1.5" role="listitem">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-[11px] font-body font-extralight text-chrono-muted">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes markerPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
