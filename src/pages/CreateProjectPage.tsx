
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Upload, ArrowLeft, FolderPlus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AdminLayout } from '@/components/AdminLayout';
import { employeeService } from '@/services/employeeService';
import { leadService } from '@/services/leadService';
import { projectService } from '@/services/projectService';
import { ApiEmployee } from '@/types/employee';
import { Lead } from '@/services/leadService';
import { toast } from 'sonner';

const projectFormSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  leadId: z.string().min(1, 'Lead is required'),
  projectDescription: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  projectCost: z.string().min(1, 'Project cost is required'),
  status: z.string().min(1, 'Status is required'),
  priority: z.string().min(1, 'Priority is required'),
  demoUrl: z.string().optional(),
  assignedHours: z.string().min(1, 'Assigned hours is required'),
  projectManagerId: z.string().min(1, 'Project manager is required'),
  assignees: z.array(z.string()).min(1, 'At least one assignee is required'),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: '',
      leadId: '',
      projectDescription: '',
      projectCost: '',
      status: '',
      priority: '',
      demoUrl: '',
      assignedHours: '',
      projectManagerId: '',
      assignees: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesResponse, leadsResponse] = await Promise.all([
          employeeService.getEmployees(),
          leadService.getLeads()
        ]);

        if (employeesResponse.success && employeesResponse.message?.data) {
          setEmployees(employeesResponse.message.data);
        }

        if (leadsResponse.success && leadsResponse.data) {
          setLeads(leadsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load employees and leads');
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setLoading(true);
      
      // Get current user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id;
      
      if (!employeeId) {
        toast.error('User not authenticated');
        return;
      }

      // Prepare project data
      const projectData = {
        project_name: data.projectName,
        lead_id: data.leadId,
        project_description: data.projectDescription,
        start_date: data.startDate.toISOString(),
        end_date: data.endDate.toISOString(),
        project_cost: parseInt(data.projectCost),
        status: data.status,
        priority: data.priority,
        demo_url: data.demoUrl || '',
        assigned_hours: parseInt(data.assignedHours),
        project_manager_id: parseInt(data.projectManagerId),
        assignees: data.assignees.map(id => ({ employee_id: parseInt(id) }))
      };

      console.log('Project data:', projectData);
      
      const response = await projectService.createProject(employeeId, projectData);
      
      if (response.success) {
        toast.success('Project created successfully!');
        navigate('/projects');
      } else {
        toast.error(response.message || 'Failed to create project');
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout 
      title="Create New Project"
      subtitle="Fill in the information below to create a new project"
      actions={
        <Button 
          variant="outline" 
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      }
    >
      <div className="p-6 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-white">
              <FolderPlus className="h-6 w-6 mr-3 text-purple-600" />
              Project Details
            </CardTitle>
            <CardDescription>
              Fill in the information below to create a new project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leadId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leads.map((lead) => (
                              <SelectItem key={lead.id} value={lead.id}>
                                {lead.customer.company_name} - {lead.customer.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="projectDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter detailed project description"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick start date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="projectCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Cost ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Created">Created</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="demoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://demo.yourproject.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Hours</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="projectManagerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Manager</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              {employee.full_name} - {employee.role_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignees"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Assignees</FormLabel>
                        <FormMessage />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {employees.map((employee) => (
                          <FormField
                            key={employee.id}
                            control={form.control}
                            name="assignees"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={employee.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(employee.id.toString())}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, employee.id.toString()])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== employee.id.toString()
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {employee.full_name} - {employee.role_name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Files
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload project files
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          PDF, DOC, XLS, PPT, TXT, JPG, PNG up to 10MB each
                        </p>
                      </div>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                        <ul className="space-y-1">
                          {selectedFiles.map((file, index) => (
                            <li key={index} className="text-sm text-gray-600 flex justify-between items-center">
                              <span>{file.name}</span>
                              <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/projects')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {loading ? 'Creating...' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateProjectPage;
