import { ReactNode } from "react";
import { Bell, ChevronDown, Leaf, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppSidebar, { MobileSidebarContent } from "./AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { staffRole, staffUser } = useAuth();
  const navigate = useNavigate();
  const portalLabel = staffRole === "bhw" ? "BHW Portal" : "Admin Portal";

  return (
    <div className="min-h-screen bg-[#f4f8ff]">
      <AppSidebar />
      <main className="transition-all duration-300 md:ml-[240px]">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-[#dfe9f8] bg-white/90 px-4 py-3 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            {isMobile && <Sheet><SheetTrigger asChild><button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce7f7] bg-white text-[#142650]"><Menu className="h-5 w-5" /><span className="sr-only">Open navigation</span></button></SheetTrigger><SheetContent side="left" className="w-[280px] p-0"><MobileSidebarContent /></SheetContent></Sheet>}
            <div className="flex items-center gap-2.5 md:hidden"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"><Leaf className="h-5 w-5 text-primary-foreground" /></div><div><p className="text-base font-bold text-[#142650]">Nutri-Track</p><p className="text-[11px] text-[#7990b5]">Child Nutrition Tracker</p></div></div>
            <div className="hidden md:block"><p className="text-sm font-semibold text-[#7990b5]">{portalLabel}</p><p className="text-xs text-[#9aacC7]">Child Nutrition Tracker</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <button type="button" aria-label="Notifications" className="relative rounded-full p-2 text-[#7f91b1] hover:bg-[#eef5ff]"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#ed4f61]" /></button>
            <button type="button" onClick={() => staffRole === "bhw" && navigate("/bhw/profile")} className="flex items-center gap-2 rounded-full p-1 text-left hover:bg-[#eef5ff]"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f5bb9d] to-[#8a5b4e] text-xs font-bold text-white">{(staffUser?.name || "Staff").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><span className="hidden max-w-32 truncate text-sm font-semibold text-[#142650] sm:block">{staffUser?.name || "Staff"}</span><ChevronDown className="h-4 w-4 text-[#7f91b1]" /></button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
