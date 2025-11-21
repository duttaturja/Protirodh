"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/reports/leaderboard");
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
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
      }
    } catch (e) {
        toast.error("Failed to follow");
    }
};

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
         <Link href="/feed" className="p-2 hover:bg-secondary rounded-full transition-colors md:hidden">
            <ArrowLeft className="w-5 h-5" />
         </Link>
         <h1 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" /> Top Contributors
         </h1>
      </div>

      <div className="p-4">
        {loading ? (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : leaderboard.length > 0 ? (
            <div className="space-y-4">
                {leaderboard.map((item, index) => (
                    <div key={item.user._id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
                        <div className="font-black text-2xl text-muted-foreground w-6 text-center">
                            {index + 1}
                        </div>
                        <Link href={`/profile/${item.user._id}`} className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-background overflow-hidden relative border border-border">
                                <Image src={item.user.image || "/placeholder-user.jpg"} alt={item.user.name} fill className="object-cover" />
                            </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link href={`/profile/${item.user._id}`} className="font-bold text-lg text-foreground hover:underline truncate block">
                                {item.user.name}
                            </Link>
                            <div className="text-sm text-primary font-medium">{item.totalScore} reputation</div>
                        </div>
                        <Button 
                            size="sm" 
                            className="rounded-full font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            onClick={() => handleFollow(item.user._id)}
                        >
                            Follow
                        </Button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground py-10">No data available yet.</div>
        )}
      </div>
    </div>
  );
}