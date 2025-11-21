// components/layout/right-sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Map } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CrimeHeatmap } from "@/components/explore/crime-heatmap";
import { toast } from "sonner";
import { Trophy } from "lucide-react";


export function RightSidebar() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sugRes, mapRes] = await Promise.all([
            fetch("/api/users/suggestions"),
            fetch("/api/reports/feed?limit=50")
        ]);
        
        const sugData = await sugRes.json();
        const mapData = await mapRes.json();

        setSuggestions(sugData.suggestions || []);
        setHeatmapData(mapData.reports || []);
      } catch (error) {
        console.error("Failed to fetch sidebar data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Leaderboard
        const lbRes = await fetch("/api/reports/leaderboard");
        const lbData = await lbRes.json();
        setLeaderboard(lbData.leaderboard || []);

        // Fetch recent reports for Heatmap
        const mapRes = await fetch("/api/reports/feed?limit=50"); // Fetch more points for map
        const mapData = await mapRes.json();
        setHeatmapData(mapData.reports || []);

      } catch (error) {
        console.error("Failed to fetch sidebar data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFollow = async (targetUserId: string) => {
      try {
        const res = await fetch("/api/users/follow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetUserId }),
        });
        if (res.ok) {
            toast.success("Followed user");
            // Remove from suggestions locally
            setSuggestions(suggestions.filter(u => u._id !== targetUserId));
        }
      } catch (e) {
          toast.error("Failed to follow");
      }
  };

  return (
    <div className="hidden lg:block w-[350px] pl-8 py-4 sticky top-0 h-screen border-l border-border bg-background z-10 overflow-y-auto no-scrollbar">
      
      {/* Who to Follow Card */}
      <div className="bg-secondary/30 rounded-2xl border border-border overflow-hidden mb-6">
        <h2 className="font-extrabold text-xl p-4 pb-2">Who to follow</h2>
        
        {loading ? (
           <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : suggestions.length > 0 ? (
            <div className="flex flex-col">
                {suggestions.map((user) => (
                    <div key={user._id} className="px-4 py-3 hover:bg-secondary/50 transition-colors flex items-center justify-between gap-3">
                        <Link href={`/profile/${user._id}`} className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-background overflow-hidden relative border border-border">
                                <Image src={user.image || "/placeholder-user.jpg"} alt={user.name} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-sm text-foreground truncate hover:underline">{user.name}</div>
                                <div className="text-xs text-muted-foreground truncate">@{user.name.replace(/\s+/g, '').toLowerCase()}</div>
                            </div>
                        </Link>
                        <Button 
                            size="sm" 
                            className="rounded-full font-bold h-8 px-4 bg-foreground text-background hover:bg-foreground/90"
                            onClick={() => handleFollow(user._id)}
                        >
                            Follow
                        </Button>
                    </div>
                ))}
                <div className="p-4 text-primary text-sm font-medium hover:bg-secondary/50 transition-colors cursor-pointer">
                    Show more
                </div>
            </div>
        ) : (
            <div className="p-4 text-muted-foreground text-sm">No suggestions right now.</div>
        )}
      </div>

      {/* Heatmap Widget */}
      <Link href="/heatmap">
      <div className="bg-secondary/30 rounded-2xl border border-border overflow-hidden mb-6">
        <h2 className="font-extrabold text-xl p-4 pb-2 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" /> Live Heatmap
        </h2>
        <div className="h-[200px] w-full relative">
             {loading ? (
                 <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>
             ) : (
                 <CrimeHeatmap reports={heatmapData} />
             )}
        </div>
      </div>
      </Link>

      {/* Leaderboard Card */}
      <Link href="/leaderboard">
      <div className="bg-secondary/30 rounded-2xl border border-border overflow-hidden">
        <h2 className="font-extrabold text-xl p-4 pb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Top Contributors
        </h2>
        
        {loading ? (
           <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : leaderboard.length > 0 ? (
            <div className="flex flex-col">
                {leaderboard.map((item, index) => (
                    <div key={item.user._id} className="px-4 py-3 hover:bg-secondary/50 transition-colors flex items-center gap-3">
                        <div className="font-bold text-muted-foreground w-4">{index + 1}</div>
                        <div className="w-8 h-8 rounded-full bg-background overflow-hidden relative border border-border">
                            <Image src={item.user.image || "/placeholder-user.jpg"} alt={item.user.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-foreground truncate">{item.user.name}</div>
                            <div className="text-xs text-muted-foreground">{item.totalScore} points</div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-4 text-muted-foreground text-sm">No data available yet.</div>
        )}
      </div>
      </Link>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 px-4 text-xs text-muted-foreground">
        <span>© 2025 Protirodh</span>
      </div>
    </div>
  );
}