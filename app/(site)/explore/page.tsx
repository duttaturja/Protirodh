"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Filter, Loader2 } from "lucide-react";
import { ReportCard } from "@/components/feed/report-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";

const DIVISIONS = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];

export default function ExplorePage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("type", "explore");
        if (divisionFilter !== "all") params.set("division", divisionFilter);
        if (searchQuery) params.set("search", searchQuery);
        
        const res = await fetch(`/api/reports/feed?${params.toString()}`);
        const data = await res.json();
        
        setReports(data.reports || []);
      } catch (error) {
        console.error(error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchExplore, 500); // Debounce
    return () => clearTimeout(timer);
  }, [divisionFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 space-y-4">
        <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search locations, crimes..." 
              className="pl-9 rounded-full bg-secondary border-transparent focus:bg-background focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger className="w-[160px] h-9 rounded-full text-sm bg-background border-border">
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
      </div>

      {/* Content Area */}
      <div className="p-0">
        {loading ? (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : reports.length > 0 ? (
            reports.map((report: any) => (
                <ReportCard key={report._id} report={report} currentUserId={session?.user?.id} />
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