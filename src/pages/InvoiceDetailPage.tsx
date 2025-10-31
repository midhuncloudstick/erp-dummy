import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchinvoiceById } from '@/store/slices/invoiceSlice';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceDocument from './InvoiceDocument';

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

const InvoiceDetailPage = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const dispatch = useAppDispatch();

  // Use the selectedInvoice and status directly from the Redux store
  const selectedInvoice = useAppSelector((state) => state.invoice.selectedInvoice);
  const status = useAppSelector((state) => state.invoice.status);

  useEffect(() => {
    if (invoiceId) {
      dispatch(fetchinvoiceById(invoiceId));
    }
  }, [invoiceId, dispatch]);

  const formatStatus = (status: string): 'paid' | 'unpaid' | 'overdue' | 'cancelled' | 'refunded' => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'paid';
      case 'unpaid':
        return 'unpaid';
      case 'overdue':
        return 'overdue';
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

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)} USD`;
  };

  const handlePrint = () => {
    window.print();
  };

  let formattedInvoice: InvoiceDetail | null = null;
  if (selectedInvoice) {
    const amount = parseFloat(selectedInvoice.amount);
    const status = formatStatus(selectedInvoice.status);
    formattedInvoice = {
      id: selectedInvoice.id,
      invoiceNumber: selectedInvoice.capture_id || selectedInvoice.order_id || formatInvoiceNumber(selectedInvoice.id),
      status: status,
      dueDate: formatDate(selectedInvoice.due_date),
      invoiceDate: formatDate(selectedInvoice.invoice_date),
      invoicedTo: {
        company: selectedInvoice.customers.company_name,
        name: selectedInvoice.customers.full_name,
        address: [
          selectedInvoice.customers.email,
          selectedInvoice.customers.address,
          `${selectedInvoice.customers.city}, ${selectedInvoice.customers.state}`,
          `${selectedInvoice.customers.zip_code}, ${selectedInvoice.customers.country}`,
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
          description: `Service ID: ${selectedInvoice.ServiceID} - Payment Type: ${selectedInvoice.payment_type}`,
          amount: amount
        }
      ],
      subTotal: amount,
      credit: 0.00,
      total: amount,
      balance: status === 'paid' ? 0 : amount,
      transaction: status === 'paid' ? {
        date: formatDate(selectedInvoice.paid_at || selectedInvoice.updated_at),
        gateway: selectedInvoice.provider,
        id: selectedInvoice.capture_id || selectedInvoice.order_id,
        amount: amount,
      } : null,
    };
  }

  // Use Redux status to handle loading states
  if (status === 'loading' || !selectedInvoice) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading invoice details...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Invoice Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{'The requested invoice could not be found.'}</p>
            <Button onClick={() => navigate('/invoices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/invoices')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Client Area
          </Button>
        </div>

        <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700" id="invoice-content">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center">
                <img
                  src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png"
                  alt="WHMCS"
                  className="h-12 w-auto mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Invoice #{formattedInvoice.invoiceNumber}
                  </h1>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold mb-2 ${
                  formattedInvoice.status === 'unpaid' || formattedInvoice.status === 'overdue' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formattedInvoice.status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Due Date: {formattedInvoice.dueDate}
                </div>
                {(formattedInvoice.status === 'unpaid' || formattedInvoice.status === 'overdue') && (
                  <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white">
                    Pay Now
                  </Button>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Invoiced To</h3>
                <div className="text-gray-700 dark:text-gray-300">
                  <div className="font-medium">{formattedInvoice.invoicedTo.company}</div>
                  <div>{formattedInvoice.invoicedTo.name}</div>
                  {formattedInvoice.invoicedTo.address.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pay To</h3>
                <div className="text-gray-700 dark:text-gray-300">
                  <div className="font-medium">{formattedInvoice.payTo.company}</div>
                  {formattedInvoice.payTo.address.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                  <div className="mt-2">VAT Number: {formattedInvoice.payTo.vatNumber}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Invoice Date</h3>
                <div className="text-gray-700 dark:text-gray-300">{formattedInvoice.invoiceDate}</div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 bg-gray-100 dark:bg-gray-700 p-3 rounded">
                Invoice Items
              </h3>
              <div className="border dark:border-gray-600 rounded">
                <div className="grid grid-cols-2 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                  <div className="p-3 font-medium text-gray-900 dark:text-white">Description</div>
                  <div className="p-3 font-medium text-gray-900 dark:text-white text-right">Amount</div>
                </div>
                {formattedInvoice.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 border-b dark:border-gray-600 last:border-b-0">
                    <div className="p-3 text-gray-700 dark:text-gray-300">{item.description}</div>
                    <div className="p-3 text-gray-900 dark:text-white text-right font-medium">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 border-b dark:border-gray-600">
                  <div className="p-3 text-right font-medium text-gray-900 dark:text-white">Sub Total</div>
                  <div className="p-3 text-right font-medium text-gray-900 dark:text-white">
                    {formatCurrency(formattedInvoice.subTotal)}
                  </div>
                </div>
                <div className="grid grid-cols-2 border-b dark:border-gray-600">
                  <div className="p-3 text-right font-medium text-gray-900 dark:text-white">Credit</div>
                  <div className="p-3 text-right font-medium text-gray-900 dark:text-white">
                    {formatCurrency(formattedInvoice.credit)}
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-3 text-right font-bold text-gray-900 dark:text-white">Total</div>
                  <div className="p-3 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(formattedInvoice.total)}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="mb-8">
              <div className="grid grid-cols-[1fr_1fr_3fr_1fr] gap-4 border-b dark:border-gray-600 pb-2 mb-2">
                <div className="font-medium text-gray-900 dark:text-white">Transaction Date</div>
                <div className="font-medium text-gray-900 dark:text-white">Gateway</div>
                <div className="font-medium text-gray-900 dark:text-white">Transaction ID</div>
                <div className="font-medium text-gray-900 dark:text-white">Amount</div>
              </div>
              {formattedInvoice.transaction ? (
                <div className="grid grid-cols-[1fr_1fr_3fr_1fr] gap-4 text-gray-700 dark:text-gray-300">
                  <div>{formattedInvoice.transaction.date}</div>
                  <div>{formattedInvoice.transaction.gateway}</div>
                  <div>{formattedInvoice.transaction.id}</div>
                  <div>{formatCurrency(formattedInvoice.transaction.amount)}</div>
                </div>
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-400 py-4">
                  No Related Transactions Found
                </div>
              )}
              <div className="text-right mt-4">
                <div className="font-bold text-gray-900 dark:text-white">
                  Balance: {formatCurrency(formattedInvoice.balance)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              {formattedInvoice && (
                <PDFDownloadLink
                  document={<InvoiceDocument formattedInvoice={formattedInvoice} formatCurrency={formatCurrency} />}
                  fileName={`invoice-${formattedInvoice.invoiceNumber}.pdf`}
                >
                  {({ loading }) => (
                    <Button variant="outline" disabled={loading}>
                      <Download className="h-4 w-4 mr-2" />
                      {loading ? 'Generating...' : 'Download'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;