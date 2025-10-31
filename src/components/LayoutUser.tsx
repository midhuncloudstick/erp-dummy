import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import ThemeToggle from '../components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Search, User as UserIcon, LogOut } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { logout } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';


interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

interface LayoutUserProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function LayoutUser({ children, title, subtitle, actions }: LayoutUserProps) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch =useAppDispatch()


  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    console.log("user",savedUser);
    
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
     
        setUser(parsed);
      
    } else {
      navigate('/');
    }
  }, [navigate]);

    const handleLogout = () => {
      dispatch(logout());
      navigate('/');
    };

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path === '/admin' || path === '/') return 'Dashboard';
    if (path.startsWith('/customers')) return 'Customer Management';
    if (path.startsWith('/projects')) return 'Project Management';
    if (path.startsWith('/leads')) return 'Lead Management';
    if (path.startsWith('/employees')) return 'Employee Management';
    if (path.startsWith('/services')) return 'Services Management';
    if (path.startsWith('/products')) return 'Product Management';
    if (path.startsWith('/industry')) return 'Industry Management';
    if (path.startsWith('/middleman')) return 'Middle Man Management';
    if (path.startsWith('/tickets')) return 'Ticket Management';
    return 'CloudHouse Admin';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 w-full border-b bg-sidebar-bg/80 backdrop-blur supports-[backdrop-filter]:bg-sidebar-bg/60">
          <div className="flex h-16 items-center gap-3 px-4">
            <SidebarTrigger className="text-muted-foreground" />
            {/* <img src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" alt="CloudHouse" className="h-7 w-auto" /> */}
            <div className="flex flex-col">
              <div className="text-base font-semibold leading-tight">{getPageTitle()}</div>
              {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search projects, tickets..." className="pl-9 w-[280px]" />
                </div>
              </div>
              {actions}
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2 rounded-md border px-2 py-1.5">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm font-medium truncate max-w-[160px]">{user.name}</span>
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-content-bg p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
