"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimelineEvent } from "@/data/demo";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

interface EventMapProps {
  events: TimelineEvent[];
}

export default function EventMap({ events }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMap = useRef<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const eventsWithCoords = events.filter(
    (e) => e.latitude !== undefined && e.longitude !== undefined
  );

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [39.5, -98.0],
        zoom: 4,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      eventsWithCoords.forEach((event) => {
        const markerHtml = `
          <div style="position:relative;width:12px;height:12px;">
            <div style="
              width:12px;height:12px;border-radius:50%;
              background:rgba(255,255,255,0.12);
              border:1.5px solid rgba(255,255,255,0.8);
              box-shadow:0 0 20px rgba(255,255,255,0.4);
            "></div>
            <div style="
              position:absolute;inset:-4px;border-radius:50%;
              border:1px solid rgba(255,255,255,0.3);
              animation:markerPulse 2s ease-out infinite;
            "></div>
            <div style="
              position:absolute;inset:-8px;border-radius:50%;
              border:1px solid rgba(255,255,255,0.15);
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

        const marker = L.marker([event.latitude!, event.longitude!], { icon }).addTo(map);

        const popupContent = `
          <div style="
            background:rgba(5,5,5,0.95);
            border:1px solid rgba(255,255,255,0.12);
            padding:12px 16px;
            font-family:var(--font-body),system-ui,sans-serif;
            min-width:160px;
          ">
            <div style="font-size:13px;color:#F0EBE1;font-weight:200;margin-bottom:4px;">
              ${event.title}
            </div>
            <div style="font-size:11px;color:rgba(240,235,225,0.45);">
              ${event.location || ""}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: "chrono-popup",
          closeButton: false,
          offset: [0, -5],
        });

        marker.on("click", () => {
          setSelectedEvent(event);
        });
      });

      if (eventsWithCoords.length > 1) {
        const latlngs = eventsWithCoords.map((e) => [e.latitude!, e.longitude!]);
        L.polyline(latlngs, {
          color: "rgba(255,255,255,0.1)",
          weight: 1,
          dashArray: "4 8",
        }).addTo(map);
      }

      leafletMap.current = map;
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full min-h-[360px] md:min-h-[700px] bg-chrono-surface overflow-hidden border border-[var(--line-strong)]">
      <div ref={mapRef} className="absolute inset-0 z-0" />

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
                  src={selectedEvent.imageUrl}
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
              <button
                onClick={() => setSelectedEvent(null)}
                className="mt-4 text-xs font-body font-extralight text-chrono-muted hover:text-chrono-text transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 glass px-4 py-3 z-20">
        <div className="section-label mb-2">Legend</div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Travel" },
            { label: "Career" },
            { label: "Achievement" },
            { label: "Education" },
            { label: "Life" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-chrono-accent" />
              <span className="text-[11px] font-body font-extralight text-chrono-muted">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

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
