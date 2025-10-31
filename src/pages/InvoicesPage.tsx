import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Eye, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { SidebarProvider } from '@/components/ui/sidebar';
import ClientHeader from '../components/ClientHeader';
import { ClientSidebar } from '../components/ClientSidebar';
// Removed useState for currentPage and simplified imports
import { fetchinvoice } from '@/store/slices/invoiceSlice'; 
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceDocument from './InvoiceDocument';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'; 

// Interface for the incoming backend invoice data
interface Customer {
  id: number;
  full_name: string;
  company_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface BackendInvoice {
  id: string;
  customer_id: number;
  ServiceID: number;
  provider: string;
  payment_type: string;
  recurring_type: string | null;
  capture_id: string;
  order_id: string;
  subscription_id: string;
  status: string;
  amount: string;
  invoice_date: string;
  due_date: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
  customers: Customer;
}

// Interface for the formatted invoice data to be used in the component
interface FormattedInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled' | 'refunded';
}

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled' | 'refunded';
  dueDate: string;
  invoiceDate: string;
  invoicedTo: {
    company: string;
    name: string;
    address: string[];
  };
  payTo: {
    company: string;
    address: string[];
    vatNumber: string;
  };
  items: {
    description: string;
    amount: number;
  }[];
  subTotal: number;
  credit: number;
  total: number;
  balance: number;
  transaction: {
    date: string;
    gateway: string;
    id: string;
    amount: number;
  } | null;
}

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  // Destructure invoices and pagination state from Redux
  const { 
    invoice: backendInvoices, 
    page, // Current page from Redux
    totalPages, 
    totalRecords, 
    limit,
    loading
  } = useAppSelector((state) => state.invoice);
