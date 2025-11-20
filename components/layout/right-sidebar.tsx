// components/layout/right-sidebar.tsx
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function RightSidebar() {
  return (
    <div className="hidden lg:block w-[350px] pl-8 py-4 sticky top-0 h-screen border-l border-border bg-background z-10">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input 
          placeholder="Search Protirodh" 
          className="pl-10 rounded-full bg-secondary border-transparent focus:bg-background focus:border-primary"
        />
      </div>

      {/* Trending Card (Placeholder) */}
      <div className="bg-secondary/30 rounded-xl p-4 border border-border">
        <h2 className="font-bold text-xl mb-4">What&apos;s happening</h2>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Trending in Bangladesh</div>
          <div className="font-bold">#DhakaTraffic</div>
          <div className="text-xs text-muted-foreground">5,400 posts</div>
        </div>
        {/* Add more items dynamically later */}
      </div>
    </div>
  );
}