
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LogOut, User, FolderOpen, MessageSquare, Clock, CheckCircle, AlertCircle, Shield, Server, Layout, Puzzle, DollarSign, CreditCard, Users, UserCheck, UserX, Plus, UserPlus, Search, Building, Package, Tag } from 'lucide-react';
import ProjectView from './ProjectView';
import { Ticket } from './Dashboard';
import ThemeToggle from './ThemeToggle';
import TicketsTable from './TicketsTable';
import { useNavigate } from 'react-router-dom';
import MissionsFeed from './MissionsFeed';
import TodoList from '@/components/TodoList';

import ClearanceRequestsList from './ClearanceRequestsList';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onCreateLead: () => void;
  onCreateCustomer: () => void;
}

// Mock data for all projects and their tickets
const allProjects = [
  {
    name: 'Project Management System',
    client: 'TechCorp Inc.',
    cost: 25000,
    progress: 75
  },
  {
    name: 'CRM Dashboard',
    client: 'Sales Solutions Ltd.',
    cost: 18500,
    progress: 45
  },
  {
    name: 'Static Website',
    client: 'Creative Agency',
    cost: 8500,
    progress: 100
  },
  {
    name: 'Server Management Tool',
    client: 'DevOps Pro',
    cost: 32000,
    progress: 20
  }
];

// Mock financial data
const financialData = {
  totalProjectCost: allProjects.reduce((sum, project) => sum + project.cost, 0),
  paymentsReceived: 52000,
  remainingPayment: allProjects.reduce((sum, project) => sum + project.cost, 0) - 52000,
  completedProjects: allProjects.filter(p => p.progress === 100).length
};

// Mock leads data
const leadsData = {
  totalLeads: 47,
  pendingAction: 12,
  disqualified: 8,
  discussingProjects: 15,
  anticipatedCost: 125000
};

// Mock data for middleman
const middleManData = {
  totalMiddleMan: 5,
  activeMiddleMan: 4
};

// Mock data for industry and product
const industryData = {
  totalIndustries: 8,
  activeIndustries: 6
};

const productData = {
  totalProducts: 12,
  activeProducts: 10
};

// Mock data for services
const servicesData = {
  totalServices: 15,
  activeServices: 12
};

// Mock data for employees
const employeesData = {
  totalEmployees: 25,
  activeEmployees: 23
};

// Mock customers data - same as in CustomersPage
const mockCustomers = [
  {
    id: 1,
    companyName: 'Tech Solutions Inc.',
    contactPersonName: 'John Smith',
    phoneNumber: '+1-555-0123',
    email: 'john@techsolutions.com',
    industry: 'Technology',
    productInterested: 'Project Management System',
    address: '123 Tech Street, Silicon Valley, CA',
    notes: 'Interested in enterprise solution'
  },
  {
    id: 2,
    companyName: 'Healthcare Plus',
    contactPersonName: 'Sarah Johnson',
    phoneNumber: '+1-555-0124',
    email: 'sarah@healthcareplus.com',
    industry: 'Healthcare',
    productInterested: 'CRM Dashboard',
    address: '456 Medical Ave, Boston, MA',
    notes: 'Needs integration with existing systems'
  },
  {
    id: 3,
    companyName: 'Green Energy Corp',
    contactPersonName: 'Mike Wilson',
    phoneNumber: '+1-555-0125',
    email: 'mike@greenenergy.com',
    industry: 'Manufacturing',
    productInterested: 'Custom Software Development',
    address: '789 Energy Blvd, Austin, TX',
    notes: 'Focus on sustainability features'
  }
];

const mockAllTickets: Ticket[] = [
  {
    id: '1',
    title: 'Login page not loading properly',
    description: 'The login page takes too long to load and sometimes shows a blank screen.',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    project: 'Project Management System',
    module: 'ui',
    messages: []
  },
  {
    id: '2',
    title: 'Feature request: Export functionality',
    description: 'Would like to export reports to PDF format.',
    status: 'open',
    priority: 'medium',
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
    project: 'CRM Dashboard',
    module: 'general',
    messages: []
  },
  {
    id: '3',
    title: 'Website performance optimization',
    description: 'The static website loads slowly on mobile devices.',
    status: 'resolved',
    priority: 'high',
    createdAt: '2024-01-12T14:22:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
    project: 'Static Website',
    module: 'uptime-server',
    messages: []
  },
  {
    id: '4',
    title: 'Server monitoring dashboard',
    description: 'Need real-time monitoring capabilities for server health.',
    status: 'open',
    priority: 'urgent',
    createdAt: '2024-01-16T08:30:00Z',
    updatedAt: '2024-01-16T08:30:00Z',
    project: 'Server Management Tool',
    module: 'uptime-server',
    messages: []
  },
  {
    id: '5',
    title: 'Mapbox integration not working',
    description: 'Maps are not loading properly after the latest update.',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-17T11:15:00Z',
    updatedAt: '2024-01-17T11:15:00Z',
    project: 'Project Management System',
    module: 'integrations',
    subModule: 'mapbox',
    messages: []
  }
];