console.log("backendInvoices",backendInvoices);

  if (!user) {
    navigate('/');
    return null;
  }

  const dashboardUser = {
    id: user.id.toString(),
    email: user.email,
    name: user.full_name,
    type: 'client' as 'admin' | 'client',
    projects: []
  };

  const formatStatus = (status: string): 'paid' | 'unpaid' | 'overdue' | 'cancelled' | 'refunded' => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'paid';
      case 'open':
      case 'unpaid':
        return 'unpaid';
      case 'overdue':
        return 'overdue';
      case 'canceled':
      case 'cancelled':
        return 'cancelled';
      case 'refunded':
        return 'refunded';
      default:
        return 'unpaid';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString.startsWith('0001')) {
      return 'N/A';
    }
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  };

  const formatInvoiceNumber = (id: string): string => {
    if (!isNaN(Number(id))) {
      return String(id).padStart(8, '0');
    }
    return id;
  };

  const invoices: FormattedInvoice[] = backendInvoices?.map((inv: BackendInvoice) => ({
    id: inv.id,
    invoiceNumber: inv.capture_id || inv.order_id || formatInvoiceNumber(inv.id),
    invoiceDate: formatDate(inv.invoice_date),
    dueDate: formatDate(inv.due_date),
    total: parseFloat(inv.amount),
    status: formatStatus(inv.status),
  })) || [];

  const getStatusColor = (status: FormattedInvoice['status']) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 dark:text-green-400';
      case 'unpaid':
        return 'text-red-600 dark:text-red-400';
      case 'overdue':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400';
      case 'refunded':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)} USD`;
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoice-detail/${invoiceId}`);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const getFormattedInvoiceDetail = (invoice: BackendInvoice): InvoiceDetail => {
    const amount = parseFloat(invoice.amount);
    const status = formatStatus(invoice.status);
    return {
      id: invoice.id,
      invoiceNumber: invoice.capture_id || invoice.order_id || formatInvoiceNumber(invoice.id),
      status: status,
      dueDate: formatDate(invoice.due_date),
      invoiceDate: formatDate(invoice.invoice_date),
      invoicedTo: {
        company: invoice.customers?.company_name || 'N/A',
        name: invoice.customers?.full_name || 'N/A',
        address: [
          invoice.customers?.email || 'N/A',
          invoice.customers?.address || 'N/A',
          `${invoice.customers?.city || 'N/A'}, ${invoice.customers?.state || 'N/A'}`,
          `${invoice.customers?.zip_code || 'N/A'}, ${invoice.customers?.country || 'N/A'}`,
        ]
      },
      payTo: {
        company: 'CloudHouse Technologies Pvt Ltd',
        address: [
          'Tech Park Plaza',
          'Electronic City Phase 1',
          'Bangalore, Karnataka',
          '560100, India'
        ],
        vatNumber: 'IN 29ABCDE1234F1Z5'
      },
      items: [
        {
          description: `Service ID: ${invoice.ServiceID} - Payment Type: ${invoice.payment_type}`,
          amount: amount
        }
      ],
      subTotal: amount,
      credit: 0.00,
      total: amount,
      balance: status === 'paid' ? 0 : amount,
      transaction: status === 'paid' ? {
        date: formatDate(invoice.paid_at || invoice.updated_at),
        gateway: invoice.provider,
        id: invoice.capture_id || invoice.order_id,
        amount: amount,
      } : null,
    };
  };

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      // Pass only the new page number, limit is handled in the thunk
      dispatch(fetchinvoice({ page: newPage })); 
    }
  };

  // Initial fetch using useEffect
  useEffect(() => {
    // Initial fetch of the first page (or whatever `page` is currently in state)
    dispatch(fetchinvoice({ page }));
  }, [dispatch]);


  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue');
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Pagination Helper Values
  const startEntry = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
  const endEntry = Math.min(page * limit, totalRecords);

  // Helper function to render pagination links with ellipsis
  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; 

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={i === page}
              onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      // First page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href="#" isActive={1 === page} onClick={(e) => { e.preventDefault(); handlePageChange(1); }}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Leading Ellipsis
      if (start > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Middle pages
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink href="#" isActive={i === page} onClick={(e) => { e.preventDefault(); handlePageChange(i); }}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Trailing Ellipsis
      if (end < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href="#" isActive={totalPages === page} onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ClientSidebar user={dashboardUser} />
        <div className="flex-1 flex flex-col">
          <ClientHeader user={dashboardUser} title="My Invoices" onLogout={handleLogout} />
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                {unpaidInvoices.length > 0 && (
                  <Card className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-red-500 mr-2" />
                        <span className="font-medium text-red-700 dark:text-red-300">
                          {unpaidInvoices.length} Invoices Due
                        </span>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        You have {unpaidInvoices.length} invoice(s) currently unpaid with a total balance of {formatCurrency(unpaidTotal)}
                      </p>
                    </CardContent>
                  </Card>
                )}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Paid</span>
                      <span className="text-gray-900 dark:text-white">{invoices.filter(i => i.status === 'paid').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Unpaid</span>
                      <span className="text-gray-900 dark:text-white">{invoices.filter(i => i.status === 'unpaid').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Overdue</span>
                      <span className="text-gray-900 dark:text-white">{invoices.filter(i => i.status === 'overdue').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
                      <span className="text-gray-900 dark:text-white">{invoices.filter(i => i.status === 'cancelled').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Refunded</span>
                      <span className="text-gray-900 dark:text-white">{invoices.filter(i => i.status === 'refunded').length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-3">
                <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-gray-900 dark:text-white">
                        {/* Updated to use pagination data */}
                        Showing {startEntry} to {endEntry} of {totalRecords} entries
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-700 dark:text-gray-200">Invoice #</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200">Invoice Date</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200">Due Date</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200">Total</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200">Status</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-blue-500 dark:text-blue-400">
                              Loading invoices...
                            </TableCell>
                          </TableRow>
                        ) : invoices.length > 0 ? (
                          invoices.map((invoice) => {
                            const backendInvoice = backendInvoices.find(inv => inv.id === invoice.id);
                            const formattedInvoiceDetail = backendInvoice ? getFormattedInvoiceDetail(backendInvoice) : null;
                            return (
                              <TableRow key={invoice.id}>
                                <TableCell className="font-medium text-gray-900 dark:text-white">
                                  {invoice.id}
                                </TableCell>
                                <TableCell className="text-gray-700 dark:text-gray-200">
                                  {invoice.invoiceDate}
                                </TableCell>
                                <TableCell className="text-gray-700 dark:text-gray-200">
                                  {invoice.dueDate}
                                </TableCell>
                                <TableCell className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(invoice.total)}
                                </TableCell>
                                <TableCell>
                                  <span className={`font-medium capitalize ${getStatusColor(invoice.status)}`}>
                                    {invoice.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewInvoice(invoice.id)}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                    {formattedInvoiceDetail && (
                                      <PDFDownloadLink
                                        document={<InvoiceDocument formattedInvoice={formattedInvoiceDetail} formatCurrency={formatCurrency} />}
                                        fileName={`invoice-${invoice.invoiceNumber}.pdf`}
                                      >
                                        {({ loading }) => (
                                          <Button size="sm" variant="outline" disabled={loading}>
                                            <Download className="h-3 w-3 mr-1" />
                                            {loading ? 'Generating...' : 'Download'}
                                          </Button>
                                        )}
                                      </PDFDownloadLink>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No invoices found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {/* Pagination Controls */}
                    {totalPages > 0 && (
                      <div className="mt-4 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }} 
                                aria-disabled={page === 1}
                                className={page === 1 ? "opacity-50 pointer-events-none" : ""}
                              />
                            </PaginationItem>
                            
                            {renderPaginationItems()}

                            <PaginationItem>
                              <PaginationNext 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }} 
                                aria-disabled={page === totalPages}
                                className={page === totalPages ? "opacity-50 pointer-events-none" : ""}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InvoicesPage;