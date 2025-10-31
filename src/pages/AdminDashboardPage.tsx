import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import AdminDashboard from '../components/AdminDashboard';
import LoginForm from '../components/LoginForm';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AdminSidebar } from '../components/AdminSidebar';
import ThemeToggle from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
import { User as UserIcon, LogOut, Bell, CheckSquare } from 'lucide-react'; // Added Bell and CheckSquare
import TodoList from '@/components/TodoList';
import StaffTodoNotifications from '@/components/StaffTodoNotifications';

interface AdminSidebarProps {
  onOpenCreateTodo?: () => void;
}

export function AdminDashboardPage ({ onOpenCreateTodo }: AdminSidebarProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, userType, loading } = useAppSelector((state) => state.auth);
  const [isCreateTodoOpen, setIsCreateTodoOpen] = useState(false);
  
  useEffect(() => {
    if (!user && !loading) {
      navigate('/');
      return;
    }
    if (user && userType === 'customer') {
      navigate('/dashboard');
      return;
    }
  }, [user, userType, loading, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleCreateLead = () => {
    navigate('/leads/create');
  };

  const handleCreateCustomer = () => {
    navigate('/customers/add');
  };

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!user || (userType && userType !== 'admin')) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <LoginForm />
        </div>
      </ThemeProvider>
    );
  }
    const handleOpenCreateTodo = () => {
    setIsCreateTodoOpen(true);
  };
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {!user ? (
          <LoginForm />
        ) : (
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AdminSidebar />
              <div className="flex-1">
                {/* --- Refactored Header Starts Here --- */}
                <header className="h-20 flex items-center justify-between border-b px-6 bg-gradient-to-r from-primary/5 to-primary/10">
                  {/* Left Section: Dashboard Title */}
                  <div className="flex items-center space-x-4">
                    <SidebarTrigger onOpenCreateTodo={handleOpenCreateTodo} />
                    <div className="flex flex-col">
                      <h1 className="text-2xl font-semibold">Dashboard</h1>
                      <p className="text-sm text-muted-foreground">Welcome to CloudHouse Admin Panel</p>
                    </div>
                  </div>

                  {/* Right Section: Notifications, To-Do, and User Profile */}
                  <div className="flex items-center space-x-6">
                    {/* Notification Bell */}
                    <div className="relative">
                      <Bell className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold -mt-1 -mr-1">
                        1
                      </span>
                    </div>
                    
                    {/* To-Do List Icon */}
                    <CheckSquare className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                    
                    {/* User Profile and Sign Out */}
                    <div className="flex items-center space-x-2 bg-muted/50 rounded border pr-3 pl-2 py-1 cursor-pointer hover:bg-muted transition-colors">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col leading-none">
                        <span className="text-sm font-medium">{user.full_name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                      <button onClick={handleLogout} className="text-muted-foreground hover:text-primary transition-colors ml-4">
                        <LogOut className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </header>
                {/* --- Refactored Header Ends Here --- */}

                <main className="flex-1">
                  <AdminDashboard 
                    user={user} 
                    onLogout={handleLogout}
                    onCreateLead={handleCreateLead}
                    onCreateCustomer={handleCreateCustomer}
                  />
                </main>
              </div>
            </div>
          </SidebarProvider>
        )}
      </div>
      <div className='container'>
          {/* <TodoList/> */}
        <div className='mt-8'>
        {/* <StaffTodoNotifications/> */}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboardPage;