"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, BadgeCheck, Repeat2, Loader2 } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Import Toast
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import Dialog

interface ReportCardProps {
  report: any;
  currentUserId?: string;
}

export function ReportCard({ report, currentUserId }: ReportCardProps) {
  const router = useRouter();
  const [showShareDialog, setShowShareDialog] = useState(false); // State for dialog
  
  // --- RENDER LOGIC FOR SHARED POSTS ---
  const isRetweet = !!report.sharedFrom;
  const displayReport = isRetweet ? report.sharedFrom : report;

  const [score, setScore] = useState(displayReport?.verificationScore || 0);
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(() => {
    if (!displayReport) return null;
    if (displayReport.upvotes?.includes(currentUserId)) return "up";
    if (displayReport.downvotes?.includes(currentUserId)) return "down";
    return null;
  });

  if (isRetweet && !displayReport) {
      return (
        <div className="p-4 border-b border-border text-muted-foreground text-sm bg-secondary/5">
            Original post was deleted.
        </div>
      );
  }

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!currentUserId) {
        toast.error("Please login to vote");
        return;
    }

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
      setScore(previousScore);
      setVoteStatus(previousStatus);
      toast.error("Failed to register vote");
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) {
        toast.error("Please login to share");
        return;
    }
    setShowShareDialog(true); // Open Custom Dialog
  };

  const confirmShare = async () => {
    try {
        const targetId = displayReport._id;
        const res = await fetch("/api/reports/share", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reportId: targetId }),
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.action === "removed") {
                toast.success("Removed from your profile");
            } else {
                toast.success("Shared to your profile!");
            }
        } else {
            const err = await res.json();
            toast.error(err.message);
        }
    } catch (err) {
        toast.error("Failed to share report");
    } finally {
        setShowShareDialog(false);
    }
  };

  const goToDetail = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    router.push(`/report/${displayReport._id}`);
  };

  return (
    <>
    <article 
      onClick={goToDetail}
      className="border-b border-border hover:bg-secondary/5 transition-colors cursor-pointer block"
    >
      {isRetweet && (
          <div className="px-10 pt-2 pb-1 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Repeat2 className="w-3 h-3" />
              <span>{report.author?.name} shared</span>
          </div>
      )}

      <div className="px-4 py-3 flex gap-3">
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

        <div className="flex-1 min-w-0">
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

          <div className="mt-1">
            <h3 className="text-sm font-bold text-foreground">{displayReport.title}</h3>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-3 mt-0.5">
              {displayReport.description}
            </p>
          </div>

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

          <div className="flex items-center justify-between mt-3 max-w-[425px] text-muted-foreground">
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

            <div className="flex items-center gap-1 group hover:text-primary transition-colors">
              <div className="p-2 rounded-full group-hover:bg-primary/10">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>

            <button 
              onClick={handleShareClick} // Opens Dialog
              className="flex items-center gap-1 group hover:text-green-500 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                <Repeat2 className="w-4 h-4" />
              </div>
            </button>

             <div className="flex items-center">
               {displayReport.isVerifiedBadge && (
                  <BadgeCheck className="w-4 h-4 text-primary" />
               )}
            </div>
          </div>
        </div>
      </div>
    </article>

    {/* CONFIRMATION DIALOG */}
    <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share this report?</AlertDialogTitle>
          <AlertDialogDescription>
            This report will appear on your profile for your followers to see.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.stopPropagation(); confirmShare(); }}>
            Share
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}