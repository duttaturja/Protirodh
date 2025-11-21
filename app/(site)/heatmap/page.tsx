"use client";

import { useEffect, useState } from "react";
import { Loader2, Map, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CrimeHeatmap } from "@/components/explore/crime-heatmap";

export default function HeatmapPage() {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/reports/feed?limit=100"); // Fetch more points for a better heatmap
        const data = await res.json();
        setHeatmapData(data.reports || []);
      } catch (error) {
        console.error("Failed to fetch heatmap data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
         <Link href="/feed" className="p-2 hover:bg-secondary rounded-full transition-colors md:hidden">
            <ArrowLeft className="w-5 h-5" />
         </Link>
         <h1 className="text-xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6 text-primary" /> Live Heatmap
         </h1>
      </div>

      <div className="p-0 h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] w-full relative">
        {loading ? (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        ) : (
            <div className="h-full w-full">
                 <CrimeHeatmap reports={heatmapData} />
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border text-xs font-medium shadow-lg z-[400]">
                    Showing recent verified incidents across Bangladesh
                 </div>
            </div>
        )}
      </div>
    </div>
  );
}