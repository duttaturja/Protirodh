"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, PenSquare, Settings, Phone, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const bottomLinks = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/explore", icon: Search, label: "Explore" },
    { href: `/profile/${session?.user?.id}`, icon: User, label: "Profile" }, 
    { href: "/notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <>
      {/* TOP MOBILE NAVBAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-[53px] border-b border-border bg-background/85 backdrop-blur-md z-50 flex items-center justify-between px-4">
        
        {/* Settings Link */}
        <Link href="/settings">
             <div className="p-2 -ml-2 rounded-full hover:bg-secondary/20 transition-colors">
                <Settings className="w-5 h-5" />
             </div>
        </Link>

        {/* Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 font-black text-lg text-primary">
            Protirodh.
        </div>

        {/* Emergency Resources Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 mr-2">
              <Phone className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background border border-border rounded-xl shadow-lg">
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Emergency Call</div>
            <DropdownMenuItem>
              <a href="tel:999" className="flex items-center w-full gap-2">
                <span className="font-bold text-red-500">999</span> National Emergency
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a href="tel:109" className="flex items-center w-full gap-2">
                <span className="font-bold text-purple-500">109</span> Women Helpline
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* FLOATING ACTION BUTTON (Post) */}
      <Link href="/feed/create" className="md:hidden fixed bottom-20 right-4 z-50">
        <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-xl hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center">
          <PenSquare className="w-6 h-6" />
        </div>
      </Link>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/85 backdrop-blur-md z-50 pb-safe safe-area-pb">
        <div className="flex justify-around items-center h-[53px]">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex-1 flex justify-center items-center h-full transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:bg-secondary/10"
                )}
              >
                <div className="relative p-2">
                   <Icon className={cn("w-6 h-6", isActive ? "fill-current stroke-[2.5px]" : "stroke-2")} />
                   {link.label === "Notifications" && (
                     <span className="absolute top-1 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background hidden" />
                   )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}