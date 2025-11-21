"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components (Client Side Only)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// Hardcoded coordinates for Divisions (In a real app, store lat/lng in DB)
const LOCATION_COORDS: Record<string, [number, number]> = {
  "Dhaka": [23.8103, 90.4125],
  "Chittagong": [22.3569, 91.7832],
  "Rajshahi": [24.3636, 88.6241],
  "Khulna": [22.8456, 89.5403],
  "Barisal": [22.7010, 90.3535],
  "Sylhet": [24.8949, 91.8687],
  "Rangpur": [25.7439, 89.2752],
  "Mymensingh": [24.7471, 90.4203],
};

export function CrimeHeatmap({ reports }: { reports: any[] }) {
  // Center of Bangladesh
  const center: [number, number] = [23.6850, 90.3563];

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-border relative z-0">
       <MapContainer center={center} zoom={7} scrollWheelZoom={false} className="h-full w-full">
         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         />
         {reports.map((report) => {
            const coords = LOCATION_COORDS[report.division] || center;
            // Add random jitter so points don't stack perfectly
            const lat = coords[0] + (Math.random() - 0.5) * 0.05;
            const lng = coords[1] + (Math.random() - 0.5) * 0.05;
            
            return (
                <CircleMarker 
                    key={report._id} 
                    center={[lat, lng]} 
                    radius={10}
                    pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.6, weight: 0 }}
                >
                    <Popup>
                        <div className="text-sm">
                            <strong>{report.title}</strong><br/>
                            {report.division}
                        </div>
                    </Popup>
                </CircleMarker>
            )
         })}
       </MapContainer>
    </div>
  );
}