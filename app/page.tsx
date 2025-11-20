// app/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, Activity, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect to feed if already logged in
  useEffect(() => {
    if (session) {
      router.push("/feed");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="bg-primary/10 p-2 rounded-full">
             <Shield className="w-6 h-6 text-primary" />
           </div>
           <span className="text-2xl font-black tracking-tight">Protirodh.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="font-bold text-base hover:bg-secondary/50">Sign in</Button>
          </Link>
          <Link href="/auth/register">
            <Button className="rounded-full px-6 font-bold bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105">
              Sign up
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden pt-10 md:pt-20 pb-20">
        
        {/* Animated Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] -z-10 animate-pulse" />
        
        <div className="max-w-5xl mx-auto space-y-8 z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Activity className="w-4 h-4" />
            <span>Live Crime Reporting & Community Verification</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Protect Your Community <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-600">
              With Real Evidence.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            The first AI-powered platform to report incidents, verify truth with the community, and build a safer Bangladesh together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="/auth/register" className="w-full sm:w-auto">
               <Button size="lg" className="w-full h-14 px-10 text-lg rounded-full font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105">
                 Join the Movement <ArrowRight className="ml-1 w-5 h-5" />
               </Button>
            </Link>
            <Link href="/explore" className="w-full sm:w-auto">
               <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg rounded-full font-bold border-2 hover:bg-secondary/50 transition-all hover:scale-105">
                 View Live Map
               </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl mx-auto text-left w-full px-4">
           <FeatureCard 
             icon={<Shield className="w-8 h-8 text-green-500" />}
             title="Verified Reports"
             desc="Community voting and AI analysis ensure only real incidents reach the top. No more fake news."
           />
           <FeatureCard 
             icon={<Users className="w-8 h-8 text-blue-500" />}
             title="Anonymous Safety"
             desc="Report without fear. Your identity is cryptographically protected until you choose to reveal it."
           />
           <FeatureCard 
             icon={<MapPin className="w-8 h-8 text-red-500" />}
             title="Heatmap Analytics"
             desc="Visualize danger zones in real-time with our interactive country-wide heatmap."
           />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40 bg-secondary/10">
        <p>© 2025 Protirodh. Built for the people, by the people.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group p-8 rounded-3xl border border-border/50 bg-card hover:bg-secondary/30 transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 cursor-default">
      <div className="mb-4 p-3 bg-secondary/50 rounded-2xl w-fit group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}