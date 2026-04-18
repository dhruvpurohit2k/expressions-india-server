import AppSidebar from "#/components/app-sidebar";
import Header from "#/components/Header";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { silentRefresh } from "#/lib/api";
import { getStoredUser } from "#/lib/auth";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    // Fast path: valid admin session already in localStorage
    if (getStoredUser()?.isAdmin) return;

    // No admin session — try to refresh via the HTTP-only refresh token cookie
    const ok = await silentRefresh();
    if (!ok) {
      throw redirect({ to: "/login", replace: true });
    }

    // After refresh, verify the user is actually an admin
    if (!getStoredUser()?.isAdmin) {
      throw redirect({ to: "/login", replace: true });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider
      style={
        {
          flexDirection: "column",
          "--sidebar-width": "10rem",
          "--sidebar-width-mobile": "7.5rem",
        } as React.CSSProperties
      }
    >
      <Header />
      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar />
        <SidebarInset className="overflow-hidden flex-1">
          <main className="h-[calc(100dvh-80px)] overflow-y-auto">
            <div className="max-w-7xl mx-auto lg:px-6 py-10">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
