
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import LoginForm from '../components/LoginForm';
import { ClientSidebar } from '../components/ClientSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import ClientHeader from '../components/ClientHeader';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

const ClientDashboardPageNew = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is client
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.type === 'client') {
        setUser(userData);
      } else {
        navigate('/admin');
      }
    }
  }, [navigate]);

  const handleLogin = (userData: User) => {
    if (userData.type === 'client') {
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      // Stay on the current route instead of redirecting
    } else {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <ClientSidebar user={user} />
            
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <ClientHeader user={user} title="Dashboard" onLogout={handleLogout} />
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto">
                <Dashboard user={user} onLogout={handleLogout} />
              </main>
            </div>
          </div>
        </SidebarProvider>
      )}
    </div>
  );
};

export default ClientDashboardPageNew;
