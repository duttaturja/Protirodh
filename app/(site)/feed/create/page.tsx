// app/(site)/feed/create/page.tsx
import { CreateReportForm } from "@/components/feed/create-report-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateReportPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
        <Link href="/feed" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Report Incident</h1>
      </div>

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <CreateReportForm />
      </div>
    </div>
  );
}