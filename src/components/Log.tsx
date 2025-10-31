
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const logEntries = [
  {
    id: 1,
    date: "02/20/2025 11:17",
    action: "New Ticket Response made by User (by Aswin Mohanan)"
  },
  {
    id: 2,
    date: "02/19/2025 20:21",
    action: "Status changed to Customer-Reply (by Chris Jordan)"
  },
  {
    id: 3,
    date: "02/19/2025 20:21",
    action: "Ticket Note Added (by Chris Jordan)"
  },
  {
    id: 4,
    date: "02/19/2025 16:59",
    action: "New Ticket Response (by Chris Jordan)"
  },
  {
    id: 5,
    date: "02/19/2025 16:56",
    action: "New Ticket Response made by User (by Aswin Mohanan)"
  },
  {
    id: 6,
    date: "02/19/2025 14:42",
    action: "New Ticket Response (by Chris Jordan)"
  },
  {
    id: 7,
    date: "02/19/2025 14:25",
    action: "New Ticket Response made by User (by Aswin Mohanan)"
  },
  {
    id: 8,
    date: "02/19/2025 14:22",
    action: "New Ticket Response made by User (by Aswin Mohanan)"
  },
  {
    id: 9,
    date: "02/19/2025 14:12",
    action: "New Ticket Response made by User (by Aswin Mohanan)"
  },
  {
    id: 10,
    date: "02/19/2025 13:05",
    action: "New Ticket Response (by Michael M. Davis)"
  },
  // Additional demo data for remaining pages
  {
    id: 11,
    date: "02/19/2025 12:30",
    action: "Status changed to In Progress (by Chris Jordan)"
  },
  // Add more entries up to 53...
  {
    id: 53,
    date: "02/15/2025 09:00",
    action: "Ticket Created (by System)"
  }
];

export default function Log() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = 53;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = logEntries.slice(startIndex, endIndex);

  return (
    <div className=" py-6">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="bg-background rounded-xl shadow-md">
          
          <div className="p-6">
            <div className="mb-4">
              <span className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} total
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary">
                    <TableHead className="text-white font-semibold border-b border-r border-gray-200 px-6 w-48 text-center">Date</TableHead>
                    <TableHead className="text-white font-semibold border-b border-gray-200 px-6 text-center">Requested Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEntries.map((entry) => (
                    <TableRow key={entry.id} className="dark:hover:bg-gray-50 dark:hover:text-gray-500 hover:bg-gray-200">
                      <TableCell className="border-b border-r border-gray-200 px-6 text-left">{entry.date}</TableCell>
                      <TableCell className="border-b border-gray-200 px-6 text-left">{entry.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="link"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="text-primary hover:no-underline"
              >
                « Previous
              </Button>
              <Button
                variant="link"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="text-primary hover:no-underline"
              >
                Next »
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
