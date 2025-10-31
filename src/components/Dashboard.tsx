import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, FolderOpen, MessageSquare, Clock, CheckCircle, AlertCircle, Server, Settings, ShoppingCart, FileText, Plus, TicketX, DollarSign, Loader2 } from 'lucide-react';
import ProjectView from './ProjectView';
import ThemeToggle from './ThemeToggle';
import { dashboardService, DashboardData } from '@/services/dashboardService';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export interface Ticket {
  id?: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  project: string;
  module: string;
  subModule?: string;
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  author: string;
  isClient: boolean;
  timestamp: string;
}

// Mock ticket data
const mockTickets: Ticket[] = [{
  id: '1',
  title: 'Login page not loading properly',
  description: 'The login page takes too long to load and sometimes shows a blank screen.',
  status: 'in-progress',
  priority: 'high',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T14:20:00Z',
  project: 'Project Management System',
  module: 'ui',
  messages: [{
    id: '1',
    content: 'The login page takes too long to load and sometimes shows a blank screen.',
    author: 'John Smith',
    isClient: true,
    timestamp: '2024-01-15T10:30:00Z'
  }, {
    id: '2',
    content: 'Thank you for reporting this issue. We are investigating the problem and will update you soon.',
    author: 'Support Team',
    isClient: false,
    timestamp: '2024-01-15T11:00:00Z'
  }]
}];

// Mock services data
const mockServices = [{
  id: '1',
  name: 'Web Hosting',
  ipAddress: '192.168.1.100',
  status: 'active',
  username: 'admin',
  password: '********',
  registrationDate: '2024-01-01',
  serverMonitoring: true
}, {
  id: '2',
  name: 'Database Server',
  ipAddress: '192.168.1.101',
  status: 'active',
  username: 'dbuser',
  password: '********',
  registrationDate: '2024-01-15',
  serverMonitoring: true
}, {
  id: '3',
  name: 'Email Server',
  ipAddress: '192.168.1.102',
  status: 'inactive',
  username: 'mailuser',
  password: '********',
  registrationDate: '2024-02-01',
  serverMonitoring: false
}];

// Mock invoices data
const mockInvoices = [
  { id: '1', amount: 1500, dueDate: '2024-01-15', status: 'overdue' },
  { id: '2', amount: 2000, dueDate: '2024-02-15', status: 'paid' },
  { id: '3', amount: 1200, dueDate: '2024-03-01', status: 'overdue' },
  { id: '4', amount: 800, dueDate: '2024-03-15', status: 'pending' }
];

const Dashboard = ({
  user,
  onLogout
}: DashboardProps) => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [tickets] = useState<Ticket[]>(mockTickets);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getProjectTickets = (project: string) => {
    return tickets.filter(ticket => ticket.project === project);
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const customerId = parseInt(user.id);
        const response = await dashboardService.getDashboardData(customerId);
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        const errorMessage = err?.response?.data?.error || 
                            err?.response?.data?.message || 
                            err?.message || 
                            'Failed to fetch dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (user.id) {
      fetchDashboardData();
    }
  }, [user.id]);

  // Calculate dashboard stats from API data
  const openTicketsCount = dashboardData?.support_tickets || 0;
  const activeServicesCount = dashboardData?.active_services || 0;
  const overdueInvoicesCount = dashboardData?.overdue_invoices || 0;
  const projectsCount = dashboardData?.projects_count || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-900/50 text-red-300 border-red-500/30';
      case 'in-progress':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-900/50 text-green-300 border-green-500/30';
      case 'closed':
        return 'bg-gray-800/50 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-800/50 text-gray-300 border-gray-500/30';
    }
  };

  const handleOrderServerCare = () => {
    navigate('/purchase-services');
  };

  const handleServicesClick = () => {
    navigate('/my-services');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handlePurchaseServicesClick = () => {
    navigate('/purchase-services');
  };

  const handleInvoicesClick = () => {
    navigate('/invoices');
  };

  const handleRefreshDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const customerId = parseInt(user.id);
      const response = await dashboardService.getDashboardData(customerId);
      if (response.success) {
        setDashboardData(response.data);
        toast.success('Dashboard data refreshed');
      } else {
        setError('Failed to refresh dashboard data');
      }
    } catch (err: any) {
      console.error('Error refreshing dashboard data:', err);
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          err?.message || 
                          'Failed to refresh dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedProject) {
    return <ProjectView project={selectedProject} user={user} tickets={getProjectTickets(selectedProject)} onBack={() => setSelectedProject(null)} onLogout={onLogout} />;
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.name}
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your account and services
            </p>
          </div>
          {/* <Button
            onClick={handleRefreshDashboard}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="ml-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Refresh
          </Button> */}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Support Tickets Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card-bg hover:bg-hover-bg" onClick={() => navigate('/support')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Support Tickets
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                openTicketsCount
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total support tickets
            </p>
          </CardContent>
        </Card>

        {/* Active Services Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card-bg hover:bg-hover-bg" onClick={handleServicesClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Services
            </CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeServicesCount
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Services currently running
            </p>
          </CardContent>
        </Card>

        {/* Overdue Invoices Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card-bg hover:bg-hover-bg" onClick={handleInvoicesClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Invoices
            </CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                overdueInvoicesCount
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Invoices past due date
            </p>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card-bg hover:bg-hover-bg" onClick={() => navigate('/projects')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projects
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                projectsCount
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total projects assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleOrderServerCare} 
              className="w-full justify-start" 
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Order Server Care Plan
            </Button>
            {/* <Button 
              onClick={handlePurchaseServicesClick} 
              className="w-full justify-start" 
              variant="outline"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Services
            </Button> */}
            <Button 
              onClick={() => navigate('/support')} 
              className="w-full justify-start" 
              variant="outline"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Create Support Ticket
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                  {getStatusIcon(ticket.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {ticket.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.project} • {new Date(ticket.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
              ))}
              {tickets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
