// app/(site)/profile/[id]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, BadgeCheck } from "lucide-react";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import CrimeReport from "@/models/CrimeReport";
import { ReportCard } from "@/components/feed/report-card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FollowButton } from "@/components/profile/follow-button"; // Ensure you create this component

async function getUserProfile(id: string) {
  await connectDB();
  try {
    const user = await User.findById(id).lean();
    // Find reports authored by user OR shared by user
    const reports = await CrimeReport.find({ author: id })
      .sort({ createdAt: -1 })
      .populate("author", "name image role")
      .populate({
         path: "sharedFrom",
         populate: { path: "author", select: "name image role" }
      })
      .lean();
    
    if (!user) return null;
    return { user: JSON.parse(JSON.stringify(user)), reports: JSON.parse(JSON.stringify(reports)) };
  } catch (e) {
    return null;
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const data = await getUserProfile(id);

  if (!data) return notFound();
  const { user, reports } = data;
  
  const isOwnProfile = session?.user?.id === id;
  // Check if logged-in user is in the profile owner's followers list
  const isFollowing = user.followers?.includes(session?.user?.id);

  return (
    <div className="min-h-screen bg-background pb-20">
       {/* Sticky Header */}
       <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-1 flex items-center gap-6">
        <Link href="/feed" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="py-1">
            <h1 className="text-lg font-bold leading-tight">{user.name}</h1>
            <span className="text-xs text-muted-foreground">{reports.length} posts</span>
        </div>
      </div>

      {/* Banner Image */}
      <div className="h-32 bg-secondary relative">
         {/* Placeholder for banner */}
      </div>

      {/* Profile Info Section */}
      <div className="px-4 pb-4 relative">
          {/* Floating Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-background bg-muted absolute -top-16 overflow-hidden">
             <Image 
                src={user.image || "/placeholder-user.jpg"} 
                alt={user.name} 
                fill 
                className="object-cover"
             />
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex justify-end py-3 h-16 gap-2">
             {isOwnProfile ? (
                 <>
                    {/* Verify Button (If Needed) */}
                    {user.role === "unverified" && (
                        <Link href="/auth/verify-request">
                            <button className="px-4 py-1.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-colors shadow-md">
                                Get Verified
                            </button>
                        </Link>
                    )}
                    
                    {/* Edit Profile */}
                    <Link href="/profile/edit">
                        <button className="px-4 py-1.5 border border-border rounded-full font-bold text-sm hover:bg-secondary transition-colors">
                            Edit profile
                        </button>
                    </Link>
                 </>
             ) : (
                 /* Follow Button for Others */
                 <FollowButton targetUserId={id} initialIsFollowing={!!isFollowing} />
             )}
          </div>

          {/* User Details */}
          <div className="mt-2">
             <h2 className="text-xl font-black flex items-center gap-1">
                {user.name}
                {user.role === "verified" && <BadgeCheck className="w-5 h-5 text-primary" />}
             </h2>
             <p className="text-muted-foreground text-sm">@{user.name.replace(/\s+/g, '').toLowerCase()}</p>
             
             {user.bio && <p className="mt-3 text-sm whitespace-pre-wrap">{user.bio}</p>}

             <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
                <CalendarDays className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
             </div>

             <div className="flex gap-4 mt-3 text-sm">
                <div className="hover:underline cursor-pointer">
                    <span className="font-bold text-foreground">{user.following?.length || 0}</span> <span className="text-muted-foreground">Following</span>
                </div>
                <div className="hover:underline cursor-pointer">
                    <span className="font-bold text-foreground">{user.followers?.length || 0}</span> <span className="text-muted-foreground">Followers</span>
                </div>
             </div>
          </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex border-b border-border mt-2">
          <div className="flex-1 text-center py-3 font-bold text-sm border-b-4 border-primary cursor-pointer hover:bg-secondary/30 transition-colors">
              Posts
          </div>
          <div className="flex-1 text-center py-3 font-medium text-sm text-muted-foreground cursor-pointer hover:bg-secondary/30 transition-colors">
              Replies
          </div>
          <div className="flex-1 text-center py-3 font-medium text-sm text-muted-foreground cursor-pointer hover:bg-secondary/30 transition-colors">
              Media
          </div>
          <div className="flex-1 text-center py-3 font-medium text-sm text-muted-foreground cursor-pointer hover:bg-secondary/30 transition-colors">
              Likes
          </div>
      </div>

      {/* User Posts Feed */}
      <div>
         {reports.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground">
                 <p className="text-lg font-bold mb-1">No posts yet</p>
                 <p className="text-sm">When {user.name} posts, you&apos;ll see them here.</p>
             </div>
         ) : (
             reports.map((report: any) => (
                 <ReportCard key={report._id} report={report} currentUserId={session?.user?.id} />
             ))
         )}
      </div>
    </div>
  );
}