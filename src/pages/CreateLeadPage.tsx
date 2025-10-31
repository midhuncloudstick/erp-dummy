import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Upload, Save, CalendarIcon } from 'lucide-react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateLeadForm {
  customerName: string;
  product: string;
  newProduct?: string;
  projectName: string;
  middleMan: string;
  projectDescription: string;
  reportsTo: string;
  notes: string;
  cost: string;
  reminderDate?: Date;
  reminderDescription: string;
  secondReminderDate?: Date;
  secondReminderDescription: string;
}

const mockCustomers = [
  'TechCorp Solutions',
  'Green Energy Ltd',
  'Retail Plus',
  'HealthCare Pro',
  'Financial Services Inc',
  'Manufacturing Co'
];

const mockProducts = [
  'CRM System',
  'Website Development',
  'E-commerce Platform',
  'Management System',
  'Mobile App',
  'Custom Software'
];

const mockReporters = [
  'John Doe - Sales Manager',
  'Jane Smith - Business Development',
  'Mike Johnson - Account Executive',
  'Sarah Wilson - Lead Developer',
  'Tom Brown - Project Manager'
];

const mockProjects = [
  'E-commerce Platform Redesign',
  'Mobile App Development',
  'CRM System Integration',
  'Website Modernization',
  'Data Analytics Dashboard',
  'Custom Software Solution'
];

const mockMiddleMen = [
  'Robert Johnson - Marketing Lead',
  'Lisa Chen - Business Consultant',
  'David Miller - Sales Representative',
  'Emma Wilson - Account Manager',
  'James Brown - Partnership Manager'
];

const CreateLeadPage = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const form = useForm<CreateLeadForm>({
    defaultValues: {
      customerName: '',
      product: '',
      newProduct: '',
      projectName: '',
      middleMan: '',
      projectDescription: '',
      reportsTo: '',
      notes: '',
      cost: '',
      reminderDescription: '',
      secondReminderDescription: ''
    }
  });

  const onSubmit = (data: CreateLeadForm) => {
    console.log('Form data:', data);
    console.log('Attached files:', selectedFiles);
    // Here you would typically save the lead data
    navigate('/leads');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white">
        <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/leads')}
                  className="text-white hover:bg-white/10 mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Leads
                </Button>
                <img 
                  src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" 
                  alt="CloudHouse Technologies" 
                  className="h-8 w-auto mr-3"
                />
                <h1 className="text-xl font-semibold text-white">Create New Lead</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>New Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Name */}
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockCustomers.map((customer) => (
                                <SelectItem key={customer} value={customer}>
                                  {customer}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Product */}
                    <FormField
                      control={form.control}
                      name="product"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockProducts.map((product) => (
                                <SelectItem key={product} value={product}>
                                  {product}
                                </SelectItem>
                              ))}
                              <SelectItem value="custom">Custom Product</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* New Product Field (conditional) */}
                  {form.watch('product') === 'custom' && (
                    <FormField
                      control={form.control}
                      name="newProduct"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter new product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockProjects.map((project) => (
                                <SelectItem key={project} value={project}>
                                  {project}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    {/* Middle Man */}
                    <FormField
                      control={form.control}
                      name="middleMan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Man</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a middle man" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockMiddleMen.map((middleMan) => (
                                <SelectItem key={middleMan} value={middleMan}>
                                  {middleMan}
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
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Cost</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter estimated project cost (e.g., $5000)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>

                  {/* Cost Field */}
             

                  {/* Project Description */}
                  {/* <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the project requirements..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* Reports To */}
                  <FormField
                    control={form.control}
                    name="reportsTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reports To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reporter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockReporters.map((reporter) => (
                              <SelectItem key={reporter} value={reporter}>
                                {reporter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reminder Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Reminders</h3>
                    
                    {/* Primary Reminder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      <FormField
                        control={form.control}
                        name="reminderDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Reminder Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
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
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reminderDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reminder Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What is this reminder for?" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Second Reminder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                      <FormField
                        control={form.control}
                        name="secondReminderDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Second Reminder Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
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
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="secondReminderDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Second Reminder Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What is this second reminder for?" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* File Attachments */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Attachments</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Drop files here or click to upload</p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Choose Files
                      </Button>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Selected files:</p>
                        <ul className="text-sm text-gray-600">
                          {selectedFiles.map((file, index) => (
                            <li key={index}>• {file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/leads')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      Create Lead
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default CreateLeadPage;
