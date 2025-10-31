
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import Dashboard from '../components/Dashboard';
import LoginForm from '../components/LoginForm';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ClientSidebar } from '../components/ClientSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import ClientHeader from '../components/ClientHeader';

const ClientDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, userType, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user && !loading) {
      navigate('/');
      return;
    }

    // If user is admin, redirect to admin dashboard
    if (user && userType === 'admin') {
      navigate('/admin');
      return;
    }
  }, [user, userType, loading, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Show loading while checking authentication
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

  // If not logged in or not a customer, show login form
  if (!user || (userType && userType !== 'customer')) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-content-bg">
          <LoginForm />
        </div>
      </ThemeProvider>
    );
  }

  // Convert Redux user to Dashboard user format
  const dashboardUser = {
    id: user.id?.toString(),
    email: user.email,
    name: user.full_name,
    type: (userType === 'admin' ? 'admin' : 'client') as 'admin' | 'client',
    projects: [] // You can populate this from API if needed
  };

  // Show dashboard for logged in customer
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-content-bg">
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <ClientSidebar user={dashboardUser} />
            
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <ClientHeader user={dashboardUser} title="Dashboard" onLogout={handleLogout} />
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto">
                <Dashboard user={dashboardUser} onLogout={handleLogout} />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
};

export default ClientDashboardPage;
