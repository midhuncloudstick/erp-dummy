import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, FileText, Clock, CheckCircle, XCircle, RotateCcw, Search, Loader2, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { clearanceService, ClearanceRequest } from '@/services/clearanceService';
import { toast } from 'sonner';

interface ClearanceRequestsListProps {
  userType: 'admin' | 'staff';
  refreshTrigger?: number;
}

export default function ClearanceRequestsList({ userType, refreshTrigger }: ClearanceRequestsListProps) {
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'to-me' | 'by-me'>('to-me');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  // Get current user
  const savedUser = localStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    loadRequests();
  }, [refreshTrigger, currentPage, filterType, statusFilter]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // For "All Status", we want to exclude "Approved" requests
      // So we'll fetch all requests and filter out approved ones on the frontend
      let statusParam: string | undefined;

      if (statusFilter === 'all') {
        // Don't pass status parameter to get all requests, we'll filter on frontend
        statusParam = undefined;
      } else {
        statusParam = statusFilter;
      }

      const clearanceRequests = await clearanceService.getClearanceRequests(currentPage, 10, filterType, statusParam);
      console.log("clearanceRequest", clearanceRequests);

      // Filter out approved requests when "All Status" is selected
      let filteredRequests = clearanceRequests;
      if (statusFilter === 'all') {
        filteredRequests = clearanceRequests.filter(request => request.status !== 'Approved');
      }

      setRequests(filteredRequests);
    } catch (error) {
      console.error('Error loading clearance requests:', error);
      toast.error('Failed to load clearance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReopenRequest = (requestId: number) => {
    // TODO: Implement reopen functionality with API call
    console.log('Reopen request:', requestId);
    toast.info('Reopen functionality will be implemented');
  };

  const filteredRequests = requests.filter(request => {
    // Apply search filter only (server-side filtering handles the to-me/by-me logic)
    const matchesSearch = request.request_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toString().includes(searchQuery.toLowerCase()) ||
      request.requester_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.created_by.full_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusClasses = (status: string) => {
    const base = 'flex items-center gap-1 w-fit capitalize';
    const s = status.toLowerCase();
    if (s === 'approved') return `${base} bg-green-600 text-white hover:bg-green-700`;
    if (s === 'pending') return `${base} bg-gray-600 text-white hover:bg-gray-700`;
    if (s === 're-requested' || s === 'rerequested') return `${base} bg-gray-600 text-white hover:bg-gray-700`;
    if (s === 'rejected') return `${base} bg-red-600 text-white hover:bg-red-700`;
    return base;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Clearance Requests
              {/* {statusFilter !== 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {statusFilter}
                </Badge>
              )} */}
            </CardTitle>

            <div className="inline-block">
              <ToggleGroup
                type="single"
                value={filterType}
                onValueChange={(value: "to-me" | "by-me") => setFilterType(value)}
                className="h-10 bg-gray-100 border border-gray-300 rounded-md overflow-hidden flex"
              >
                <ToggleGroupItem
                  value="to-me"
                  aria-label="Toggle To Me"
                  className="flex-1 flex justify-center items-center px-4 text-sm font-medium text-gray-700 transition-colors duration-200 cursor-pointer
data-[state=on]:bg-gray-800 data-[state=on]:text-white"
                >
                  To Me
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="by-me"
                  aria-label="Toggle By Me"
                  className=" flex justify-center items-center px-5 text-sm font-medium text-gray-700 transition-colors duration-200 cursor-pointer
data-[state=on]:bg-gray-800 data-[state=on]:text-white"
                >
                  By Me
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
<div className="flex justify-end">
              <Button
                variant="default"
                onClick={() => navigate('/clearance-request/create')}
                className="gap-2 "
              >
                <Plus className="h-4 w-4" />
                Create Clearance
              </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          


          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left side — Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, title, or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Open Requests
                      </div>
                    </SelectItem>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="Approved">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Approved
                      </div>
                    </SelectItem>
                    <SelectItem value="Rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Rejected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right side — Create Clearance Button */}
            
          </div>


          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading clearance requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {requests.length === 0
                ? `No clearance requests found${statusFilter !== 'all' ? ` with status "${statusFilter}"` : ' (excluding approved requests)'}.`
                : 'No requests match your search.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate(`/clearance-request/${request.id}`)}
                        className="p-0 h-auto font-mono text-sm text-primary hover:underline"
                      >
                        #{request.id}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{request.request_title}</TableCell>
                    <TableCell>{request.requester_name}</TableCell>
                    <TableCell>{request.created_by.full_name}</TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-md px-2 py-1 text-xs font-medium ${getStatusClasses(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/clearance-request/${request.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {userType === 'staff' && request.status.toLowerCase() === 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReopenRequest(request.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reopen
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} • {filteredRequests.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={filteredRequests.length < 10 || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}