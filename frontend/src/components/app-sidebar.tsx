import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#/components/ui/sidebar";
import { useNavigate } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import {
  Home,
  CalendarDays,
  BookOpen,
  Mic,
  MessageSquare,
  Users,
  Newspaper,
  ScrollText,
  UsersRound,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, to: "/admin" as const },
  { label: "Events", icon: CalendarDays, to: "/admin/event" as const },
  { label: "Journals", icon: ScrollText, to: "/admin/journal" as const },
  { label: "Podcast", icon: Mic, to: "/admin/podcast" as const },
  { label: "Course", icon: BookOpen, to: "/admin/course" as const },
  { label: "Enquiries", icon: MessageSquare, to: "/admin/enquiry" as const },
  { label: "Articles", icon: Newspaper, to: "/admin/article" as const },
  { label: "Audience", icon: Users, to: "/admin/audience" as const },
  { label: "Team", icon: UsersRound, to: "/admin/team" as const },
] as const;

export default function AppSidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="mt-20">
      <SidebarContent className="pt-6">
        <SidebarGroup>
          <SidebarMenu className="gap-1 px-0">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.to !== null &&
                (item.to === "/admin"
                  ? pathname === "/admin" || pathname === "/admin/"
                  : pathname.startsWith(item.to));

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={isActive}
                    disabled={item.to === null}
                    onClick={() => item.to && navigate({ to: item.to })}
                    className="gap-3 py-6 text-base"
                  >
                    <item.icon className="size-5! shrink-0!" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
