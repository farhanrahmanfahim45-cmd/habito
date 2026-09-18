import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "@/i18n";
import { moneyCompact } from "@/lib/format";
import { spaceName, displayImage } from "@/lib/localize";
import type { SpaceListing } from "@/types/space";
import { cn } from "@/lib/cn";

/**
 * Listings on a map.
 *
 * OpenStreetMap rather than Google: Google's tiles need an API key tied to a
 * billing account, which this project does not have, and the free tier's
 * watermark on an unkeyed request looks worse than an honest open map. The
 * tile layer is one line to swap if that changes.
 *
 * Markers show the price rather than a pin. On a property map the price *is*
 * the information — a field of identical teardrops tells you nothing, and you
 * end up clicking each one to find out what you already wanted to know.
 */

/** Leaflet ships its marker icons as separate files; we draw our own instead. */
function priceMarker(listing: SpaceListing, active: boolean): L.DivIcon {
  const { space } = listing;
  const price = moneyCompact(space.cost.price);
  const occupied = space.availability.status === "occupied";

  // A real size matters: a zero-sized icon still paints but has no hit area,
  // so the marker looks clickable and isn't. Width tracks the label length.
  const width = Math.max(44, price.length * 9 + 18);

  return L.divIcon({
    className: "habito-marker",
    html: `<span class="${cn(
      "flex h-7 w-full items-center justify-center rounded-full text-xs font-bold whitespace-nowrap shadow-[0_2px_8px_-2px_rgb(16,24,40,0.45)]",
      active ? "bg-ink text-ivory" : occupied ? "bg-white/80 text-muted" : "bg-white text-ink",
    )}">${price}</span>`,
    iconSize: [width, 28],
    iconAnchor: [width / 2, 14],
    popupAnchor: [0, -14],
  });
}

/** Keeps the map framed on the listings whenever the result set changes. */
function FitToListings({ listings }: { listings: SpaceListing[] }) {
  const map = useMap();
  const signature = listings.map((l) => l.space.id).join(",");

  useEffect(() => {
    const points = listings
      .map((l) => [l.property.latitude, l.property.longitude] as [number, number])
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
      return;
    }

    // Capped so a handful of rural outliers don't pull the view out to the
    // whole country, which makes every urban listing a single pile.
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15, animate: true });
    if (map.getZoom() < 9) map.setZoom(11);
    // Refit only when the set of listings actually changes, not on every pan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, map]);

  return null;
}

function TrackViewport({
  onMove,
}: {
  onMove: (bounds: L.LatLngBounds, zoom: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => onMove(map.getBounds(), map.getZoom()),
    zoomend: () => onMove(map.getBounds(), map.getZoom()),
  });
  return null;
}

/** A group of listings too close together to draw separately at this zoom. */
interface Cluster {
  key: string;
  lat: number;
  lng: number;
  items: SpaceListing[];
}

/**
 * Grid clustering.
 *
 * Dhaka is dense enough that two hundred pins become an illegible pile — the
 * first version of this map was exactly that. Rounding coordinates to a cell
 * whose size shrinks as you zoom in is crude next to a proper clustering
 * library, but it needs no extra dependency, and it resolves to individual
 * markers by the time you are looking at one neighbourhood, which is the only
 * point at which a single pin means anything.
 */
function clusterListings(listings: SpaceListing[], zoom: number): Cluster[] {
  // Past street level, never cluster: if you have zoomed to one block you want
  // the listings themselves, and a bubble marked "4" is exactly the thing you
  // zoomed in to get rid of.
  if (zoom >= 15) return listings.map((l) => ({
    key: l.space.id,
    lat: l.property.latitude,
    lng: l.property.longitude,
    items: [l],
  }));

  // Otherwise the cell shrinks quickly with zoom: a city at 10, a few
  // hundred metres by 14.
  const cell = 1.6 / Math.pow(2, zoom - 8);
  const groups = new Map<string, Cluster>();

  for (const l of listings) {
    const lat = l.property.latitude;
    const lng = l.property.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const key = `${Math.round(lat / cell)}:${Math.round(lng / cell)}`;
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(l);
      // Keep the marker at the middle of what it represents.
      existing.lat += (lat - existing.lat) / existing.items.length;
      existing.lng += (lng - existing.lng) / existing.items.length;
    } else {
      groups.set(key, { key, lat, lng, items: [l] });
    }
  }

  return [...groups.values()];
}

