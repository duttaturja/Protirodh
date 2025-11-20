"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Filter } from "lucide-react";
import { ReportCard } from "@/components/feed/report-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DIVISIONS = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"foryou" | "trending">("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch logic based on tabs and filters
  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        // Build query string
        const params = new URLSearchParams();
        if (activeTab === "trending") params.set("sort", "verification"); // Trending = High verification score
        if (divisionFilter !== "all") params.set("division", divisionFilter);
        
        // In a real app, you'd have a specific search API. 
        // For MVP, we reuse the feed API which supports filtering.
        const res = await fetch(`/api/reports/feed?${params.toString()}`);
        const data = await res.json();
        
        // Client-side search filter for MVP simplicity (Server-side is better for scale)
        let filtered = data.reports;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter((r: any) => 
            r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
          );
        }
        
        setReports(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(fetchExplore, 300);
    return () => clearTimeout(timer);
  }, [activeTab, divisionFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-2">
        <div className="flex items-center gap-2 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search people, reports, locations..." 
              className="pl-9 rounded-full bg-secondary border-transparent focus:bg-background focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:hidden">
             {/* Mobile Filter Trigger could go here */}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mt-1">
          <button 
            onClick={() => setActiveTab("foryou")}
            className={`flex-1 py-3 text-sm font-bold text-center hover:bg-secondary/50 relative ${activeTab === "foryou" ? "text-foreground" : "text-muted-foreground"}`}
          >
            For you
            {activeTab === "foryou" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("trending")}
            className={`flex-1 py-3 text-sm font-bold text-center hover:bg-secondary/50 relative ${activeTab === "trending" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Trending
            {activeTab === "trending" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4 border-b border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className="w-[130px] h-8 rounded-full text-xs bg-background border-border">
               <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="all">All Bangladesh</SelectItem>
               {DIVISIONS.map(div => (
                   <SelectItem key={div} value={div}>{div}</SelectItem>
               ))}
            </SelectContent>
        </Select>
      </div>

      {/* Results Feed */}
      <div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : reports.length > 0 ? (
          reports.map((report: any) => (
            <ReportCard key={report._id} report={report} /> // Pass currentUserId if available via Context
          ))
        ) : (
          <div className="p-10 text-center">
             <TrendingUp className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
             <p className="text-muted-foreground font-medium">No reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}