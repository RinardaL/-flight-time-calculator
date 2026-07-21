"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { greatCirclePoints } from "@/lib/geo";

// Default Leaflet marker icons reference image files Next.js won't resolve from
// node_modules automatically; point them at unpkg's copies instead of shipping
// broken pin icons.
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LeafletMapInnerProps {
  originLat: number;
  originLon: number;
  originLabel: string;
  destinationLat: number;
  destinationLon: number;
  destinationLabel: string;
}

export default function LeafletMapInner({
  originLat,
  originLon,
  originLabel,
  destinationLat,
  destinationLon,
  destinationLabel,
}: LeafletMapInnerProps) {
  const route = greatCirclePoints(originLat, originLon, destinationLat, destinationLon, 96);
  const center: [number, number] = [(originLat + destinationLat) / 2, (originLon + destinationLon) / 2];

  return (
    <MapContainer center={center} zoom={2} scrollWheelZoom={false} style={{ height: 320, width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[originLat, originLon]} icon={icon}>
        <Popup>{originLabel}</Popup>
      </Marker>
      <Marker position={[destinationLat, destinationLon]} icon={icon}>
        <Popup>{destinationLabel}</Popup>
      </Marker>
      <Polyline positions={route} pathOptions={{ color: "#2563eb", weight: 3, dashArray: "6 4" }} />
    </MapContainer>
  );
}
