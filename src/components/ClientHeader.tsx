import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

interface ClientHeaderProps {
  user: User;
  title?: string;
  onLogout: () => void;
}

const ClientHeader = ({ user, title = "Dashboard", onLogout }: ClientHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div className="h-6 w-px bg-border" />
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
          </Button>
          
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
