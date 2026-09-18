import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Where the property actually is.
 *
 * Dragging a marker beats parsing an address here: plot numbering in Dhaka is
 * inconsistent, the same road name recurs across thanas, and an owner knows
 * their own gate. Five seconds of dragging is correct by construction.
 *
 * Skipping is allowed, and the listing then says "approximate" on the map
 * rather than pretending to a precision it doesn't have.
 */
function Recentre({ position }: { position: [number, number] }) {
  const map = useMap();
  const key = position.join(",");

  useEffect(() => {
    map.setView(position, map.getZoom() < 14 ? 15 : map.getZoom(), { animate: true });
    // Only when the area changes underneath, not on every drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}

export function PinPicker({
  centre,
  value,
  onChange,
}: {
  /** The area centre, used until the owner moves the marker. */
  centre: [number, number];
  value: [number, number] | null;
  onChange: (point: [number, number] | null) => void;
}) {
  const { t } = useI18n();
  const markerRef = useRef<L.Marker>(null);
  const [position, setPosition] = useState<[number, number]>(value ?? centre);

  useEffect(() => {
    if (!value) setPosition(centre);
  }, [centre, value]);

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "habito-pin",
        html: `<span class="block size-5 rounded-full bg-aqua-600 ring-4 ring-white shadow-[0_3px_10px_-2px_rgb(16,24,40,0.45)]"></span>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    [],
  );

  return (
    <div>
      <div className="overflow-hidden rounded-card ring-1 ring-hairline">
        <MapContainer center={position} zoom={15} className="h-64 w-full sm:h-72">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <Recentre position={position} />
          <Marker
            draggable
            ref={markerRef}
            position={position}
            icon={icon}
            eventHandlers={{
              dragend: () => {
                const next = markerRef.current?.getLatLng();
                if (!next) return;
                const point: [number, number] = [next.lat, next.lng];
                setPosition(point);
                onChange(point);
              },
            }}
          />
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p
          className={cn(
            "inline-flex items-center gap-1.5 text-sm",
            value ? "font-medium text-ok-600" : "text-muted",
          )}
        >
          <MapPin size={14} aria-hidden />
          {value ? t("map.pinSet") : t("map.useArea")}
        </p>

        {value && (
          <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
            {t("map.pinSkip")}
          </Button>
        )}
      </div>
    </div>
  );
}
