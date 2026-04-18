import { Outlet, createRootRoute } from "@tanstack/react-router";

import "../styles.css";
import { Toaster } from "#/components/ui/sonner";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Toaster />
      <main className="h-full">
        <Outlet />
      </main>
    </>
  );
}
