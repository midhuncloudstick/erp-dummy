import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
  Calendar
} from 'lucide-react';

// Mock data for support tickets
const mockTickets = [
  {
    id: 'SUP-001',
    title: 'Login Issues - Unable to Access Dashboard',
    status: 'open',
    priority: 'high',
    customer: 'John Doe',
    assignee: 'Sarah Wilson',
    createdAt: '2024-01-15',
    lastResponse: '2 hours ago',
    category: 'Technical'
  },
  {
    id: 'SUP-002',
    title: 'Billing Inquiry - Invoice Discrepancy',
    status: 'in-progress',
    priority: 'medium',
    customer: 'Tech Corp Ltd',
    assignee: 'Mike Johnson',
    createdAt: '2024-01-14',
    lastResponse: '1 day ago',
    category: 'Billing'
  },
  {
    id: 'SUP-003',
    title: 'Feature Request - Export Functionality',
    status: 'resolved',
    priority: 'low',
    customer: 'Emma Smith',
    assignee: 'Alex Chen',
    createdAt: '2024-01-13',
    lastResponse: '3 days ago',
    category: 'Feature Request'
  },
  {
    id: 'SUP-004',
    title: 'Performance Issues - Slow Loading Times',
    status: 'open',
    priority: 'high',
    customer: 'Digital Solutions Inc',
    assignee: 'Sarah Wilson',
    createdAt: '2024-01-12',
    lastResponse: '4 hours ago',
    category: 'Technical'
  },
  {
    id: 'SUP-005',
    title: 'Account Setup - New User Onboarding',
    status: 'in-progress',
    priority: 'medium',
    customer: 'Mark Davis',
    assignee: 'Lisa Anderson',
    createdAt: '2024-01-11',
    lastResponse: '6 hours ago',
    category: 'Account'
  },
  {
    id: 'SUP-006',
    title: 'Integration Problems - API Connection Error',
    status: 'open',
    priority: 'high',
    customer: 'StartupXYZ',
    assignee: 'Mike Johnson',
    createdAt: '2024-01-10',
    lastResponse: '8 hours ago',
    category: 'Technical'
  }
];

const SupportPage = () => {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState('7days');

  // Calculate metrics based on selected duration
  const getMetrics = (duration: string) => {
    // Mock calculations - in real app, this would filter by actual date ranges
    const multiplier = duration === '7days' ? 1 : duration === '30days' ? 4 : 12;
    
    return {
      totalTickets: 24 * multiplier,
      openTickets: 8 * multiplier,
      resolvedTickets: 15 * multiplier,
      avgResponseTime: '2.4 hours'
    };
  };

  const metrics = getMetrics(selectedDuration);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <AdminLayout title="Support" subtitle="Manage customer support tickets and inquiries">
      <div className="space-y-6 p-4">
        {/* Duration Filter */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Support Dashboard</h2>
          <Select value={selectedDuration} onValueChange={setSelectedDuration}>
            <SelectTrigger className="w-48 bg-background border-border">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                +12% from previous period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.openTickets}</div>
              <p className="text-xs text-muted-foreground">
                -3% from previous period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.resolvedTickets}</div>
              <p className="text-xs text-muted-foreground">
                +18% from previous period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">
                -0.5hrs from previous period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Response</TableHead>
                  {/* <TableHead>Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-primary hover:underline"
                        onClick={() => navigate(`/support/ticket/${ticket.id}`)}
                      >
                        {ticket.id}
                      </Button>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-left justify-start hover:underline"
                        onClick={() => navigate(`/support/ticket/${ticket.id}`)}
                      >
                        <div className="truncate" title={ticket.title}>
                          {ticket.title}
                        </div>
                      </Button>
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {ticket.customer}
                      </div>
                    </TableCell>
                    <TableCell>{ticket.assignee}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {ticket.createdAt}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ticket.lastResponse}
                    </TableCell>
                    {/* <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SupportPage;