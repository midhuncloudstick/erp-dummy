import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, User, LogOut, Server, Layout, Puzzle } from 'lucide-react';
import { Ticket, Message } from './Dashboard';
import TicketView from './TicketView';
import CreateTicketDialog from './CreateTicketDialog';
import ThemeToggle from './ThemeToggle';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

interface ProjectViewProps {
  project: string;
  user: User;
  tickets: Ticket[];
  onBack: () => void;
  onLogout: () => void;
}

const ProjectView = ({ project, user, tickets, onBack, onLogout }: ProjectViewProps) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectTickets, setProjectTickets] = useState<Ticket[]>(tickets);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'uptime-server':
        return <Server className="h-4 w-4" />;
      case 'ui':
        return <Layout className="h-4 w-4" />;
      case 'integrations':
        return <Puzzle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'uptime-server':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ui':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'integrations':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatModuleDisplay = (module: string, subModule?: string) => {
    const moduleLabels: Record<string, string> = {
      'uptime-server': 'Server/Uptime',
      'ui': 'UI Issues',
      'integrations': 'Integration',
      'general': 'General'
    };

    const subModuleLabels: Record<string, string> = {
      'mapbox': 'Mapbox',
      'aws-s3': 'AWS S3',
      'mail': 'Mail Service',
      'payment': 'Payment',
      'api': 'API',
      'database': 'Database'
    };

    const moduleLabel = moduleLabels[module] || module;
    if (subModule) {
      return `${moduleLabel} - ${subModuleLabels[subModule] || subModule}`;
    }
    return moduleLabel;
  };

  const handleCreateTicket = (ticketData: { 
    title: string; 
    description: string; 
    priority: string;
    module: string;
    subModule?: string;
  }) => {
    const newTicket: Ticket = {
      id: String(Date.now()),
      title: ticketData.title,
      description: ticketData.description,
      status: 'open',
      priority: ticketData.priority as 'low' | 'medium' | 'high' | 'urgent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      project: project,
      module: ticketData.module,
      subModule: ticketData.subModule,
      messages: [
        {
          id: String(Date.now()),
          content: ticketData.description,
          author: user.name,
          isClient: user.type === 'client',
          timestamp: new Date().toISOString()
        }
      ]
    };

    setProjectTickets([newTicket, ...projectTickets]);
    setShowCreateDialog(false);
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setProjectTickets(projectTickets.map(ticket => 
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    ));
  };

  if (selectedTicket) {
    return (
      <TicketView
        ticket={selectedTicket}
        user={user}
        onBack={() => setSelectedTicket(null)}
        onUpdate={handleUpdateTicket}
        onLogout={onLogout}
      />
    );
  }

  const openTickets = projectTickets.filter(t => t.status === 'open' || t.status === 'in-progress');
  const closedTickets = projectTickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={onBack} className="mr-3 text-purple-300 hover:bg-purple-900/30">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <img 
                src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" 
                alt="CloudHouse Technologies" 
                className="h-8 w-auto mr-3"
              />
              <h1 className="text-xl font-semibold text-white">{project}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center">
                <User className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm font-medium text-white">{user.name}</span>
              </div>
              <Button variant="outline" onClick={onLogout} className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Support Tickets</h2>
            <p className="text-gray-600">Manage your support requests and track progress</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{openTickets.length}</p>
                  <p className="text-sm text-gray-600">Open Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {projectTickets.filter(t => t.status === 'in-progress').length}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{closedTickets.length}</p>
                  <p className="text-sm text-gray-600">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{projectTickets.length}</p>
                  <p className="text-sm text-gray-600">Total Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rest of the component with updated styling */}
        <div className="space-y-6">
          {openTickets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Tickets</h3>
              <div className="space-y-4">
                {openTickets.map((ticket) => (
                  <Card 
                    key={ticket.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{ticket.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mb-3">
                            {ticket.description}
                          </CardDescription>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getModuleColor(ticket.module || '')}>
                              {getModuleIcon(ticket.module || '')}
                              <span className="ml-1">{formatModuleDisplay(ticket.module || '', ticket.subModule)}</span>
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(ticket.status)}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1">{ticket.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Created: {formatDate(ticket.createdAt)}</span>
                        <span>{ticket.messages.length} messages</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {closedTickets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolved Tickets</h3>
              <div className="space-y-4">
                {closedTickets.map((ticket) => (
                  <Card 
                    key={ticket.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow opacity-75"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{ticket.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mb-3">
                            {ticket.description}
                          </CardDescription>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getModuleColor(ticket.module || '')}>
                              {getModuleIcon(ticket.module || '')}
                              <span className="ml-1">{formatModuleDisplay(ticket.module || '', ticket.subModule)}</span>
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(ticket.status)}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1">{ticket.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Resolved: {formatDate(ticket.updatedAt)}</span>
                        <span>{ticket.messages.length} messages</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {projectTickets.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Yet</h3>
                <p className="text-gray-600 mb-4">Create your first support ticket to get started.</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <CreateTicketDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
};

export default ProjectView;
