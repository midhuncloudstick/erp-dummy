import { useMemo, useState } from "react";
import { TicketMetricsCard } from "@/components/TicketMetricsCard";
import { TicketSearch } from "@/components/TicketSearch";
import { TicketList } from "@/components/TicketList";
import { Pagination } from "@/components/Pagination";
import { CheckCheck, Clock4, Inbox, Loader2, Search } from "lucide-react";
import AdminLayout from "@/layout/pages/AdminMainLayout";
import { Input } from "@/components/ui/input";

// Mock data - replace with real data later
const mockTickets = Array.from({ length: 10 }, (_, i) => ({
  id: `TKT-${(i + 1).toString().padStart(4, "0")}`,
  subject: `Support request ${i + 1}`,
  lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)),
  priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
  status: ["open", "in_progress", "resolved"][Math.floor(Math.random() * 3)] as "open" | "in_progress" | "resolved",
  projectName: ["KSITIL Office Complex", "IT Park Phase II", "Smart City Project", "Cochin Shipyard Complex"][Math.floor(Math.random() * 4)],
  region: ["North Kerala", "South Kerala", "Central Kerala"][Math.floor(Math.random() * 3)],
  requester: `User ${i + 1}`,
  department: ["Sales", "Technical", "Billing"][Math.floor(Math.random() * 3)],
}));

const Index = () => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 8;


  const filteredStaff = mockTickets.filter((staff) =>
    Object.values(staff).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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

  const paginatedStaff = useMemo(() => {
      return filteredStaff.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
    }, [filteredStaff, currentPage, itemsPerPage]);
  

  return (
    <AdminLayout>
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

        <div className=" p-6 rounded-lg shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-background bg-clip-text text-transparent">Tickets</h2>
            <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              className="pl-9 w-[300px]"
              placeholder="Search Staffs..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          </div>

          <TicketList
            tickets={paginatedStaff}
            selectedTickets={selectedTickets}
            onTicketSelect={handleTicketSelect}
            onSelectAll={handleSelectAll}
          />

          <Pagination
            currentPage={currentPage}
            itemsPerPage={8}
            totalPages={Math.ceil(filteredStaff.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default Index;
