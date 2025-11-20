import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center min-h-screen max-w-[1300px] mx-auto">
      {/* Desktop Sidebar (Left) */}
      <Sidebar />

      {/* Main Feed Area */}
      <main className="flex-1 max-w-[600px] w-full border-r border-border min-h-screen pb-20 md:pb-0">
        {children}
      </main>

      {/* Desktop Sidebar (Right) */}
      <RightSidebar />

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}