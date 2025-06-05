import { SidebarTrigger } from "@/components/ui/sidebar";
import HeaderAuth from "@/components/ux/HeaderAuth";
import ModeToggle from "@/components/ux/ModeToggle";

export default function AppNavbar() {
  return (
    <header className="flex h-14 z-50 w-full border-b border-border shadow">
      <div className="flex w-full h-14 px-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="flex md:hidden" />
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}