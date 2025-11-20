// app/(site)/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, MessageCircle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications);

      // Mark all as read on visit
      fetch("/api/notifications", { method: "PUT" });
    };
    fetchNotifs();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "upvote": return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "comment": return <MessageCircle className="w-6 h-6 text-blue-500" />;
      case "admin_alert": return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default: return <Bell className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
       <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
         <h1 className="text-xl font-bold">Notifications</h1>
       </div>

       <div className="divide-y divide-border">
         {notifications.length === 0 && (
             <div className="p-8 text-center text-muted-foreground">No notifications yet.</div>
         )}
         
         {notifications.map((notif) => (
           <Link 
             href={notif.reportId ? `/report/${notif.reportId}` : "#"} 
             key={notif._id}
             className={`block p-4 hover:bg-secondary/5 transition-colors ${!notif.read ? "bg-primary/5" : ""}`}
           >
             <div className="flex gap-4">
               <div className="mt-1">{getIcon(notif.type)}</div>
               <div>
                 <p className="text-base">{notif.message}</p>
                 <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt))} ago
                 </p>
               </div>
             </div>
           </Link>
         ))}
       </div>
    </div>
  );
}