function clusterIcon(count: number): L.DivIcon {
  const size = count > 50 ? 48 : count > 12 ? 42 : 36;
  return L.divIcon({
    className: "habito-marker",
    html: `<span class="flex items-center justify-center rounded-full bg-ink text-ivory font-bold shadow-[0_3px_12px_-3px_rgb(16,24,40,0.5)]" style="width:${size}px;height:${size}px;font-size:${count > 99 ? 11 : 13}px">${count}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function SpaceMap({
  listings,
  activeId,
  onSelect,
  className,
}: {
  listings: SpaceListing[];
  activeId?: string | null;
  onSelect?: (spaceId: string) => void;
  className?: string;
}) {
  const { t, language } = useI18n();
  const [visible, setVisible] = useState<number | null>(null);
  const [zoom, setZoom] = useState(12);
  const containerRef = useRef<HTMLDivElement>(null);

  const placed = useMemo(
    () =>
      listings.filter(
        (l) => Number.isFinite(l.property.latitude) && Number.isFinite(l.property.longitude),
      ),
    [listings],
  );

  // Somewhere sensible before any listing loads: central Dhaka.
  const centre: [number, number] = placed.length
    ? [placed[0].property.latitude, placed[0].property.longitude]
    : [23.78, 90.4];

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-full overflow-hidden rounded-card", className)}>
      <MapContainer
        center={centre}
        zoom={12}
        scrollWheelZoom
        className="size-full"
        // Bangladesh, loosely — stops someone panning to the Atlantic and
        // wondering why the map is empty.
        maxBounds={L.latLngBounds([20.3, 87.9], [26.9, 92.8])}
        maxBoundsViscosity={0.6}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <FitToListings listings={placed} />
        <TrackViewport
          onMove={(bounds, z) => {
            setZoom(z);
            setVisible(
              placed.filter((l) => bounds.contains([l.property.latitude, l.property.longitude])).length,
            );
          }}
        />

        {clusterListings(placed, zoom)
          .filter((c) => c.items.length > 1)
          .map((c) => (
            <Marker
              key={c.key}
              position={[c.lat, c.lng]}
              icon={clusterIcon(c.items.length)}
              eventHandlers={{
                // Clicking a cluster zooms into it rather than opening one of
                // the listings arbitrarily.
                click: (e) => e.target._map.setView([c.lat, c.lng], Math.min(zoom + 3, 17)),
              }}
            />
          ))}

        {clusterListings(placed, zoom)
          .filter((c) => c.items.length === 1)
          .map(({ items: [l] }) => (
          <Marker
            key={l.space.id}
            position={[l.property.latitude, l.property.longitude]}
            icon={priceMarker(l, l.space.id === activeId)}
            eventHandlers={{ click: () => onSelect?.(l.space.id) }}
          >
            <Popup className="habito-popup" minWidth={210} closeButton={false}>
              <Link to={`/space/${l.space.id}`} className="block w-52">
                <img
                  src={displayImage(l.space.images[0])}
                  alt=""
                  className="aspect-4/3 w-full rounded-lg object-cover"
                />
                <p className="mt-2 font-display text-sm font-bold text-ink">
                  {spaceName(l.space, language)}
                </p>
                <p className="text-xs text-muted">
                  {l.property.neighborhood}, {l.property.area}
                </p>
                <p className="mt-1 font-bold tnum text-ink">
                  {moneyCompact(l.space.cost.price)}
                  {l.space.transaction === "rent" && (
                    <span className="font-normal text-muted">{t("transaction.perMonthShort")}</span>
                  )}
                </p>

                {/* Says what the pin actually means. An approximate point
                    presented as exact sends someone to the wrong gate. */}
                <p className="mt-1.5 text-[0.65rem] leading-snug text-muted">
                  {l.property.locationSource === "pinned"
                    ? t("map.pinned")
                    : t("map.approximate")}
                </p>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Count, so an empty map reads as "nothing here" rather than "broken". */}
      <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur">
        {placed.length === 0
          ? t("map.noneHere")
          : t("map.showing", { count: visible ?? placed.length })}
      </div>

      {listings.length > placed.length && (
        <p className="pointer-events-none absolute inset-x-3 bottom-3 z-[400] rounded-xl bg-surface/95 px-3 py-2 text-xs leading-relaxed text-muted shadow-sm backdrop-blur">
          {t("map.missingCoords", { count: listings.length - placed.length })}
        </p>
      )}
    </div>
  );
}
