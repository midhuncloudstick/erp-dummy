import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Edit, Trash2, Eye, Search, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteCustomer, fetchCustomerList } from '@/store/slices/customerSlice';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'; 
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";


const CustomersPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  
  

  const { 
    customers, 
    loading, 
    page, 
    limit, 
    total_pages, 
   
  } = useAppSelector((state) => ({
    customers: state.customers.customers,
    loading: state.customers.loading,
    page: state.customers.page, 
    limit: state.customers.limit,
    total_pages: state.customers.total_pages,
    
  }));
  
  
  
  const getCustomers = async (search: string, pageNumber: number) => {
    await dispatch(fetchCustomerList({
        search: search.trim(),
        page: pageNumber,
        limit: limit,
    }));
  };



  
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > total_pages) return;
    getCustomers(searchTerm, newPage);
  };

  useEffect(() => {
   
    getCustomers(searchTerm, page); 
  }, []); 

  const handleEdit = (customerId: number) => {
    navigate(`/customers/edit/${customerId}`);
  };

  const handleDelete = async (customerId: number) => {
    try {
      await dispatch(deleteCustomer(customerId) as any); 
      toast.success("Customer deleted successfully!");
     
      
      getCustomers(searchTerm, page); 
    }
    catch (error: any) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const handleViewDetails = (customerId: number) => {
    navigate(`/customers/${customerId}`);
  };



  // Helper function to render pagination links with ellipsis (Matching InvoicesPage style)
  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; 

    if (total_pages <= maxPagesToShow) {
      for (let i = 1; i <= total_pages; i++) {
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
      const end = Math.min(total_pages - 1, page + 1);

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
      if (end < total_pages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Last page
      items.push(
        <PaginationItem key={total_pages}>
          <PaginationLink href="#" isActive={total_pages === page} onClick={(e) => { e.preventDefault(); handlePageChange(total_pages); }}>
            {total_pages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };


  return (
    <AdminLayout
      title="Customer Management"
      subtitle="Manage all your customers and their information in one place"
      actions={
        <Button onClick={() => navigate('/customers/add')} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      }
    >
      <div className="p-6 space-y-6 ">
        <Card className="shadow-lg ">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-white">
              <Users className="h-6 w-6 mr-3 text-purple-600" />
              Customer List
            </CardTitle>
          

            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
             
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && customers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Fetching customers...
                      </TableCell>
                    </TableRow>
                  ) : customers.length > 0 ? (
                    customers?.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.company_name}</TableCell>
                        <TableCell>{customer?.full_name.charAt(0).toUpperCase() + customer?.full_name.slice(1).toLowerCase()}</TableCell>
                        <TableCell>{customer.phone_number}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.industry?.industry_name}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(customer.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(customer.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                           <Popover
                            open={openPopoverId === customer.id}
                            onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? customer.id : null)}>
                            <PopoverTrigger asChild>
                               <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0 bg-transparent border-none shadow-none'>
                              <Card className="w-full shadow-lg rounded-xl">
                                <CardContent className="w-[190px] py-4 px-4">
                                  <p className="mb-4 text-sm">Delete {customer.full_name}?</p>
                                   <div className='flex justify-end gap-2'>
                                  <Button
                                  variant="outline"
                                  size="sm"
                                  className='h-6'
                                  onClick={(e)=> {
                                    e.stopPropagation();
                                   setOpenPopoverId(null)
                                  }}>
                                    Cancel
                                  </Button>
                                  <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-6"
                                  onClick={(e)=>{
                                    e.stopPropagation()
                                    handleDelete(customer.id)
                                    setOpenPopoverId(null)
                                  }}>
                                    Delete

                                  </Button>
                                </div>
                                </CardContent>
                              </Card>
                            </PopoverContent>
                           </Popover>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No customers found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Manual Pagination Controls (using total_pages) */}
        {total_pages > 0 && (
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
                    aria-disabled={page === total_pages}
                    className={page === total_pages ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      
      </div>
    </AdminLayout>
  );
};

export default CustomersPage;
