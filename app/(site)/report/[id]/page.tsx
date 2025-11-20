import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, MapPin, Calendar, AlertTriangle, BadgeCheck } from "lucide-react";
import connectDB from "@/lib/mongodb";
import CrimeReport from "@/models/CrimeReport";
import User from "@/models/User"; // Necessary for population
import { CommentSection } from "@/components/report/comment-section"; // <--- Added Import

// Fetch data directly in Server Component
async function getReport(id: string) {
  await connectDB();
  try {
    // We need to populate author for the report card details
    const report = await CrimeReport.findById(id).populate("author", "name image role").lean();
    if (!report) return null;
    // Convert MongoDB ObjectId and Dates to strings/numbers for React hydration
    return JSON.parse(JSON.stringify(report)); 
  } catch (e) {
    return null;
  }
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) return notFound();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-4">
        <Link href="/feed" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      <div className="p-4">
        {/* User Info Row */}
        <div className="flex gap-3 items-center mb-3">
           <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden relative">
             {report.isAnonymous ? (
               <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white text-xs">?</div>
             ) : (
               <Image 
                 src={report.author?.image || "/placeholder-user.jpg"} 
                 alt="Avatar" 
                 fill 
                 className="object-cover"
               />
             )}
          </div>
          <div>
             <div className="font-bold text-base flex items-center gap-1">
                {report.isAnonymous ? "Anonymous" : report.author?.name}
                {!report.isAnonymous && report.author?.role === "verified" && <BadgeCheck className="w-4 h-4 text-primary" />}
             </div>
             <div className="text-sm text-muted-foreground">
                {report.isAnonymous ? "@anonymous" : `@${report.author?.name?.replace(/\s+/g, '').toLowerCase()}`}
             </div>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold mb-2">{report.title}</h2>
        <p className="text-base whitespace-pre-wrap mb-4 text-foreground/90">{report.description}</p>

        {/* Meta Info Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1 text-sm bg-secondary px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4 text-primary" />
                {report.district}, {report.division}
            </div>
             <div className="flex items-center gap-1 text-sm bg-secondary px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 text-primary" />
                {format(new Date(report.crimeTime), "PP p")}
            </div>
             {report.aiConfidenceScore < 30 && (
                 <div className="flex items-center gap-1 text-sm bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full border border-yellow-500/20">
                    <AlertTriangle className="w-4 h-4" />
                    AI Flag: High Fake Risk
                </div>
             )}
        </div>

        {/* Full Images */}
        {report.images && report.images.map((img: string, idx: number) => (
          <div key={idx} className="relative w-full rounded-xl overflow-hidden border border-border mb-4 aspect-video">
             <Image src={img} alt="Evidence" fill className="object-cover" />
          </div>
        ))}

        <div className="border-t border-border py-3 text-sm text-muted-foreground">
             {format(new Date(report.createdAt), "h:mm a · MMM d, yyyy")} · Protirodh Web
        </div>
        
        <div className="border-y border-border py-3 flex justify-around text-muted-foreground">
            <div className="text-center">
                <span className="font-bold text-foreground">{report.upvotes?.length || 0}</span> <span className="text-sm">Upvotes</span>
            </div>
            <div className="text-center">
                <span className="font-bold text-foreground">{report.downvotes?.length || 0}</span> <span className="text-sm">Downvotes</span>
            </div>
             <div className="text-center">
                <span className="font-bold text-foreground">{report.verificationScore || 0}</span> <span className="text-sm">Score</span>
            </div>
        </div>

        {/* INTEGRATED COMMENT SECTION */}
        <CommentSection reportId={report._id} />
        
      </div>
    </div>
  );
}