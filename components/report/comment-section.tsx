"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Send, ShieldAlert, Image as ImageIcon, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/shared/image-upload";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { formatDistanceToNow } from "date-fns";

export function CommentSection({ reportId }: { reportId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [proofImage, setProofImage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch Comments
  useEffect(() => {
    fetch(`/api/comments/${reportId}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []));
  }, [reportId]);

  // Submit Comment
  const handleSubmit = async () => {
    if (!content.trim() || !proofImage) return alert("Proof and text are required.");
    setLoading(true);

    try {
      const res = await fetch("/api/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, content, proofImage, isAnonymous }),
      });

      if (res.ok) {
        const data = await res.json();
        // Optimistic update or re-fetch
        setComments([
            { 
                ...data.comment, 
                author: isAnonymous ? null : { name: session?.user?.name, image: session?.user?.image, role: session?.user?.role } 
            }, 
            ...comments
        ]);
        setContent("");
        setProofImage("");
        setIsAnonymous(false);
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t border-border pt-6">
      <h3 className="text-xl font-bold mb-4">Verified Comments ({comments.length})</h3>

      {/* Comment Input Form */}
      <div className="bg-secondary/30 p-4 rounded-xl mb-8 border border-border">
        <Textarea
          placeholder="Add context or evidence..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-transparent border-none focus-visible:ring-0 text-base p-0 min-h-[80px]"
        />
        
        {/* Proof Preview */}
        {proofImage && (
            <div className="relative w-32 h-32 mt-2 rounded-lg overflow-hidden border border-border">
                <Image src={proofImage} alt="Proof" fill className="object-cover" />
            </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-4">
                {/* Custom Image Trigger for Comment */}
                <div className="relative">
                    <div className="absolute inset-0 opacity-0 cursor-pointer z-10 overflow-hidden w-8 h-8">
                        <ImageUpload onUploadComplete={(url) => setProofImage(url)} className="w-full h-full" />
                    </div>
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                        <ImageIcon className="w-5 h-5" />
                    </Button>
                </div>
                
                <div className="flex items-center gap-2">
                    <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} id="anon-comment" />
                    <Label htmlFor="anon-comment" className="text-xs text-muted-foreground cursor-pointer">Anonymous</Label>
                </div>
            </div>

            <Button 
                onClick={handleSubmit} 
                disabled={loading || !content || !proofImage}
                className="rounded-full bg-primary hover:bg-primary/90 font-bold"
            >
                {loading ? "Posting..." : "Reply"}
            </Button>
        </div>
        {!proofImage && <p className="text-xs text-red-500 mt-2">* Proof image is required to comment.</p>}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-3">
             <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden relative">
                    {/* Handle anonymous display logic */}
                    {(comment.author && !comment.isAnonymous) ? (
                        <Image src={comment.author.image || "/placeholder-user.jpg"} alt="Avatar" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white text-[10px]">?</div>
                    )}
                </div>
             </div>
             <div className="flex-1 bg-secondary/20 p-3 rounded-xl rounded-tl-none">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm flex items-center gap-1">
                        {(comment.author && !comment.isAnonymous) ? comment.author.name : "Anonymous Witness"}
                        {(comment.author?.role === "verified" && !comment.isAnonymous) && <VerifiedBadge className="w-3 h-3" />}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                </div>
                <p className="text-sm mb-2">{comment.content}</p>
                
                {/* Proof Badge & Image Toggle */}
                <div className="mt-2">
                    <div className="text-xs font-medium text-primary flex items-center gap-1 mb-1">
                        <ShieldAlert className="w-3 h-3" /> Proof Attached
                    </div>
                    <div className="relative h-24 w-40 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity">
                         <Image src={comment.proofImage} alt="Proof" fill className="object-cover" />
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}