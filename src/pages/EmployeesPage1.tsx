
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Grid, List, Edit, Trash2, Mail, Phone, MapPin, Calendar, Power } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { employeeService } from '@/services/employeeService';
import { UiEmployee, mapApiEmployeeToUi } from '@/types/employee';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AdminSidebar } from '../components/AdminSidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Helper to resolve profile image URL returned by API (may be relative path)
const resolveImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://technologies.com/${path}`;
};

 const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<UiEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await employeeService.getEmployees(1, 100);
        const uiEmployees = response.message.data.map(mapApiEmployeeToUi);
        if (isMounted) setEmployees(uiEmployees);
      } catch (err: any) {
        if (isMounted) setError(err?.response?.data?.message || 'Failed to load employees');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
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
      // Delete logic would go here
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
      actions={
        <Button onClick={() => navigate('/employees/create')} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      }
    >
          <div className="flex min-h-screen w-full">
          <AdminSidebar />
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
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>

        {isLoading && (
          <div className="text-sm text-gray-500">Loading employees...</div>
        )}
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={resolveImageUrl(employee.profilePic)} alt={employee.fullName} />
                        <AvatarFallback>{employee.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{employee.fullName}</CardTitle> 
                        <p className="text-sm text-gray-600">{employee.role}</p>
                      </div>
                      <Badge
          variant={employee.is_active ? 'success' : 'secondary'}
          className={employee.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}
        >
          {employee.is_active ? 'Active' : 'Inactive'}
        </Badge>
                    </div>
                    
                    <div className="flex space-x-1">
                      {/* <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/employees/edit/${employee.id}`)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button> */}
                      <div className="flex space-x-1">
  {/* Edit */}
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate(`/employees/edit/${employee.id}`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Edit Employee</TooltipContent>
    </Tooltip>
  </TooltipProvider>

  {/* Activate/Deactivate */}
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={employee.is_active ? "destructive" : "default"}
          onClick={() => handleToggleStatus(employee.id)}
        >
          <Power className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {employee.is_active ? "Deactivate" : "Activate"}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>

                      {/* <Button
    size="sm"
    variant={employee.is_active ? 'destructive' : 'default'}
    onClick={() => handleToggleStatus(employee.id)}
  >
    <Power className="h-3 w-3" />
    {employee.is_active ? 'Deactivate' : 'Activate'}
  </Button> */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge className={getDepartmentColor(employee.department)}>
                    {employee.department}
                  </Badge>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-3 w-3 mr-2" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-3 w-3 mr-2" />
                      <span>{employee.phoneNumber}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-3 w-3 mr-2" />
                      <span className="truncate">{employee.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
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
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phoneNumber}</TableCell>
                    <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/employees/edit/${employee.id}`)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No employees found matching your search.</p>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default EmployeesPage;
