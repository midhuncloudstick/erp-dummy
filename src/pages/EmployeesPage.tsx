import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Power } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { employeeService } from '@/services/employeeService';
import { UiEmployee, mapApiEmployeeToUi } from '@/types/employee';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CreateEmployeeDialog from '@/components/CreateEmployeeDialog';

const resolveImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://dev-api.cloudhousetechnologies.com/${path}`; //development
  // return `https://api.cloudhousetechnologies.com/${path}`; //production

};

const padId = (id: number) => `EMP-${id.toString().padStart(3, '0')}`;

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<UiEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeService.getEmployees(1, 100);
      const uiEmployees = response.response.data.map(mapApiEmployeeToUi);
      setEmployees(uiEmployees);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      await loadEmployees();
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredEmployees = employees.filter(employee =>
    employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (employeeId: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      console.log('Deleting employee:', employeeId);
    }
  };

  const handleToggleStatus = async (employeeId: number) => {
    try {
      const res = await employeeService.toggleEmployeeStatus(employeeId);
      if (res.success) {
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === employeeId ? { ...emp, is_active: !emp.is_active } : emp
          )
        );
      } else {
        alert(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case 'engineering':
        return 'bg-blue-100 text-blue-800';
      case 'product':
        return 'bg-green-100 text-green-800';
      case 'design':
        return 'bg-purple-100 text-purple-800';
      case 'sales':
        return 'bg-orange-100 text-orange-800';
      case 'marketing':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout
      title="Employee Management"
      subtitle={`Managing ${employees.length} employees across all departments`}
      // actions={
      //   <Button onClick={() => setOpenCreate(true)} className="bg-primary hover:bg-primary/90">
      //     <Plus className="h-4 w-4 mr-2" />
      //     Add Employee
      //   </Button>
      // }
    >
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative  max-w-md">
         <Button onClick={() => setOpenCreate(true)} className="bg-primary hover:bg-primary/90">
         <Plus className="h-4 w-4 mr-2" />
        Add Employee
       </Button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Showing {filteredEmployees.length} of {employees.length} employees</p>
        </div>

        {isLoading && <div className="text-sm text-gray-500">Loading employees...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Status</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${employee.is_active ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{padId(employee.id)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={resolveImageUrl(employee.profilePic)} alt={employee.fullName} />
                        <AvatarFallback>{employee.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{employee.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <Badge className={getDepartmentColor(employee.department)}>
                      {employee.department}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.phoneNumber}</TableCell>
                  <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="outline" onClick={() => navigate(`/employees/edit/${employee.id}`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant={employee.is_active ? 'destructive' : 'default'} onClick={() => handleToggleStatus(employee.id)}>
                              <Power className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{employee.is_active ? 'Deactivate' : 'Activate'}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {/* <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="outline" onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No employees found matching your search.</p>
          </div>
        )}
        <CreateEmployeeDialog open={openCreate} onOpenChange={setOpenCreate} onCreated={loadEmployees} />
      </div>
    </AdminLayout>
  );
};

export default EmployeesPage;
