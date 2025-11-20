"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, BadgeCheck, Repeat2 } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  report: any;
  currentUserId?: string;
}

export function ReportCard({ report, currentUserId }: ReportCardProps) {
  const router = useRouter();
  
  // --- RENDER LOGIC FOR SHARED POSTS ---
  // If this is a "share" (retweet), we want to display the ORIGINAL post content
  const isRetweet = !!report.sharedFrom;
  const displayReport = isRetweet ? report.sharedFrom : report;

  const [score, setScore] = useState(displayReport?.verificationScore || 0);
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(() => {
    if (!displayReport) return null;
    if (displayReport.upvotes?.includes(currentUserId)) return "up";
    if (displayReport.downvotes?.includes(currentUserId)) return "down";
    return null;
  });

  // If original report was deleted but the share exists
  if (isRetweet && !displayReport) {
      return (
        <div className="p-4 border-b border-border text-muted-foreground text-sm bg-secondary/5">
            Original post was deleted.
        </div>
      );
  }

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!currentUserId) return alert("Please login to vote");

    const previousScore = score;
    const previousStatus = voteStatus;
    
    // Optimistic Update
    if (type === "upvote") {
      if (voteStatus === "up") { 
        setVoteStatus(null); 
        setScore((s: number) => s - 1); 
      } else if (voteStatus === "down") { 
        setVoteStatus("up"); 
        setScore((s: number) => s + 2); 
      } else { 
        setVoteStatus("up"); 
        setScore((s: number) => s + 1); 
      }
    } else {
      if (voteStatus === "down") { 
        setVoteStatus(null); 
        setScore((s: number) => s + 1); 
      } else if (voteStatus === "up") { 
        setVoteStatus("down"); 
        setScore((s: number) => s - 2); 
      } else { 
        setVoteStatus("down"); 
        setScore((s: number) => s - 1); 
      }
    }

    try {
      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: displayReport._id, type }),
      });
    } catch (error) {
      setScore(previousScore); // Revert on error
      setVoteStatus(previousStatus);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return alert("Please login to share");
    
    const confirmShare = window.confirm("Share this report to your profile?");
    if (!confirmShare) return;

    try {
        // Always share the ORIGINAL id, even if we are sharing a share
        const targetId = displayReport._id;
        
        const res = await fetch("/api/reports/share", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reportId: targetId }),
        });
        
        if (res.ok) alert("Shared to your profile!");
        else {
            const err = await res.json();
            alert(err.message);
        }
    } catch (err) {
        console.error(err);
    }
  };

  // Navigate to detail page
  const goToDetail = (e: React.MouseEvent) => {
    // Don't navigate if clicking buttons
    if ((e.target as HTMLElement).closest("button")) return;
    router.push(`/report/${displayReport._id}`);
  };

  return (
    <article 
      onClick={goToDetail}
      className="border-b border-border hover:bg-secondary/5 transition-colors cursor-pointer block"
    >
      {/* Retweet Header Label */}
      {isRetweet && (
          <div className="px-10 pt-2 pb-1 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Repeat2 className="w-3 h-3" />
              <span>{report.author?.name} shared</span>
          </div>
      )}

      <div className="px-4 py-3 flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden relative">
             {displayReport.isAnonymous ? (
               <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white text-xs">?</div>
             ) : (
               <Image 
                 src={displayReport.author?.image || "/placeholder-user.jpg"} 
                 alt="Avatar" 
                 fill 
                 className="object-cover"
               />
             )}
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* User Info Header */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 overflow-hidden">
              <span className="font-bold text-foreground truncate hover:underline">
                {displayReport.isAnonymous ? "Anonymous" : displayReport.author?.name}
              </span>
              
              {!displayReport.isAnonymous && displayReport.author?.role === "verified" && (
                <VerifiedBadge className="w-4 h-4 text-primary" />
              )}

              <span className="text-muted-foreground truncate ml-0.5">
                {displayReport.isAnonymous 
                  ? "@anonymous" 
                  : `@${displayReport.author?.name?.replace(/\s+/g, '').toLowerCase()}`
                }
              </span>

              <span className="text-muted-foreground px-1">·</span>
              
              <span className="text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(displayReport.createdAt), { addSuffix: false }).replace("about ", "")}
              </span>
            </div>
          </div>

          {/* Text Content */}
          <div className="mt-1">
            <h3 className="text-sm font-bold text-foreground">{displayReport.title}</h3>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-3 mt-0.5">
              {displayReport.description}
            </p>
          </div>

          {/* Media Attachment (Compact) */}
          {displayReport.images && displayReport.images.length > 0 && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border relative w-full aspect-video bg-secondary/20">
              <Image 
                src={displayReport.images[0]} 
                alt="Evidence" 
                fill 
                className="object-cover hover:opacity-95 transition-opacity"
              />
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center justify-between mt-3 max-w-[425px] text-muted-foreground">
            
            {/* Votes */}
            <div className="flex items-center group -ml-2">
               <button 
                 onClick={(e) => { e.stopPropagation(); handleVote("upvote"); }}
                 className={cn("p-2 rounded-full group-hover:bg-green-500/10 transition-colors relative", voteStatus === 'up' && "text-green-500")}
               >
                 <ArrowBigUp className={cn("w-5 h-5", voteStatus === 'up' && "fill-current")} />
               </button>
               <span className={cn("text-xs font-medium mx-0.5 min-w-[16px] text-center", 
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

            {/* Comments Indicator */}
            <div className="flex items-center gap-1 group hover:text-primary transition-colors">
              <div className="p-2 rounded-full group-hover:bg-primary/10">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>

            {/* Share / Retweet */}
            <button 
              onClick={handleShare}
              className="flex items-center gap-1 group hover:text-green-500 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                <Repeat2 className="w-4 h-4" />
              </div>
            </button>

            {/* Verified Status Icon */}
             <div className="flex items-center">
               {displayReport.isVerifiedBadge && (
                  <BadgeCheck className="w-4 h-4 text-primary" />
               )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}