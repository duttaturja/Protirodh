"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, User, LogOut, Settings, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/feed", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: `/profile/${session?.user?.id}`, label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  // Add Admin Dashboard if user is admin
  if (session?.user?.role === "admin") {
      links.push({ href: "/admin", label: "Admin Dashboard", icon: ShieldAlert });
  }

  return (
    <div className="hidden md:flex flex-col h-screen sticky top-0 w-[275px] px-4 border-r border-border bg-background z-30">
      {/* Logo Area */}
      <div className="py-4">
        <h1 className="text-2xl font-black text-primary px-4">Protirodh.</h1>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 text-xl transition-colors rounded-full w-fit",
                isActive ? "font-bold text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
              )}
            >
              <Icon className={cn("w-7 h-7", isActive && "fill-current")} />
              <span>{link.label}</span>
            </Link>
          );
        })}
        
        <Button 
            variant="ghost" 
            className="flex items-center gap-4 px-4 py-3 text-xl text-red-500 hover:bg-red-50 rounded-full w-fit mt-4"
            onClick={() => signOut()}
        >
            <LogOut className="w-7 h-7" />
            <span>Logout</span>
        </Button>
      </nav>

      {/* Post Button */}
      <div className="py-6">
        <Link href="/feed/create">
          <Button className="w-full h-12 text-lg font-bold rounded-full bg-primary hover:bg-primary/90 shadow-lg">
            Post
          </Button>
        </Link>
      </div>
    </div>
  );
}