import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

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

interface InvoiceDocumentProps {
  formattedInvoice: InvoiceDetail;
  formatCurrency: (amount: number) => string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  invoiceNumber: {
    fontSize: 16,
    color: '#666666',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  address: {
    fontSize: 12,
    color: '#666666',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#cccccc',
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    color: '#333333',
    flexGrow: 1,
  },
  descriptionCell: {
    width: '70%',
  },
  amountCell: {
    width: '30%',
    textAlign: 'right',
  },
  summaryTable: {
    width: '40%',
    marginLeft: 'auto',
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  summaryText: {
    fontSize: 12,
    color: '#333333',
  },
  summaryTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#999999',
    fontSize: 10,
  },
});

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ formattedInvoice, formatCurrency }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Image
            src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png"
            style={styles.logo}
          />
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{formattedInvoice.invoiceNumber}</Text>
          <Text style={{ ...styles.statusText, color: formattedInvoice.status === 'unpaid' || formattedInvoice.status === 'overdue' ? '#dc2626' : '#16a34a' }}>
            {formattedInvoice.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Invoice Details */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <View style={{ width: '45%' }}>
          <Text style={styles.sectionTitle}>Invoiced To</Text>
          <View style={styles.address}>
            <Text>{formattedInvoice.invoicedTo.company}</Text>
            <Text>{formattedInvoice.invoicedTo.name}</Text>
            {formattedInvoice.invoicedTo.address.map((line, index) => (
              <Text key={index}>{line}</Text>
            ))}
          </View>
        </View>
        <View style={{ width: '45%' }}>
          <Text style={styles.sectionTitle}>Pay To</Text>
          <View style={styles.address}>
            <Text>{formattedInvoice.payTo.company}</Text>
            {formattedInvoice.payTo.address.map((line, index) => (
              <Text key={index}>{line}</Text>
            ))}
            <Text>VAT Number: {formattedInvoice.payTo.vatNumber}</Text>
          </View>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <View>
          <Text style={styles.sectionTitle}>Invoice Date</Text>
          <Text style={styles.address}>{formattedInvoice.invoiceDate}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.sectionTitle}>Due Date</Text>
          <Text style={styles.address}>{formattedInvoice.dueDate}</Text>
        </View>
      </View>

      {/* Invoice Items Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Items</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.descriptionCell]}>Description</Text>
            <Text style={[styles.tableCell, styles.amountCell]}>Amount</Text>
          </View>
          {formattedInvoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionCell]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.amountCell]}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Summary Table */}
      <View style={styles.summaryTable}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Sub Total:</Text>
          <Text style={styles.summaryText}>{formatCurrency(formattedInvoice.subTotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Credit:</Text>
          <Text style={styles.summaryText}>{formatCurrency(formattedInvoice.credit)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotal}>Total:</Text>
          <Text style={styles.summaryTotal}>{formatCurrency(formattedInvoice.total)}</Text>
        </View>
      </View>

      {/* Transaction Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Info</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Transaction Date</Text>
            <Text style={styles.tableCell}>Gateway</Text>
            <Text style={styles.tableCell}>Transaction ID</Text>
            <Text style={styles.tableCell}>Amount</Text>
          </View>
          {formattedInvoice.transaction ? (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{formattedInvoice.transaction.date}</Text>
              <Text style={styles.tableCell}>{formattedInvoice.transaction.gateway}</Text>
              <Text style={styles.tableCell}>{formattedInvoice.transaction.id}</Text>
              <Text style={styles.tableCell}>{formatCurrency(formattedInvoice.transaction.amount)}</Text>
            </View>
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>No Related Transactions Found</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.summaryTotal, { textAlign: 'right', marginTop: 10 }]}>
        Balance: {formatCurrency(formattedInvoice.balance)}
      </Text>

      {/* Footer */}
      <Text style={styles.footer}>
        Cloudhouse Technologies
      </Text>
    </Page>
  </Document>
);

export default InvoiceDocument;