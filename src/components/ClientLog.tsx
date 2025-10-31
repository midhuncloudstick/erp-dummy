import { useState } from "react";
import { Button } from "@/components/ui/button";

const logEntries = [
  {
    id: 1,
    date: "02/19/2025 16:59",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: HVE-658863] I dont have access to DB unlistened_podplayer_restapi unlistened_gianluca Contabo 173.249.26.249 i always get 404) - Client ID: 32",
    username: "nixtree",
    ipAddress: "162.243.73.222"
  },
  {
    id: 2,
    date: "02/19/2025 14:42",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: HVE-658863] I dont have access to DB unlistened_podplayer_restapi unlistened_gianluca Contabo 173.249.26.249 i always get 404) - Client ID: 32",
    username: "nixtree",
    ipAddress: "162.243.73.222"
  },
  {
    id: 3,
    date: "02/19/2025 13:05",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: HVE-658863] I dont have access to DB unlistened_podplayer_restapi unlistened_gianluca Contabo 173.249.26.249 i always get 404) - Client ID: 32",
    username: "Michael",
    ipAddress: "144.202.42.17"
  },
  {
    id: 4,
    date: "02/18/2025 21:29",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: HVE-658863] I dont have access to DB unlistened_podplayer_restapi unlistened_gianluca Contabo 173.249.26.249 i always get 404) - Client ID: 32",
    username: "nixtree",
    ipAddress: "162.243.73.222"
  },
  {
    id: 5,
    date: "02/18/2025 15:22",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: HVE-658863] I dont have access to DB unlistened_podplayer_restapi unlistened_gianluca Contabo 173.249.26.249 i always get 404) - Client ID: 32",
    username: "nixtree",
    ipAddress: "162.243.73.222"
  },
  {
    id: 6,
    date: "02/13/2025 21:43",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: IDS-934071] It all the day that nginx stop to work and now its apache tell me whats going on ) - Client ID: 32",
    username: "nixtree",
    ipAddress: "162.243.73.222"
  },
  {
    id: 7,
    date: "02/13/2025 20:07",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: IDS-934071] It all the day that nginx stop to work and now its apache tell me whats going on ) - Client ID: 32",
    username: "AswinCS",
    ipAddress: "34.135.210.225"
  },
  {
    id: 8,
    date: "02/13/2025 19:01",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: EQE-263894] Nginx stop and server.unlistened.me for mail has stop to work ) - Client ID: 32",
    username: "nixtree",
    ipAddress: "162.243.73.222"
  },
  {
    id: 9,
    date: "02/13/2025 18:07",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: EQE-263894] Nginx stop and server.unlistened.me for mail has stop to work ) - Client ID: 32",
    username: "nixtree",
    ipAddress: "162.243.73.222"
  },
  {
    id: 10,
    date: "02/13/2025 16:32",
    description: "Email Sent to Gianluca Tiengo cs ([Ticket ID: EQE-263894] Nginx stop and server.unlistened.me for mail has stop to work ) - Client ID: 32",
    username: "AswinCS",
    ipAddress: "34.135.210.225"
  },
  {
    id: 11,
    date: "02/12/2025 15:45",
    description: "Email Sent to Support Team ([Ticket ID: KLP-123456] Database connection issue needs immediate attention) - Client ID: 45",
    username: "JohnDoe",
    ipAddress: "192.168.1.100"
  },
  {
    id: 47,
    date: "02/01/2025 09:15",
    description: "Email Sent to Technical Team ([Ticket ID: MNO-789012] Server maintenance schedule confirmation required) - Client ID: 78",
    username: "AdminUser",
    ipAddress: "10.0.0.150"
  }
];

export default function ClientLog({selected}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = 47;
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

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="py-3 px-4 text-center font-semibold border-r border-gray-200">Date</th>
                    <th className="py-3 px-4 text-center font-semibold border-r border-gray-200">Description</th>
                    <th className="py-3 px-4 text-center font-semibold border-r border-gray-200">Username</th>
                    <th className="py-3 px-4 text-center font-semibold">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((entry) => (
                    <tr key={entry.id} className="border-t hover:bg-gray-200 dark:hover:bg-gray-50 dark:hover:text-gray-500">
                      <td className="py-3 px-4 text-left border-r border-gray-200">{entry.date}</td>
                      <td className="py-3 px-4 text-left border-r border-gray-200">{entry.description}</td>
                      <td className="py-3 px-4 text-left border-r border-gray-200">{entry.username}</td>
                      <td className="py-3 px-4 text-left">{entry.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
