import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Wallet, Receipt, Handshake, ListChecks, BarChart3, Settings, Target, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { QuickActionsProvider } from "@/components/quick-actions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Layout,
});

const nav = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Income", url: "/income", icon: Wallet },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Deals & Pipeline", url: "/deals", icon: Handshake },
  { title: "Daily Activity", url: "/activity", icon: ListChecks },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { state, setOpenMobile } = useSidebar();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2 font-semibold text-sidebar-accent-foreground">
          <Target className="h-5 w-5 shrink-0 text-sidebar-primary" />
          {state === "expanded" && <span className="truncate">Money Mission</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((n) => (
                <SidebarMenuItem key={n.url}>
                  <SidebarMenuButton asChild isActive={path === n.url} tooltip={n.title}>
                    <Link to={n.url} onClick={() => setOpenMobile(false)}>
                      <n.icon />
                      <span>{n.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Sign out">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">60-Day Money Mission</span>
          </header>
          <QuickActionsProvider>
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:px-6">
              <Outlet />
            </main>
          </QuickActionsProvider>
        </div>
      </div>
    </SidebarProvider>
  );
}
