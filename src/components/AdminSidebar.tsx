import { NavLink, useLocation } from "react-router-dom"
import {
  Users,
  Building,
  Package,
  Tag,
  UserCheck,
  Briefcase,
  LayoutDashboard,
  FolderOpen,
  Ticket,
  Settings,
  Home,
  UserPlus,
  Plus,
  FileCheck,
  Clock,
  TrendingUp,
  DollarSign,
  CircleHelp
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Important Missions", url: "/important-missions", icon: FileCheck },
  { title: "Projects", url: "/projects", icon: FolderOpen },
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Leads", url: "/leads", icon: UserPlus },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Middle Man", url: "/middleman", icon: UserCheck },
  { title: "Industries", url: "/industry", icon: Building },
  { title: "Products", url: "/product", icon: Package },
  { title: "Services", url: "/services", icon: Tag },
  { title: "Employees", url: "/employees", icon: Briefcase },
  { title: "Shift Management", url: "/shifts", icon: Clock },
  { title: "Salary Forecast", url: "/salary-forecast", icon: TrendingUp },
  { title: "Income Forecast", url: "/income-forecast", icon: DollarSign },
  { title: "Roles & Departments", url: "/roles-departments", icon: UserCheck },
    { title: "Support", url: "/admin-support", icon: CircleHelp },


]

const quickActions = [
  { title: "Create Project", url: "/projects/create", icon: Plus },
  { title: "Create Lead", url: "/leads/create", icon: UserPlus },
  { title: "Add Customer", url: "/customers/add", icon: Users },
  { title: "Add Task", url: "#", icon: Plus, action: "createTodo" },
  { title: "Create Clearance Request", url: "/clearance-request/create", icon: FileCheck },
]

interface AdminSidebarProps {
  onOpenCreateTodo?: () => void;
}

export function AdminSidebar({ onOpenCreateTodo }: AdminSidebarProps) {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/" || currentPath === "/admin"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = (isActiveItem: boolean) =>
    isActiveItem 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} bg-sidebar-bg`}
      collapsible="icon"
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center border-b bg-gradient-to-b from-primary/5 to-sidebar-bg px-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" 
            alt="CloudHouse Technologies" 
            className="h-8 w-auto"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">CloudHouse</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton asChild>
                    {action.action === "createTodo" ? (
                      <button 
                        onClick={onOpenCreateTodo}
                        className={`w-full flex items-center gap-2 ${getNavCls(false)}`}
                      >
                        <action.icon className="h-4 w-4" />
                        {!collapsed && <span>{action.title}</span>}
                      </button>
                    ) : (
                      <NavLink 
                        to={action.url} 
                        className={getNavCls(isActive(action.url))}
                      >
                        <action.icon className="h-4 w-4" />
                        {!collapsed && <span>{action.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}