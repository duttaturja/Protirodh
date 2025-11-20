"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link"; // We will use this to wrap the card content
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  report: any;
  currentUserId?: string;
}

export function ReportCard({ report, currentUserId }: ReportCardProps) {
  const router = useRouter();
  const [score, setScore] = useState(report.verificationScore);
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(() => {
    if (report.upvotes.includes(currentUserId)) return "up";
    if (report.downvotes.includes(currentUserId)) return "down";
    return null;
  });

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!currentUserId) return alert("Please login to vote");

    // Prevent navigation when clicking vote buttons
    const previousScore = score;
    
    if (type === "upvote") {
      if (voteStatus === "up") { setVoteStatus(null); setScore((s:number) => s - 1); }
      else if (voteStatus === "down") { setVoteStatus("up"); setScore((s:number) => s + 2); }
      else { setVoteStatus("up"); setScore((s:number) => s + 1); }
    } else {
      if (voteStatus === "down") { setVoteStatus(null); setScore((s:number) => s + 1); }
      else if (voteStatus === "up") { setVoteStatus("down"); setScore((s:number) => s - 2); }
      else { setVoteStatus("down"); setScore((s:number) => s - 1); }
    }

    try {
      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report._id, type }),
      });
    } catch (error) {
      setScore(previousScore); // Revert
    }
  };

  // Navigate to detail page
  const goToDetail = (e: React.MouseEvent) => {
    // Don't navigate if clicking buttons
    if ((e.target as HTMLElement).closest("button")) return;
    router.push(`/report/${report._id}`);
  };

  return (
    <article 
      onClick={goToDetail}
      className="border-b border-border p-3 hover:bg-secondary/5 transition-colors cursor-pointer"
    >
      <div className="flex gap-3">
        {/* Avatar - Smaller */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden relative">
             {report.isAnonymous ? (
               <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white text-xs">?</div>
             ) : (
               <Image 
                 src={report.author?.image || "/placeholder-user.jpg"} 
                 alt="Avatar" 
                 fill 
                 className="object-cover"
               />
             )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Line */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 overflow-hidden">
              <span className="font-bold text-foreground truncate">
                {report.isAnonymous ? "Anonymous" : report.author?.name}
              </span>
              {!report.isAnonymous && report.author?.role === "verified" && <VerifiedBadge className="w-4 h-4 text-primary" />}
              <span className="text-muted-foreground truncate">{report.isAnonymous ? "@anonymous" : `@${report.author?.name?.replace(/\s+/g, '').toLowerCase()}`}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(report.createdAt), { addSuffix: false }).replace("about ", "")}</span>
            </div>
          </div>

          {/* Title & Body */}
          <div className="mt-1">
            <h3 className="text-sm font-bold text-foreground">{report.title}</h3>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-3 mt-0.5">{report.description}</p>
          </div>

          {/* Media - Compact Aspect Ratio */}
          {report.images && report.images.length > 0 && (
            <div className="mt-2 rounded-lg overflow-hidden border border-border relative h-64 w-full">
              <Image 
                src={report.images[0]} 
                alt="Evidence" 
                fill 
                className="object-cover"
              />
            </div>
          )}

          {/* Actions Bar - Twitter Style */}
          <div className="flex items-center justify-between mt-2 max-w-[400px] text-muted-foreground">
            
            {/* Vote Group */}
            <div className="flex items-center group">
               <button 
                 onClick={(e) => { e.stopPropagation(); handleVote("upvote"); }}
                 className={cn("p-2 rounded-full group-hover:bg-green-500/10 transition-colors", voteStatus === 'up' && "text-green-500")}
               >
                 <ArrowBigUp className={cn("w-5 h-5", voteStatus === 'up' && "fill-current")} />
               </button>
               <span className={cn("text-xs font-medium mx-1 min-w-[20px] text-center", 
                   score > 0 ? "text-green-500" : score < 0 ? "text-red-500" : ""
               )}>
                 {score}
               </span>
               <button 
                 onClick={(e) => { e.stopPropagation(); handleVote("downvote"); }}
                 className={cn("p-2 rounded-full group-hover:bg-red-500/10 transition-colors", voteStatus === 'down' && "text-red-500")}
               >
                 <ArrowBigDown className={cn("w-5 h-5", voteStatus === 'down' && "fill-current")} />
               </button>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1 group cursor-pointer hover:text-primary">
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </div>
              {/* Placeholder count for now */}
              <span className="text-xs">0</span> 
            </div>

            {/* Share */}
            <div className="flex items-center gap-1 group cursor-pointer hover:text-primary">
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <Share2 className="w-4 h-4" />
              </div>
            </div>

            {/* Verification Status */}
             {report.isVerifiedBadge && (
              <div className="flex items-center gap-1 text-green-600">
                <BadgeCheck className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}