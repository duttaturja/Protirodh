"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ReportCard } from "@/components/feed/report-card";
import { Loader2, PenSquare } from "lucide-react";
import Link from "next/link";

export default function FeedPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"foryou" | "trending">("foryou");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/feed?type=${activeTab}`);
        const data = await res.json();
        // FIX: Fallback to empty array if data.reports is undefined
        setReports(data.reports || []);
      } catch (error) {
        console.error(error);
        setReports([]); // Safety net
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [activeTab]);

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-background">
      {/* Sticky Header with Tabs */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-2 md:hidden">
            <h1 className="text-xl font-bold">Protirodh</h1>
        </div>
        <div className="flex w-full">
          <button 
            onClick={() => setActiveTab("foryou")}
            className={`flex-1 py-4 text-base font-bold text-center hover:bg-secondary/50 relative transition-colors ${activeTab === "foryou" ? "text-foreground" : "text-muted-foreground"}`}
          >
            For you
            {activeTab === "foryou" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("trending")}
            className={`flex-1 py-4 text-base font-bold text-center hover:bg-secondary/50 relative transition-colors ${activeTab === "trending" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Trending
            {activeTab === "trending" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />}
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex flex-col min-h-[50vh]">
        {loading ? (
           <div className="flex justify-center py-10">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
        ) : (reports && reports.length > 0) ? ( // Double safety check
            reports.map((report) => (
              <ReportCard key={report._id} report={report} currentUserId={session?.user?.id} />
            ))
        ) : (
            <div className="p-10 text-center text-muted-foreground">
                No reports found. Follow people to see their posts here!
            </div>
        )}
      </div>

      {/* FAB (Mobile) */}
      <Link href="/feed/create">
        <div className="fixed bottom-20 right-4 md:hidden bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 z-50">
          <PenSquare className="w-6 h-6" />
        </div>
      </Link>
    </div>
  );
}