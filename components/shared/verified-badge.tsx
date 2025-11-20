// components/shared/verified-badge.tsx
import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <BadgeCheck 
      className={`text-primary inline-block ml-1 align-text-bottom ${className}`} 
      aria-label="Verified User"
    />
  );
}