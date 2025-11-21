"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, User, LogOut, Settings, ShieldAlert, Phone, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Radio } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sosLoading, setSosLoading] = useState(false);

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

  const handleSOS = () => {
      if (!confirm("Send SOS alert to your followers with your current location?")) return;
      
      setSosLoading(true);
      
      if (!navigator.geolocation) {
          toast.error("Geolocation is not supported by your browser");
          setSosLoading(false);
          return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
          try {
              const { latitude, longitude } = position.coords;
              const res = await fetch("/api/sos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ latitude, longitude }),
              });
              
              const data = await res.json();
              if (res.ok) {
                  toast.success("SOS Alert Sent!", { description: data.message });
              } else {
                  toast.error(data.message);
              }
          } catch (e) {
              toast.error("Failed to send SOS");
          } finally {
              setSosLoading(false);
          }
      }, () => {
          toast.error("Unable to retrieve your location");
          setSosLoading(false);
      });
  };

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
            className="flex items-center gap-4 px-4 py-2 text-xl text-red-500 hover:bg-red-50 rounded-full w-fit mx-4"
            onClick={() => signOut()}
        >
            <LogOut className="w-7 h-7" />
            <span>Logout</span>
        </Button>
      </nav>

      {/* Emergency Resources Widget */}
      <div className="bg-secondary/30 rounded-2xl border border-border overflow-hidden p-4">
        <h2 className="font-extrabold text-xl pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-500" /> Emergency
        </h2>
        <div className="space-y-3">
            <a href="tel:999" className="flex items-center justify-between p-3 bg-background rounded-xl border border-border hover:bg-transparent hover:border-red-200 transition-colors group">
                <div>
                    <div className="font-bold text-sm">National Emergency</div>
                    <div className="text-xs text-muted-foreground">Police, Fire, Ambulance</div>
                </div>
                <span className="text-xl font-black text-red-500 group-hover:scale-110 transition-transform">999</span>
            </a>
            <a href="tel:109" className="flex items-center justify-between p-3 bg-background rounded-xl border border-border hover:bg-transparent hover:border-purple-500/30 transition-colors group">
                <div>
                    <div className="font-bold text-sm">Women & Child</div>
                    <div className="text-xs text-muted-foreground">Helpline</div>
                </div>
                <span className="text-xl font-black text-purple-500 group-hover:scale-110 transition-transform">109</span>
            </a>
            <a href="https://www.police.gov.bd/" target="_blank" className="flex items-center justify-between p-3 bg-background rounded-xl border border-border hover:bg-blue-500/5 hover:border-blue-500/30 transition-colors group">
                <div className="font-bold text-sm">Bangladesh Police</div>
                <ExternalLink className="w-4 h-4 text-blue-500" />
            </a>
        </div>
      </div>

      {/* Post Button */}
      <div className="py-4">
        <Link href="/feed/create">
          <Button className="w-full h-12 text-lg font-bold rounded-full bg-primary hover:bg-primary/90 shadow-lg">
            Post
          </Button>
        </Link>
      </div>
    </div>
  );
}