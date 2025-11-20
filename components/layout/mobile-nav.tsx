// components/layout/mobile-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/feed", icon: Home },
    { href: "/explore", icon: Search },
    { href: "/notifications", icon: Bell },
    { href: `/profile/${session?.user?.id}`, icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-md z-50 pb-safe">
      <div className="flex justify-around items-center h-14">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "p-2 rounded-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}