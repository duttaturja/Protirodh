"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (data.success) setIsFollowing(data.isFollowing);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      className={`rounded-full font-bold ${isFollowing ? "hover:border-red-500 hover:text-red-500 hover:bg-red-500/10" : ""}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}