const AdminDashboard = ({ user, onLogout, onCreateLead, onCreateCustomer }: AdminDashboardProps) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [tickets] = useState<Ticket[]>(mockAllTickets);
  const [ticketFilter, setTicketFilter] = useState<null | {
    mode: string;
    value: string;
  }>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clearanceRefresh, setClearanceRefresh] = useState(0);
  const navigate = useNavigate();

  const getProjectTickets = (project: string) => {
    return tickets.filter(ticket => ticket.project === project);
  };

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

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'uptime-server':
        return <Server className="h-3 w-3" />;
      case 'ui':
        return <Layout className="h-3 w-3" />;
      case 'integrations':
        return <Puzzle className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'uptime-server':
        return 'bg-red-600/80 text-white';
      case 'ui':
        return 'bg-blue-600/80 text-white';
      case 'integrations':
        return 'bg-purple-600/80 text-white';
      default:
        return 'bg-gray-600/80 text-white';
    }
  };

  const formatModuleDisplay = (module: string, subModule?: string) => {
    const moduleLabels: Record<string, string> = {
      'uptime-server': 'Server',
      'ui': 'UI',
      'integrations': 'Integration',
      'general': 'General'
    };

    const subModuleLabels: Record<string, string> = {
      'mapbox': 'Mapbox',
      'aws-s3': 'S3',
      'mail': 'Mail',
      'payment': 'Payment',
      'api': 'API',
      'database': 'DB'
    };

    const moduleLabel = moduleLabels[module] || module;
    if (subModule) {
      return `${moduleLabel}-${subModuleLabels[subModule] || subModule}`;
    }
    return moduleLabel;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600/80 text-white';
      case 'high':
        return 'bg-orange-500/80 text-white';
      case 'medium':
        return 'bg-yellow-500/80 text-white';
      case 'low':
        return 'bg-green-500/80 text-white';
      default:
        return 'bg-gray-500/80 text-white';
    }
  };

  function handleCardClick(mode: string, value: string) {
    if (mode === "leads" && value === "total") {
      navigate('/leads');
      return;
    }
    if (mode === "customers" && value === "total") {
      navigate('/customers');
      return;
    }
    if (mode === "projects" && value === "total") {
      navigate('/projects');
      return;
    }
    if (mode === "middleman" && value === "total") {
      navigate('/middleman');
      return;
    }
    if (mode === "industry" && value === "total") {
      navigate('/industry');
      return;
    }
    if (mode === "product" && value === "total") {
      navigate('/product');
      return;
    }
    if (mode === "services" && value === "total") {
      navigate('/services');
      return;
    }
    if (mode === "employees" && value === "total") {
      navigate('/employees');
      return;
    }
    setTicketFilter({ mode, value });
  }

  function getFilteredTickets() {
    if (!ticketFilter) return [];
    if (ticketFilter.mode === "status") {
      if (ticketFilter.value === "active") {
        return tickets.filter(t => t.status === 'open' || t.status === 'in-progress');
      }
      if (ticketFilter.value === "resolved") {
        return tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
      }
      // fallback
      return [];
    }
    if (ticketFilter.mode === "priority" && ticketFilter.value === "urgent") {
      return tickets.filter(t => t.priority === 'urgent' && (t.status === 'open' || t.status === 'in-progress'));
    }
    if (ticketFilter.mode === "module") {
      return tickets.filter(
        t => (t.status === 'open' || t.status === 'in-progress') && (t.module === ticketFilter.value)
      );
    }
    return [];
  }

  if (ticketFilter) {
    // Set table title according to filter
    let title = "Tickets";
    if (ticketFilter.mode === "status" && ticketFilter.value === "active") title = "Active Tickets";
    if (ticketFilter.mode === "status" && ticketFilter.value === "resolved") title = "Resolved Tickets";
    if (ticketFilter.mode === "priority" && ticketFilter.value === "urgent") title = "Urgent Tickets";
    if (ticketFilter.mode === "module") {
      const labels: Record<string, string> = {
        "uptime-server": "Server/Uptime Tickets",
        "ui": "UI Tickets",
        "integrations": "Integration Tickets",
        "general": "General Tickets"
      };
      title = labels[ticketFilter.value] || "Tickets";
    }
    return (
      <TicketsTable
        tickets={getFilteredTickets()}
        tableTitle={title}
        onBack={() => setTicketFilter(null)}
      />
    );
  }

  if (selectedProject) {
    const projectData = allProjects.find(p => p.name === selectedProject);
    return (
      <ProjectView
        project={selectedProject}
        user={user}
        tickets={getProjectTickets(selectedProject)}
        onBack={() => setSelectedProject(null)}
        onLogout={onLogout}
      />
    );
  }

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && (t.status === 'open' || t.status === 'in-progress')).length;
  const totalCustomers = mockCustomers.length;

  // Module breakdown stats
  const moduleStats = tickets.reduce((acc, ticket) => {
    if (ticket.status === 'open' || ticket.status === 'in-progress') {
      const module = ticket.module || 'general';
      acc[module] = (acc[module] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-content-bg min-h-screen" style={{ overflowX: 'hidden' }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
              <p className="text-gray-600">Overview of all projects and tickets across CloudHouse Technologies</p>
            </div>
            {/* <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-green-500/30 text-green-600 hover:bg-green-50"
                onClick={() => navigate('/projects/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-500/30 text-blue-600 hover:bg-blue-50"
                onClick={onCreateLead}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Lead
              </Button>
              <Button 
                variant="outline" 
                className="border-purple-500/30 text-purple-600 hover:bg-purple-50"
                onClick={onCreateCustomer}
              >
                <User className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
              <Button 
                variant="outline" 
                className="border-orange-500/30 text-orange-600 hover:bg-orange-50"
                onClick={() => navigate('/coupons')}
              >
                <Tag className="h-4 w-4 mr-2" />
                Manage Coupons
              </Button>
            </div> */}
          </div>
        </div>
      {/* Important Missions Feed */}
      <div style={{ overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
        <MissionsFeed />
      </div>
        {/* Revenue Information Cards */}
        {/* <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white backdrop-blur-sm border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">${financialData.totalProjectCost.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Project Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">${financialData.paymentsReceived.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Payments Received</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">${financialData.remainingPayment.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Remaining Payment</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-emerald-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-600/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{financialData.completedProjects}</p>
                    <p className="text-sm text-gray-600">Completed Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div> */}

        {/* Leads Information Cards */}
        {/* <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Leads Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-white backdrop-blur-sm border-indigo-500/30 cursor-pointer" onClick={() => handleCardClick("leads", "total")}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <Users className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{leadsData.totalLeads}</p>
                    <p className="text-sm text-gray-600">Total Leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-teal-500/30 cursor-pointer" onClick={() => handleCardClick("middleman", "total")}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-teal-600/20 rounded-lg">
                    <UserCheck className="h-6 w-6 text-teal-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{middleManData.totalMiddleMan}</p>
                    <p className="text-sm text-gray-600">Middle Men</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{leadsData.pendingAction}</p>
                    <p className="text-sm text-gray-600">Requires Action</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-600/20 rounded-lg">
                    <UserX className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{leadsData.disqualified}</p>
                    <p className="text-sm text-gray-600">Disqualified</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-cyan-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-cyan-600/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">${leadsData.anticipatedCost.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Anticipated Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div> */}

        {/* Business Data Cards */}
        {/* <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Data Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white backdrop-blur-sm border-emerald-500/30 cursor-pointer" onClick={() => handleCardClick("industry", "total")}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-600/20 rounded-lg">
                    <Building className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{industryData.totalIndustries}</p>
                    <p className="text-sm text-gray-600">Industries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-violet-500/30 cursor-pointer" onClick={() => handleCardClick("product", "total")}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-violet-600/20 rounded-lg">
                    <Package className="h-6 w-6 text-violet-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{productData.totalProducts}</p>
                    <p className="text-sm text-gray-600">Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-blue-500/30 cursor-pointer" onClick={() => handleCardClick("services", "total")}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Server className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{servicesData.totalServices}</p>
                    <p className="text-sm text-gray-600">Services</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-indigo-500/30 cursor-pointer" onClick={() => handleCardClick("employees", "total")}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <Users className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{employeesData.totalEmployees}</p>
                    <p className="text-sm text-gray-600">Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div> */}

        {/* Summary Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white backdrop-blur-sm border-purple-500/30 cursor-pointer" onClick={() => handleCardClick("projects", "total")}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{allProjects.length}</p>
                  <p className="text-sm text-gray-600">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm border-purple-500/30 cursor-pointer" onClick={() => handleCardClick("customers", "total")}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                  <p className="text-sm text-gray-600">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm border-purple-500/30 cursor-pointer" onClick={() => handleCardClick("status", "resolved")}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{resolvedTickets}</p>
                  <p className="text-sm text-gray-600">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm border-purple-500/30 cursor-pointer" onClick={() => handleCardClick("priority", "urgent")}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{urgentTickets}</p>
                  <p className="text-sm text-gray-600">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Module Breakdown */}
        {/* <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Tickets by Module</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(moduleStats).map(([module, count]) => (
              <Card key={module} className="bg-white border border-gray-200 cursor-pointer" onClick={() => handleCardClick("module", module)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getModuleIcon(module)}
                      <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                        {module.replace('-', '/')}
                      </span>
                    </div>
                    <Badge className={getModuleColor(module)}>
                      {count}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}
   <TodoList/>
         {/* Clearance Requests */}
         <div className="my-8">
          <ClearanceRequestsList userType="admin" refreshTrigger={clearanceRefresh} />
        </div>
        {/* Projects Grid */}
        <div className="mb-8 mt-8" style={{ overflow: 'hidden', width: '100%' }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-4">All Projects </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full" style={{ maxWidth: '100%' }}>
            {allProjects.map((project, idx) => {
              const projectTickets = getProjectTickets(project.name);
              const projectOpenTickets = projectTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
              const projectUrgentTickets = projectTickets.filter(t => t.priority === 'urgent' && (t.status === 'open' || t.status === 'in-progress')).length;
              
              // Get module breakdown for this project
              const projectModules = projectTickets
                .filter(t => t.status === 'open' || t.status === 'in-progress')
                .reduce((acc, ticket) => {
                  const module = ticket.module || 'general';
                  acc[module] = (acc[module] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
              
              return (
                <Card 
                  key={project.name} 
                  className="bg-white cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-purple-300 w-full"
                  style={{ maxWidth: '100%', overflow: 'hidden' }}
                >
                  <CardHeader onClick={() => navigate(`/project-details/${idx + 1}`)}>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg text-gray-900">{project.name}</span>
                      <div className="flex space-x-1">
                        {projectUrgentTickets > 0 && (
                          <Badge className="bg-red-600/80 text-white">
                            {projectUrgentTickets} urgent
                          </Badge>
                        )}
                        {projectOpenTickets > 0 && (
                          <Badge variant="destructive" className="bg-orange-600/80">
                            {projectOpenTickets} active
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Client: {project.client}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Project Cost:</span>
                        <span className="font-medium text-gray-900">${project.cost.toLocaleString()}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress:</span>
                          <span className="font-medium text-gray-900">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Tickets:</span>
                        <span className="font-medium text-gray-900">{projectTickets.length}</span>
                      </div>
                      
                      {/* Module breakdown for this project */}
                      {Object.keys(projectModules).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Active by Module:</p>
                          <div className="flex flex-wrap gap-1" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                            {Object.entries(projectModules).map(([module, count]) => (
                              <Badge key={module} className={getModuleColor(module)} style={{ fontSize: '10px', padding: '2px 6px', maxWidth: '100%' }}>
                                {getModuleIcon(module)}
                                <span className="ml-1 truncate">{formatModuleDisplay(module)}: {count}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {projectTickets.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Recent Tickets:</p>
                          {projectTickets.slice(0, 2).map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                              <div className="flex items-center flex-1 min-w-0">
                                {getStatusIcon(ticket.status)}
                                <span className="ml-2 text-sm truncate text-gray-700">{ticket.title}</span>
                              </div>
                              <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                <Badge className={getModuleColor(ticket.module || '')} style={{ fontSize: '9px', padding: '1px 4px' }}>
                                  {getModuleIcon(ticket.module || '')}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button onClick={() => setSelectedProject(project.name)} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Manage Tickets
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
     
      </main>
    </div>
  );
};

export default AdminDashboard;
