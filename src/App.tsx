import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ClientDashboardPageNew from "./pages/ClientDashboardPageNew";
import ProjectPage from "./pages/ProjectPage";
import TicketPage from "./pages/TicketPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import TaskDetailsPage from "./pages/TaskDetailsPage";
import SubtaskDetailsPage from "./pages/SubtaskDetailsPage";
import LeadsPage from "./pages/LeadsPage";
import CreateLeadPage from "./pages/CreateLeadPage";
import LeadDetailsPage from "./pages/LeadDetailsPage";
import AddCustomerPage from "./pages/AddCustomerPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import EditCustomerPage from "./pages/EditCustomerPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import ProjectsPage from "./pages/ProjectsPage";
import CreateMiddleManPage from "./pages/CreateMiddleManPage";
import MiddleManListPage from "./pages/MiddleManListPage";
import MiddleManDetailPage from "./pages/MiddleManDetailPage";
import EditMiddleManPage from "./pages/EditMiddleManPage";
import IndustryListPage from "./pages/IndustryListPage";
import CreateIndustryPage from "./pages/CreateIndustryPage";
import EditIndustryPage from "./pages/EditIndustryPage";
import ProductListPage from "./pages/ProductListPage";
import CreateProductPage from "./pages/CreateProductPage";
import EditProductPage from "./pages/EditProductPage";
import MyServicesPage from "./pages/MyServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ServicesListPage from "./pages/ServicesListPage";
import CreateServicePage from "./pages/CreateServicePage";
import EditServicePage from "./pages/EditServicePage";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import ProfilePage from "./pages/ProfilePage";
import PurchaseServicesPage from "./pages/PurchaseServicesPage";
import ContactUsPage from "./pages/ContactUsPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeesPage1 from "./pages/EmployeesPage1";
import RolesDepartmentsPage from "./pages/RolesDepartmentsPage";
import ImportantMissionsPage from "./pages/ImportantMissions";
import ClearanceRequestDetailsPage from "./pages/ClearanceRequestDetailPage";
import CreateClearanceRequestPage from "./pages/CreateClearanceRequestpage";
import ClearanceEmailReplyPage from "./pages/ClearanceEmailReplyPage";
import EditEmployeePage from "./pages/EditEmployeePage";
import OrderServerCarePage from "./pages/OrderServerCarePage";
import CouponsPage from "./pages/CouponsPage";
import CreateCouponPage from "./pages/CreateCouponPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import NewEmployeeUpdatePasswordPage from "./pages/NewEmployeeUpdatePasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StatusLogTodo  from "./pages/StatusLogTodo";
import ReportIssue from "./pages/ReportIssue";
import SupportTickets from "./pages/SupportTickets";
import SupportPage from "./pages/SupportPage";
import SupportTicketDetailPage from "./pages/SupportTicketDetailPage";
import AdminSupportTicketDetailPage from "./pages/AdminSupportTicketDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/dashboard" element={<ClientDashboardPage />} />
            <Route path="/dashboard-new" element={<ClientDashboardPageNew />} />
            <Route path="/client-dashboard" element={<ClientDashboardPage />} />
            <Route path="/login" element={<Index />} />
            <Route path="/updatepassword-newemployee" element={<NewEmployeeUpdatePasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/purchase-services" element={<PurchaseServicesPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/order-server-care" element={<OrderServerCarePage />} />
            <Route path="/project/:projectName" element={<ProjectPage />} />
            <Route path="/ticket/:ticketId" element={<TicketPage />} />
            <Route path="/project-details/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/project/:projectId/task/:taskId" element={<TaskDetailsPage />} />
            <Route path="/subtask-details/:subtaskId" element={<SubtaskDetailsPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/create" element={<CreateLeadPage />} />
            <Route path="/leads/:leadId" element={<LeadDetailsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/add" element={<AddCustomerPage />} />
            <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
            <Route path="/customers/edit/:customerId" element={<EditCustomerPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/create" element={<CreateProjectPage />} />
            <Route path="/middleman" element={<MiddleManListPage />} />
            <Route path="/middleman/create" element={<CreateMiddleManPage />} />
            <Route path="/middleman/:middleManId" element={<MiddleManDetailPage />} />
            <Route path="/middleman/edit/:middleManId" element={<EditMiddleManPage />} />
            <Route path="/industry" element={<IndustryListPage />} />
            <Route path="/industry/create" element={<CreateIndustryPage />} />
            <Route path="/industry/edit/:industryId" element={<EditIndustryPage />} />
            <Route path="/product" element={<ProductListPage />} />
            <Route path="/product/create" element={<CreateProductPage />} />
            <Route path="/product/edit/:productId" element={<EditProductPage />} />
            <Route path="/my-services" element={<MyServicesPage />} />
            <Route path="/my-services/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/services" element={<ServicesListPage />} />
            <Route path="/services/create" element={<CreateServicePage />} />
            <Route path="/services/edit/:serviceId" element={<EditServicePage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoice-detail/:invoiceId" element={<InvoiceDetailPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees1" element={<EmployeesPage1 />} />
            <Route path="/employees/edit/:employeeId" element={<EditEmployeePage />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/coupons/create" element={<CreateCouponPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failed" element={<PaymentFailedPage />} />
            <Route path="/roles-departments" element={<RolesDepartmentsPage />} />
            <Route path="/important-missions" element={<ImportantMissionsPage />} />
            <Route path="/clearance-request/create" element={<CreateClearanceRequestPage />} />
            <Route path="/clearance-request/:id" element={<ClearanceRequestDetailsPage />} />
            <Route path="/api/v1/clearance/reply_email" element={<ClearanceEmailReplyPage />} />
            <Route path="/status-log" element={<StatusLogTodo />} />
            <Route path="/report-issue" element={<ReportIssue />} />
            <Route path="/support" element={<SupportTickets />} />
            <Route path="/support/ticket/:ticketId" element={<SupportTicketDetailPage />} />
            <Route path="/admin-support/ticket/:ticketId" element={<AdminSupportTicketDetailPage />} />


            <Route path="/admin-support" element={<SupportPage />} />


            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
