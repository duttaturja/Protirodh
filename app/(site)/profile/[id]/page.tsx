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
import { FollowButton } from "@/components/profile/follow-button";

async function getUserProfile(id: string) {
  await connectDB();
  try {
    const user = await User.findById(id).lean();
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
  const isFollowing = user.followers?.includes(session?.user?.id);

  return (
    <div className="min-h-screen bg-background pb-20">
       {/* Header */}
       <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-1 flex items-center gap-6 h-[53px]">
        <Link href="/feed" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none">{user.name}</h1>
            <span className="text-xs text-muted-foreground">{reports.length} posts</span>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 bg-neutral-700 relative"></div>

      {/* Profile Info */}
      <div className="px-4 pb-4 relative">
          {/* Avatar */}
          <div className="w-[134px] h-[134px] rounded-full border-4 border-background bg-background absolute -top-[67px] overflow-hidden">
             <Image 
                src={user.image || "/placeholder-user.jpg"} 
                alt={user.name} 
                fill 
                className="object-cover"
             />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end py-3 gap-2 min-h-[60px]">
             {isOwnProfile ? (
                 <>
                    {user.role === "unverified" && (
                        <Link href="/auth/verify-request">
                            <button className="px-4 py-1.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-colors">
                                Get Verified
                            </button>
                        </Link>
                    )}
                    <Link href="/profile/edit">
                        <button className="px-4 py-1.5 border border-border rounded-full font-bold text-sm hover:bg-secondary transition-colors">
                            Edit profile
                        </button>
                    </Link>
                 </>
             ) : (
                 <FollowButton targetUserId={id} initialIsFollowing={!!isFollowing} />
             )}
          </div>

          {/* Details */}
          <div className="mt-1">
             <h2 className="text-xl font-black flex items-center gap-1 text-foreground">
                {user.name}
                {user.role === "verified" && <BadgeCheck className="w-5 h-5 text-primary" />}
             </h2>
             <p className="text-muted-foreground text-sm">@{user.name.replace(/\s+/g, '').toLowerCase()}</p>
             
             {user.bio && <p className="mt-3 text-sm whitespace-pre-wrap">{user.bio}</p>}

             <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
                <CalendarDays className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
             </div>

             <div className="flex gap-5 mt-3 text-sm">
                <div className="hover:underline cursor-pointer">
                    <span className="font-bold text-foreground">{user.following?.length || 0}</span> <span className="text-muted-foreground ml-1">Following</span>
                </div>
                <div className="hover:underline cursor-pointer">
                    <span className="font-bold text-foreground">{user.followers?.length || 0}</span> <span className="text-muted-foreground ml-1">Followers</span>
                </div>
             </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mt-2">
          <div className="flex-1 text-center h-[53px] flex items-center justify-center hover:bg-secondary/30 cursor-pointer relative">
              <span className="font-bold text-sm text-foreground">Posts</span>
              <div className="absolute bottom-0 h-1 w-14 bg-primary rounded-full"></div>
          </div>
          <div className="flex-1 text-center h-[53px] flex items-center justify-center hover:bg-secondary/30 cursor-pointer">
              <span className="font-medium text-sm text-muted-foreground">Replies</span>
          </div>
          <div className="flex-1 text-center h-[53px] flex items-center justify-center hover:bg-secondary/30 cursor-pointer">
              <span className="font-medium text-sm text-muted-foreground">Media</span>
          </div>
          <div className="flex-1 text-center h-[53px] flex items-center justify-center hover:bg-secondary/30 cursor-pointer">
              <span className="font-medium text-sm text-muted-foreground">Likes</span>
          </div>
      </div>

      {/* Feed */}
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