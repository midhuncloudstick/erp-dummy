import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, User, LogOut, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Ticket, Message } from './Dashboard';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from './ThemeToggle';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  name: string;
  projects: string[];
}

interface TicketViewProps {
  ticket: Ticket;
  user: User;
  onBack: () => void;
  onUpdate: (ticket: Ticket) => void;
  onLogout: () => void;
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Solved' },
  { value: 'closed', label: 'Closed' },
];

const TicketView = ({ ticket, user, onBack, onUpdate, onLogout }: TicketViewProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 👇 FIX: add an explicit union type for status state
  const [status, setStatus] = useState<"open" | "in-progress" | "resolved" | "closed">(ticket.status);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
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

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      const message: Message = {
        id: String(Date.now()),
        content: newMessage,
        author: user.name,
        isClient: true,
        timestamp: new Date().toISOString()
      };

      const updatedTicket: Ticket = {
        ...ticket,
        messages: [...ticket.messages, message],
        updatedAt: new Date().toISOString()
      };

      onUpdate(updatedTicket);
      setNewMessage('');
      setIsSubmitting(false);

      toast({
        title: "Message sent",
        description: "Your message has been added to the ticket.",
      });

      // Simulate support team response after 3 seconds
      setTimeout(() => {
        const supportMessage: Message = {
          id: String(Date.now() + 1),
          content: "Thank you for your message. We have received your update and will review it shortly. We'll get back to you as soon as possible.",
          author: 'Support Team',
          isClient: false,
          timestamp: new Date().toISOString()
        };

        const finalTicket: Ticket = {
          ...updatedTicket,
          messages: [...updatedTicket.messages, supportMessage],
          updatedAt: new Date().toISOString()
        };

        onUpdate(finalTicket);

        toast({
          title: "New response",
          description: "Support team has responded to your ticket.",
        });
      }, 3000);
    }, 1000);
  };

  // Handle dropdown status change
  // 👇 FIX: use correct type in argument
  const handleStatusChange = (newStatus: "open" | "in-progress" | "resolved" | "closed") => {
    setStatus(newStatus);
    if (newStatus !== ticket.status) {
      const updatedTicket: Ticket = {
        ...ticket,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      onUpdate(updatedTicket);
      toast({
        title: "Ticket status updated",
        description: `Ticket is now marked as "${statusOptions.find(opt => opt.value === newStatus)?.label}".`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-xl font-semibold text-white">Ticket #{ticket.id}</h1>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-4">{ticket.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Project: <strong>{ticket.project}</strong></span>
                  <span>Created: {formatDate(ticket.createdAt)}</span>
                  <span>Updated: {formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(status)}>
                    {getStatusIcon(status)}
                    <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                  </Badge>
                </div>
                <Select
                  value={status}
                  // 👇 FIX: cast the value to the correct type for the handler
                  onValueChange={(v) => handleStatusChange(v as "open" | "in-progress" | "resolved" | "closed")}
                >
                  <SelectTrigger className="w-40 mt-2">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Conversation</h3>
          
          <div className="space-y-4">
            {ticket.messages.map((message, index) => (
              <Card key={message.id} className={`${message.isClient ? 'ml-8' : 'mr-8'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${message.isClient ? 'bg-blue-100' : 'bg-green-100'}`}>
                        <User className={`h-4 w-4 ${message.isClient ? 'text-blue-600' : 'text-green-600'}`} />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{message.author}</p>
                        <p className="text-sm text-gray-600">{formatDate(message.timestamp)}</p>
                      </div>
                    </div>
                    <Badge variant={message.isClient ? 'default' : 'secondary'}>
                      {message.isClient ? 'Client' : 'Support'}
                    </Badge>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(ticket.status === 'open' || ticket.status === 'in-progress') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <Textarea
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[100px]"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !newMessage.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {(ticket.status === 'resolved' || ticket.status === 'closed') && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">This ticket has been resolved</p>
                    <p className="text-sm text-green-700">
                      If you need further assistance, please create a new ticket.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TicketView;
