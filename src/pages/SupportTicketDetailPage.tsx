import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User, Clock, CheckCircle, AlertCircle, Calendar, Tag, UserCheck, Paperclip, X, Download, FileText } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { LayoutUser } from '@/components/LayoutUser';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTicketByIdCustomer } from '@/store/slices/ticketSlice';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface Message {
  id: string;
  content: string;
  author: string;
  isClient: boolean;
  timestamp: string;
  files?: UploadedFile[];
}

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  customer: string;
  assignee: string;
  createdAt: string;
  lastResponse: string;
  category: string;
  description?: string;
  ticket_messages: Message[];
}

// Mock ticket data with conversation
const mockTicketDetails: Record<string, Ticket> = {
  'SUP-001': {
    id: 'SUP-001',
    title: 'Login Issues - Unable to Access Dashboard',
    status: 'open',
    priority: 'high',
    customer: 'John Doe',
    assignee: 'Sarah Wilson',
    createdAt: '2024-01-15',
    lastResponse: '2 hours ago',
    category: 'Technical',
    description: 'I am unable to login to my dashboard. Every time I try to access it, I get an error message saying "Invalid credentials" even though I am using the correct username and password.',
    ticket_messages: [
      {
        id: '1',
        content: 'I am unable to login to my dashboard. Every time I try to access it, I get an error message saying "Invalid credentials" even though I am using the correct username and password. This has been happening since yesterday.',
        author: 'John Doe',
        isClient: true,
        timestamp: '2024-01-15T09:00:00Z',
        files: [
          { id: 'f1', name: 'error-screenshot.png', size: 245760, type: 'image/png' },
          { id: 'f2', name: 'console-log.txt', size: 1024, type: 'text/plain' }
        ]
      },
      {
        id: '2',
        content: 'Hello John, thank you for reaching out. I understand you\'re having trouble logging into your dashboard. Let me help you troubleshoot this issue. Can you please try clearing your browser cache and cookies, then attempt to log in again?',
        author: 'Sarah Wilson',
        isClient: false,
        timestamp: '2024-01-15T09:30:00Z'
      },
      {
        id: '3',
        content: 'Hi Sarah, I tried clearing the cache and cookies as you suggested, but I\'m still getting the same error. Is there anything else I can try?',
        author: 'John Doe',
        isClient: true,
        timestamp: '2024-01-15T10:15:00Z'
      }
    ]
  },
  'SUP-002': {
    id: 'SUP-002',
    title: 'Billing Inquiry - Invoice Discrepancy',
    status: 'in-progress',
    priority: 'medium',
    customer: 'Tech Corp Ltd',
    assignee: 'Mike Johnson',
    createdAt: '2024-01-14',
    lastResponse: '1 day ago',
    category: 'Billing',
    description: 'There seems to be a discrepancy in our latest invoice. The amount charged is higher than expected.',
    ticket_messages: [
      {
        id: '1',
        content: 'There seems to be a discrepancy in our latest invoice #INV-2024-001. The amount charged is $1,500 but we were expecting $1,200 based on our usage.',
        author: 'Tech Corp Ltd',
        isClient: true,
        timestamp: '2024-01-14T14:00:00Z',
        files: [
          { id: 'f3', name: 'invoice-INV-2024-001.pdf', size: 524288, type: 'application/pdf' }
        ]
      },
      {
        id: '2',
        content: 'Thank you for bringing this to our attention. I\'m currently reviewing your invoice and usage details. I\'ll get back to you within 24 hours with a detailed explanation.',
        author: 'Mike Johnson',
        isClient: false,
        timestamp: '2024-01-14T15:30:00Z',
        files: [
          { id: 'f4', name: 'usage-report.xlsx', size: 102400, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        ]
      }
    ]
  }
};

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const SupportTicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const dispatch = useAppDispatch()
  const navigate = useNavigate();
  const { toast } = useToast();
  const ticket = useAppSelector((state) => state.ticket.selectedTicket);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [responseType, setResponseType] = useState<'customer' | 'internal'>('customer');

  // useEffect(() => {
  //   if (ticketId && mockTicketDetails[ticketId]) {
  //     setTicket(mockTicketDetails[ticketId]);
  //   } else {
  //     navigate('/support');
  //   }
  // }, [ticketId, navigate]);

  // if (!ticket) {
  //   return (
  //     <AdminLayout title="Support" subtitle="Loading ticket details...">
  //       <div>Loading...</div>
  //     </AdminLayout>
  //   );
  // }

  const handleFetchTicket = async () => {
    try {
      const response = await dispatch(fetchTicketByIdCustomer(ticketId)).unwrap();
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };
  

  useEffect(()=>{
    if(ticketId){
      handleFetchTicket();
    }
  },[])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Open
        </Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>;
      case 'resolved':
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Resolved
        </Badge>;
      case 'closed':
        return <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Closed
        </Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // const handleStatusChange = (newStatus: 'open' | 'in-progress' | 'resolved' | 'closed') => {
  //   if (ticket) {
  //     const updatedTicket = { ...ticket, status: newStatus };
  //     setTicket(updatedTicket);
  //     toast({
  //       title: "Status Updated",
  //       description: `Ticket status changed to ${newStatus}`,
  //     });
  //   }
  // };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = files.map(file => ({
      id: String(Date.now() + Math.random()),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  // const handleSubmitMessage = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!newMessage.trim() || !ticket) return;

  //   setIsSubmitting(true);

  //   // Simulate API call
  //   setTimeout(() => {
  //     const message: Message = {
  //       id: String(Date.now()),
  //       content: newMessage,
  //       author: responseType === 'internal' ? 'Internal Note - Support Team' : 'Support Team',
  //       isClient: false,
  //       timestamp: new Date().toISOString(),
  //       files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
  //     };

  //     const updatedTicket = {
  //       ...ticket,
  //       ticket_messages: [...ticket?.ticket_messages, message],
  //       lastResponse: 'Just now'
  //     };

  //     setTicket(updatedTicket);
  //     setNewMessage('');
  //     setUploadedFiles([]);
  //     setIsSubmitting(false);

  //     toast({
  //       title: responseType === 'internal' ? "Internal note added" : "Message sent",
  //       description: responseType === 'internal' 
  //         ? "Your internal note has been added to the ticket?." 
  //         : "Your response has been sent to the customer.",
  //     });
  //   }, 1000);
  // };

  return (
    <LayoutUser title="Support" subtitle={`Ticket Details - ${ticket?.id}`}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/support')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Support Dashboard
        </Button>

        {/* Ticket Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">#{ticket?.id}</CardTitle>
                  <CardTitle className="text-2xl">{ticket?.title}</CardTitle>
                  <div className="ml-4">
                    <Select
                      value={ticket?.status}
                      onValueChange={(value) => {
                        
                        // handleStatusChange(value as 'open' | 'in-progress' | 'resolved' | 'closed')
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option?.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-muted-foreground">{ticket?.description}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(ticket?.priority)}
                  {getStatusBadge(ticket?.status)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Last Response: {ticket?.lastResponse}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Ticket Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Customer</span>
                </div>
                <p className="text-sm font-medium">{ticket?.customer_name}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-sm font-medium">john.doe@email.com</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">Assignee</span>
                </div>
                <p className="text-sm font-medium">{ticket?.assignee||"N/A"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">Category</span>
                </div>
                <Badge variant="secondary" className="w-fit">{ticket?.category}</Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <p className="text-sm font-medium">{formatDate(ticket?.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initial Response */}
     
      

        {/* Response Form */}
        {(ticket?.status === 'Open' || ticket?.status === 'Pending') && (
          <Card>
            <CardHeader>
              <CardTitle>Add Response</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={()=>{
// handleSubmitMessage
              }} className="space-y-6">
                {/* <div className="space-y-2">
                  <label className="text-sm font-medium">Response Type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={responseType === 'customer' ? 'default' : 'outline'}
                      onClick={() => setResponseType('customer')}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Customer Response
                    </Button>
                    <Button
                      type="button"
                      variant={responseType === 'internal' ? 'default' : 'outline'}
                      onClick={() => setResponseType('internal')}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Add Internal Note
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {responseType === 'internal' 
                      ? 'Internal notes are only visible to support staff members'
                      : 'This response will be sent to the customer via email'
                    }
                  </div>
                </div> */}

                <div className="space-y-3">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder={
                      responseType === 'internal' 
                        ? "Type your internal note here (only visible to support staff)..." 
                        : "Type your response to the customer here..."
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[120px]"
                    disabled={isSubmitting}
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Attachments</label>
                    <div className="relative">
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isSubmitting}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        disabled={isSubmitting}
                        className="relative"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach Files
                      </Button>
                    </div>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Attached Files ({uploadedFiles.length})
                      </div>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                        {uploadedFiles.map((file) => (
                          <div 
                            key={file.id}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded border text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button 
                              type="button"
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => removeFile(file.id)}
                              disabled={isSubmitting}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/support')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !newMessage.trim()}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {responseType === 'internal' ? 'Add Note' : 'Send Response'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}


          <Card>
          <CardHeader>
            <CardTitle>Activity & Communication History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {ticket?.ticket_messages.map((message, index) => (
                <div key={message.id} className="space-y-4">
                  <div className="relative">
                    {/* Timeline line */}
                    {index !== ticket?.ticket_messages.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-px bg-border"></div>
                    )}
                    
                    <div className="flex gap-4">
                      {/* Avatar/Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        message.isClient 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-secondary/10 text-secondary-foreground'
                      }`}>
                        <User className="h-5 w-5" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-sm">{message.author}</span>
                          <Badge 
                            variant={message.isClient ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {message.isClient ? 'Customer' : 'Support Staff'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        
                        <div className={`rounded-lg p-4 ${
                          message.isClient 
                            ? 'bg-primary/5 border-l-4 border-l-primary' 
                            : 'bg-secondary/5 border-l-4 border-l-secondary'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed mb-3">
                            {message.content}
                          </p>

                          {/* Files Display */}
                          {message.files && message.files.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                Attached Files ({message.files.length})
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {message.files.map((file) => (
                                  <div 
                                    key={file.id}
                                    className="flex items-center justify-between p-2 bg-background/50 rounded border text-xs"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{file.name}</p>
                                        <p className="text-muted-foreground">{formatFileSize(file.size)}</p>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add red note between customer ticket_messages */}
                  {message.isClient && index < ticket?.ticket_messages.length - 1 && (
                    <div className="ml-16 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700 font-medium">
                        💡 Note: Customer is waiting for response. Please prioritize this ticket?.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resolved/Closed Notice */}
        {(ticket?.status === 'resolved' || ticket?.status === 'closed') && (
          <Card className="bg-muted/50 border-muted">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">This ticket has been {ticket?.status}</p>
                  <p className="text-sm text-muted-foreground">
                    No further responses can be sent unless the ticket is reopened.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutUser>
  );
};

export default SupportTicketDetailPage;