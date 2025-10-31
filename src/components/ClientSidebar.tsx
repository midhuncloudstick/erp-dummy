import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Server, 
  FileText, 
  FolderOpen, 
  HelpCircle, 
  Settings,
  User,
  GraduationCap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const clientMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Services",
    url: "/my-services",
    icon: Server,
  },
  {
    title: "Invoices", 
    url: "/invoices",
    icon: FileText,
  },

  {
    title: "Support",
    url: "/support",
    icon: HelpCircle,
  },
  {
    title: "Profile Settings",
    url: "/profile",
    icon: Settings,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderOpen,
    disabled: true,
    tooltip: "Coming Soon",
  },
  {
    title: "Training",
    url: "/training",
    icon: GraduationCap,
    disabled: true,
    tooltip: "Coming Soon",
  },
];

interface ClientSidebarProps {
  user: {
    full_name: string;
    email: string;
  };
}

export function ClientSidebar({ user }: ClientSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Logo and Brand */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" 
              alt="CloudHouse Technologies" 
              className="h-8 w-8 rounded"
            />
            {state !== "collapsed" && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">CloudHouse Portal</h2>
                {/* <p className="text-xs text-muted-foreground">Technologies</p> */}
              </div>
            )}
          </div>
        </div>


        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clientMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.disabled ? (
                    <SidebarMenuButton>
                      <div
                        aria-disabled
                        className="text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none flex items-center gap-2  py-2 rounded-md"
                        title={state === "collapsed" ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </div>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavCls}
                        title={state === "collapsed" ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}