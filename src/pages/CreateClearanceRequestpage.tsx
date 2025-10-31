import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileCheck, Upload, ArrowLeft, User, FileText, Clock, Loader2 } from 'lucide-react';
import { clearanceService } from '@/services/clearanceService';
import { ApiEmployee } from '@/types/employee';

const CreateClearanceRequestPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requesterId, setRequesterId] = useState<string>('');
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {} as any;
  const currentUserId: number | undefined = currentUser?.id;

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const employeesData = await clearanceService.getEmployees();
        
        // Ensure employeesData is an array
        if (Array.isArray(employeesData)) {
          // Exclude the currently logged-in user from being selected as approver/requester
          const filtered = currentUserId ? employeesData.filter((e) => e.id !== currentUserId) : employeesData;
          setEmployees(filtered);
        } else {
          console.error('Employees data is not an array:', employeesData);
          setEmployees([]);
          toast.error('Invalid employee data received');
        }
      } catch (error: any) {
        console.error('Error fetching employees:', error);
        toast.error(error?.message || 'Failed to fetch employees');
        setEmployees([]); // Set empty array on error
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !requesterId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        request_title: title.trim(),
        description: description.trim(),
        requester_id: parseInt(requesterId)
      };

      console.log('Submitting clearance request:', payload);
      
      const response = await clearanceService.createClearanceRequest(payload, attachments);
      
      console.log('Clearance request response:', response);
      
      // Check if the response indicates success
      if (response && (response.success === true || response.success === undefined || response.data)) {
        toast.success('Clearance request created successfully!');
        navigate('/admin'); // Navigate back to staff dashboard
      } else {
        toast.error(response?.message || 'Failed to create clearance request');
      }
    } catch (error: any) {
      console.error('Error creating clearance request:', error);
      
      let errorMessage = 'Failed to create clearance request';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachments(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setAttachments(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <AdminLayout 
      title="Create Clearance Request" 
      subtitle=""
      actions={
        <Button
          variant="outline"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Card */}
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-background my-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              New Clearance Request
            </CardTitle>
            <CardDescription className="text-base">
              Fill out the form below to submit your clearance request. All required fields must be completed before submission.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Main Form Card */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Request Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Request Details</h3>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                      Request Title *
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Software Installation Clearance"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requester" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Approver Name *
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select value={requesterId} onValueChange={setRequesterId} disabled={loadingEmployees}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Select the person approving this request"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingEmployees ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading employees...
                          </div>
                        ) : (
                          employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{employee.full_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {employee.role_name} {employee.department_name && `• ${employee.department_name}`}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Detailed Description *
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide a comprehensive description of your clearance request, including purpose, scope, and any specific requirements..."
                    rows={6}
                    className="resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Be as detailed as possible to help us process your request efficiently.
                  </p>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Upload className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Supporting Documents</h3>
                  <span className="text-sm text-muted-foreground ml-auto">(Optional)</span>
                </div>
                
                <div className="space-y-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openFileDialog}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFileDialog(); }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg text-center transition-colors select-none cursor-pointer p-12 md:p-16 min-h-56 flex flex-col items-center justify-center ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-primary hover:text-primary/80">
                        Click anywhere to upload files
                      </span>
                      <span className="text-sm text-muted-foreground block">
                        or drag and drop files here
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB each)
                    </p>
                    <Input
                      ref={fileInputRef}
                      id="attachments"
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                  </div>
                  
                  {attachments && attachments.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Selected Files ({attachments.length})</span>
                      </div>
                      <div className="space-y-1">
                        {Array.from(attachments).map((file, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/staff')}
                  disabled={isSubmitting}
                  className="sm:w-auto w-full"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !title.trim() || !description.trim() || !requesterId}
                  className="sm:w-auto w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Creating Request...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Create Request
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateClearanceRequestPage;