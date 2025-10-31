import { useState } from "react";
import { TicketMetricsCard } from "@/components/TicketMetricsCard";
import { TicketSearch } from "@/components/TicketSearch";
import { TicketList } from "@/components/TicketList";
import { Pagination } from "@/components/Pagination";
import { CheckCheck, Clock4, Inbox, Loader2 } from "lucide-react";

// Mock data - replace with real data later
const mockTickets = Array.from({ length: 10 }, (_, i) => ({
  id: `TKT-${(i + 1).toString().padStart(4, "0")}`,
  subject: `Support request ${i + 1}`,
  lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)), // Random time within last 24h
  priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
  status: ["open", "in_progress", "resolved"][Math.floor(Math.random() * 3)] as "open" | "in_progress" | "resolved",
  lastReply: "The latest response from the support team would appear here...",
  requester: `User ${i + 1}`,
  department: ["Sales", "Technical", "Billing"][Math.floor(Math.random() * 3)],
}));

const IssueTable = () => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTickets((prev) =>
      prev.length === mockTickets.length ? [] : mockTickets.map((t) => t.id)
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-card rounded-md">
      <div className="container mx-auto py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TicketMetricsCard
            title="Total Tickets"
            count={150}
            description="All tickets in the system"
            icon={<Inbox className="h-5 w-5" />}
          />
          <TicketMetricsCard
            title="In Progress"
            count={45}
            description="Tickets being handled"
            icon={<Loader2 className="h-5 w-5" />}
          />
          <TicketMetricsCard
            title="Resolved"
            count={89}
            description="Successfully resolved tickets"
            icon={<CheckCheck className="h-5 w-5" />}
          />
        </div>

        <div className="bg-background p-6 rounded-lg shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-background inline bg-clip-text text-transparent">Tickets</h2>
            <TicketSearch onSearch={handleSearch} />
          </div>

          <TicketList
            tickets={mockTickets}
            selectedTickets={selectedTickets}
            onTicketSelect={handleTicketSelect}
            onSelectAll={handleSelectAll}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={5}
            itemsPerPage={2}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default IssueTable;
