// app/(site)/feed/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ReportCard } from "@/components/feed/report-card";
import { Button } from "@/components/ui/button";
import { Loader2, PenSquare } from "lucide-react";
import Link from "next/link";

export default function FeedPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`/api/reports/feed?page=${page}`);
        const data = await res.json();
        setReports(data.reports);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [page]);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Home</h1>
        <div className="md:hidden">
          {/* Mobile User Icon or Menu could go here */}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Feed List */}
      <div className="flex flex-col">
        {reports.map((report) => (
          <ReportCard key={report._id} report={report} currentUserId={session?.user?.id} />
        ))}
      </div>

      {/* Floating Action Button (Mobile) */}
      <Link href="/feed/create">
        <div className="fixed bottom-20 right-4 md:hidden bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 z-50">
          <PenSquare className="w-6 h-6" />
        </div>
      </Link>
    </div>
  );
}