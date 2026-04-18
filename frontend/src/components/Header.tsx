import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { logout } from "#/features/auth/api/logout";

export default function Header() {
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="h-20 md:px-10 flex items-center border-b border-b-neutral-200/50">
      <SidebarTrigger
        className="ml-3 text-neutral-700 hover:text-red-600 hover:bg-red-50 rounded size-10!"
        size={"icon-lg"}
      >
        <Menu className="size-6!" strokeWidth={2} />
      </SidebarTrigger>
      <div className="ml-3 rounded lg:text-3xl text-xl font-delius bg-red text-white px-10">
        Expressions India
        <span className="text-sm font-semibold"> (admin panel)</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto mr-2 gap-2 text-muted-foreground hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  );
}
