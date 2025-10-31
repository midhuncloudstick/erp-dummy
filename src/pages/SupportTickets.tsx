import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, User, LogOut, Server, Layout, Puzzle, Bell, Settings, Calendar, Filter, Check, Search } from 'lucide-react';
import { Ticket } from '@/components/Dashboard';
import TicketView from '@/components/TicketView';
import ThemeToggle from '@/components/ThemeToggle';
import CreateTicketDialog from '@/components/CreateTicketDialog';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ClientSidebar } from '@/components/ClientSidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createTicket, fetchTicketCustomer } from '@/store/slices/ticketSlice';
import { useDispatch } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { title } from 'process';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';


interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

interface SupportTicketsProps {
  project: string;
  user: User;
  tickets: Ticket[];
  onBack: () => void;
  onLogout: () => void;
}

const SkeletonCard = () => (
  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
);

const SupportTickets = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectTickets, setProjectTickets] = useState<Ticket[]>([]);
  const supportTickets = useAppSelector((state) => state.ticket.tickets);
  console.log("supportTickets",supportTickets);
   const [filters, setFilters] = useState<Record<string, string>>({
    status: '',
    priority: '',
  });
  
  const page = useAppSelector((state) => state.ticket.page);
  const totalPlugins = useAppSelector((state) => state.ticket.totalTickets);
  const [searchTicket, setSearchTicket] = useState("");
  const listRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') as string);
  console.log("currentUser",currentUser);
  

  const [loadingMore, setLoadingMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
    const [size, setSize] = useState<"5xl" | "full">("5xl");
  

useEffect(() => {
  console.log("loadingMore changed:", loadingMore);
}, [loadingMore]);

const handleFilterSelect = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value === 'All' ? '' : value
    }));
    // Reset to page 1 on filter change
  };
  

  const navigate = useNavigate();
  const user={}
  const dispatch = useAppDispatch();
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

   const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      // hour: '2-digit',
      // minute: '2-digit'
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

  const handleCreateTicket = async(ticketData) => {
    // const newTicket: Ticket = {
    //   title: ticketData.title,
    //   description: ticketData.description,
    //   status: 'open',
    //   priority: ticketData.priority as 'low' | 'medium' | 'high' | 'urgent',
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    //   project: null,
    //   module: ticketData.module,
    //   subModule: ticketData.subModule,
    //   messages: [
    //     {
    //       id: String(Date.now()),
    //       content: ticketData.description,
    //       author: user?.name,
    //       isClient: user?.type === 'client',
    //       timestamp: new Date().toISOString()
    //     }
    //   ]
    // };

    try {

    const newTicket = {
      title: ticketData.title,
      description: ticketData.description,
      category:ticketData?.category,
      priority: ticketData.priority,
      customer_email:currentUser?.email,
      customer_name:currentUser?.full_name,
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(newTicket));

    await dispatch(createTicket(formData)).unwrap();

    toast.success('Ticket created successfully');
        setShowCreateDialog(false);

    // navigate('/support');

  } catch (error) {
    console.error('Error creating ticket:', error);
  }finally {

  }
  };


  useEffect(() => {
    setLoadingMore(true)
    getTickets(1);
    const handler = setTimeout(() => {
     
    }, 100);

    return () => clearTimeout(handler);

     
  }, [searchTicket,filters]);

  useEffect(() => {
    setSize("5xl");
  }, [isOpen]);
  // infinite scroll
  useEffect(() => {
    const el = listRef.current;
    console.log("triggered",el);
    
    if (!el) return;

    const handleScroll = () => {
      if (
        el.scrollTop + el.clientHeight >= el.scrollHeight - 10 &&
        !loadingMore &&
        supportTickets.length < totalPlugins
      ) {
        getTickets(page + 1);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [supportTickets.length, page, totalPlugins, loadingMore,filters]);

 const FilterDropdown = ({ column, list }: { column: string, list: string[] | undefined }) => {
    const uniqueValues = list;
    const isActive = filters[column] !== '';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 relative"
            aria-label={`Filter by ${column}`}
          >
            <Filter className="h-4 w-4" />
            {isActive && (
              <span
                className="absolute top-1 right-1 h-3 w-3 rounded-full bg-primary border-2 border-white animate-bounce"
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white max-h-[350px] overflow-y-auto">
          <DropdownMenuItem onClick={() => handleFilterSelect(column, 'All')} className="flex items-center">
            <span className="w-6 flex justify-center items-center">
              {filters[column] === '' && (
                <Check className="h-4 w-4" />
              )}
            </span>
            All
          </DropdownMenuItem>
          {uniqueValues?.filter((value) => value)?.map((value, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleFilterSelect(column, value)}
              className="flex items-center"
            >
              <span className="w-6 flex justify-center items-center">
                {filters[column] === value && (
                  <Check className="h-4 w-4" />
                )}
              </span>
              {value}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };


  const getTickets = async (pageno: number) => {
    // block fetch if already loading
    console.log("getTickets called for page:", loadingMore);
    
    if (loadingMore) return;
    try {
      setLoadingMore(true);
      await dispatch(fetchTicketCustomer({ page: pageno, searchTerm: searchTicket, status: filters.status, priority: filters.priority })).unwrap();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

   const getStatusBadge = (status: string) => {
      switch (status) {
        case 'Open':
          return <Badge variant="destructive">Open</Badge>;
        case 'In-progress':
          return <Badge variant="secondary">In Progress</Badge>;
        case 'Resolved':
          return <Badge variant="default">Resolved</Badge>;
           case 'Customer-Reply':
          return <Badge className='!bg-yellow-600/70' variant="default">Customer-Reply</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    };
  
    const getPriorityBadge = (priority: string) => {
      switch (priority) {
        case 'High':
          return <Badge variant="destructive">High</Badge>;
        case 'Medium':
          return <Badge variant="secondary">Medium</Badge>;
        case 'Low':
          return <Badge variant="outline">Low</Badge>;
        default:
          return <Badge variant="outline">{priority}</Badge>;
      }
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
        onLogout={() => {console.log('Logout clicked');
        }
        }
      />
    );
  }

  const openTickets = projectTickets.filter(t => t.status === 'open' || t.status === 'in-progress');
  const closedTickets = projectTickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
     <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <ClientSidebar user={user} />
            
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <header className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <div className="flex items-center justify-between h-full px-6">
                  <div className="flex items-center space-x-4">
                    <SidebarTrigger />
                    <div className="h-6 w-px bg-border" />
                    <h2 className="text-lg font-semibold text-foreground">My Services</h2>
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
                          <span className="text-sm font-medium">{user?.full_name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Profile Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={()=>{console.log('Logout clicked');}}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </header>
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto">
               
    
                
      

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
         
          <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'><CardTitle>Recent Support Tickets</CardTitle>
                  <div className="relative mt-4">
                                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                              <Input
                                                placeholder="Search categories..."
                                                value={searchTicket}
                                                onChange={(e) => setSearchTicket(e.target.value)}
                                                className="pl-10"
                                              />
                                            </div></div>
                  
                </CardHeader>
                <CardContent>
                  <div className="relative border rounded-md">
                    <Table>
                      <TableHeader className="bg-gray-100 sticky top-0 z-10">
                        <TableRow>
                          <TableHead className='w-[10%]'>Ticket ID</TableHead>
                          <TableHead className='w-[20%]'>Title</TableHead>
                          <TableHead className='w-[10%]'><div className="flex items-center gap-2 ">Status <FilterDropdown column="status" list={["Open","In Progress","Resolved"]} /></div></TableHead>
                          <TableHead className='w-[10%]'><div className="flex items-center gap-2 ">Priority <FilterDropdown column="priority" list={["Low","Medium","High"]} /></div></TableHead>
                          <TableHead className='w-[10%]'>Customer</TableHead>
                          <TableHead className='w-[10%]'>Assignee</TableHead>
                          <TableHead className='w-[10%]'>Category</TableHead>
                          <TableHead className='w-[10%]'>Created</TableHead>
                          <TableHead className='w-[10%]'>Last Response</TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>

                    {/* Scrollable TableBody Wrapper */}
                    <div ref={listRef} className="max-h-96 hide-scrollbar overflow-y-auto">
                      <Table>
                        <TableBody>
                          {supportTickets.length === 0 && loadingMore ? (
                            [1,2,3].map((i) => (
                              <TableRow className="animate-pulse" key={i}>
                                <TableCell colSpan={9}>
                                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : supportTickets.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9}>
                               <div className="text-center py-12">
              <div>
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Yet</h3>
                <p className="text-gray-600 mb-4">Create your first support ticket to get started.</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </div>
            </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            supportTickets.map((ticket) => (
                              <TableRow key={ticket.id}>
                                <TableCell className="font-medium w-[10%]">
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto font-medium text-primary hover:underline"
                                    onClick={() => navigate(`/support/ticket/${ticket.ticket_id}`)}
                                  >
                                    {ticket.ticket_id}
                                  </Button>
                                </TableCell>
                                <TableCell className="max-w-xs w-[20%]">
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto font-normal text-left justify-start hover:underline"
                                    onClick={() => navigate(`/support/ticket/${ticket.ticket_id}`)}
                                  >
                                    <div className="truncate" title={ticket.title}>
                                      {ticket.title}
                                    </div>
                                  </Button>
                                </TableCell>
                                <TableCell className='w-[10%]'>{getStatusBadge(ticket.status)}</TableCell>
                                <TableCell className='w-[10%]'>{getPriorityBadge(ticket.priority)}</TableCell>
                                <TableCell className='w-[10%]'>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {ticket.customer_name}
                                  </div>
                                </TableCell>
                                <TableCell className='w-[10%]'>
                                  <div className="flex items-center gap-2">
                                    {ticket.assignee&&<User className="h-4 w-4 text-muted-foreground" />}
                                    {ticket.assignee||"N/A"}
                                  </div>
                                </TableCell>
                                <TableCell className='w-[10%]'>
                                  <Badge variant="outline">{ticket.category}</Badge>
                                </TableCell>
                                <TableCell className='w-[10%]'>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {formatDateShort(ticket.created_at)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground w-[10%]">
                                  {ticket.last_response||"N/A"}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                          {loadingMore &&
                            [1, 2, 3].map((i) => (
                              <TableRow className="animate-pulse" key={i}>
                                <TableCell className='w-[10%]' colSpan={9}>
                                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

          {/* {supportTickets.length === 0 && (
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
          )} */}
        </div>
      </div>

      <CreateTicketDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateTicket}
      />
    
    
               
              </main>
            </div>
          </div>
        </SidebarProvider>
   
  );
};

export default SupportTickets;
