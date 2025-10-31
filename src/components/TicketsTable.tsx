
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  project: string;
  module: string;
  subModule?: string;
  messages: {
    id: string;
    content: string;
    author: string;
    isClient: boolean;
    timestamp: string;
  }[];
}

interface TicketsTableProps {
  tickets: Ticket[];
  tableTitle?: string;
  onBack: () => void;
}

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (status: string) =>
  status
    .replace("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const TicketsTable = ({ tickets, tableTitle, onBack }: TicketsTableProps) => (
  <div className="max-w-6xl mx-auto py-8 px-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tableTitle || "Tickets"}</CardTitle>
        <button
          className="text-sm px-3 py-1 rounded bg-purple-100 text-purple-700 font-medium hover:bg-purple-200 transition"
          onClick={onBack}
        >
          Back
        </button>
      </CardHeader>
      <CardContent className="overflow-auto px-0 pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Last Reply</TableHead>
              <TableHead>Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">No tickets found.</TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => {
                const lastMessage =
                  ticket.messages.length > 0
                    ? ticket.messages[ticket.messages.length - 1]
                    : null;

                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <span className="font-medium">{ticket.title}</span>
                      <div className="text-xs text-gray-400">{ticket.priority}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[ticket.status] || "bg-gray-100 text-gray-800"}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.project}
                    </TableCell>
                    <TableCell>
                      {ticket.module || "General"}
                    </TableCell>
                    <TableCell>
                      {lastMessage
                        ? <>
                            <span className="font-semibold">{lastMessage.author}:</span>
                            <span className="ml-1">{lastMessage.content.length > 40 ? lastMessage.content.slice(0, 38) + "..." : lastMessage.content}</span>
                          </>
                        : (
                          <span className="text-gray-400 text-sm">{ticket.description.length > 40 ? ticket.description.slice(0, 38) + "..." : ticket.description}</span>
                        )}
                    </TableCell>
                    <TableCell>
                      {lastMessage
                        ? formatDate(lastMessage.timestamp)
                        : formatDate(ticket.updatedAt)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default TicketsTable;
