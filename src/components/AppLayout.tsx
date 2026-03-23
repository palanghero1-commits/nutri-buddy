import { ReactNode } from "react";
import { Menu } from "lucide-react";
import AppSidebar, { MobileSidebarContent } from "./AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      {isMobile && (
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur md:hidden">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div>
              <p className="text-base font-bold text-foreground">Nutri-Track</p>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <MobileSidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>
      )}
      <main className="transition-all duration-300 md:ml-[240px]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
