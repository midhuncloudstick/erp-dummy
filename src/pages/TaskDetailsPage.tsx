import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  User, 
  LogOut, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Upload,
  FileText,
  Grid,
  List,
  Mic,
  MicOff,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeProvider } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import LoginForm from '../components/LoginForm';
import CreateTaskDialog from '../components/CreateTaskDialog';
import { useToast } from '@/hooks/use-toast';
import { taskService, ApiTask } from '@/services/taskService';
import { employeeService } from '@/services/employeeService';
import { projectUpdatesService, ApiTaskUpdate, CreateTaskUpdateRequest, TaskHistory } from '@/services/projectUpdatesService';
import { AdminLayout } from '@/components/AdminLayout';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

interface TaskUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  files?: string[];
  audio?: string;
}

interface Subtask {
  id: string;
  name: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  assignees: string[];
  reportsTo: string;
  cost: number;
}

interface TaskDetails {
  id: number;
  name: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Reviewed' | 'Completed';
  progress: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  startDate: string;
  endDate: string;
  assignedHours: number;
  trackedHours: number;
  reportsTo: string;
  reportsToId: number;
  projectId: number;
  customFields: Array<{
    id: number;
    field_name: string;
    field_type: string;
    value: string;
  }>;
  subtasks: Subtask[];
  updates: TaskUpdate[];
}

// Helper function to map API task to UI task
const mapApiTaskToUi = (apiTask: ApiTask): TaskDetails => {
  return {
    id: apiTask.id,
    name: apiTask.name,
    description: apiTask.description,
    status: apiTask.status,
    priority: apiTask.priority,
    startDate: apiTask.start_date,
    endDate: apiTask.end_date,
    assignedHours: apiTask.assigned_hours,
    trackedHours: apiTask.tracked_hours,
    progress: apiTask.progress,
    reportsTo: apiTask.reports_to?.full_name || 'Not Assigned',
    reportsToId: apiTask.reports_to_id,
    projectId: apiTask.project_id,
    customFields: apiTask.custom_fields?.map(field => ({
      id: field.id || 0,
      field_name: field.field_name,
      field_type: field.field_type,
      value: field.value
    })) || [],
    subtasks: [], // Subtasks would need a separate API call
    updates: [] // Updates would need a separate API call
  };
};

const TaskDetailsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<ApiTaskUpdate[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editedTask, setEditedTask] = useState<TaskDetails | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [activeTab, setActiveTab] = useState('updates');
  const [isCustomFieldsExpanded, setIsCustomFieldsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { taskId, projectId } = useParams<{ taskId: string; projectId: string }>();
  const navigate = useNavigate();
  const { toast: useToastHook } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
    
    if (taskId && projectId) {
      loadTask();
      loadEmployees();
    } else {
      navigate('/projects');
    }
  }, [taskId, projectId, navigate]);

  // Separate useEffect to load task updates and history after user is set
  useEffect(() => {
    if (user?.id && taskId && projectId) {
      loadTaskUpdates();
      loadTaskHistory();
    }
  }, [user?.id, taskId, projectId]);

  const loadTask = async () => {
    if (!taskId || !projectId) return;
    
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      const response = await taskService.getTaskById(employeeId, parseInt(projectId), parseInt(taskId));
      
      if (response.success && response.data) {
        const mappedTask = mapApiTaskToUi(response.data);
        setTask(mappedTask);
      } else {
        toast.error('Failed to load task details');
        navigate('/projects');
      }
    } catch (error: any) {
      console.error('Error loading task:', error);
      toast.error('Failed to load task details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const loadTaskUpdates = async () => {
    if (!taskId || !projectId || !user?.id) {
      console.log('Missing required data for task updates:', { taskId, projectId, userId: user?.id });
      return;
    }
    
    try {
      const employeeId = parseInt(user.id);
      const taskIdNum = parseInt(taskId);
      const projectIdNum = parseInt(projectId);

      console.log('Loading task updates with:', { employeeId, taskIdNum, projectIdNum });

      const response = await projectUpdatesService.getTaskUpdates(
        employeeId,
        projectIdNum,
        taskIdNum
      );

      console.log('Task updates response:', response);

      if (response.success) {
        setTaskUpdates(response.data);
        console.log('Task updates loaded successfully:', response.data);
      } else {
        console.error('Failed to load task updates:', response.message);
      }
    } catch (error) {
      console.error('Error loading task updates:', error);
    }
  };

  const loadTaskHistory = async () => {
    if (!taskId || !projectId || !user?.id) {
      console.log('Missing required data for task history:', { taskId, projectId, userId: user?.id });
      return;
    }
    
    try {
      const employeeId = parseInt(user.id);
      const taskIdNum = parseInt(taskId);
      const projectIdNum = parseInt(projectId);

      console.log('Loading task history with:', { employeeId, taskIdNum, projectIdNum });

      const response = await projectUpdatesService.getTaskHistory(
        employeeId,
        projectIdNum,
        taskIdNum
      );

      console.log('Task history response:', response);

      if (response.success && response.message?.data) {
        setTaskHistory(response.message.data);
        console.log('Task history loaded successfully:', response.message.data);
      } else {
        console.error('Failed to load task history:', response);
      }
    } catch (error) {
      console.error('Error loading task history:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      if (response.success && response.message?.data) {
        setEmployees(response.message.data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Todo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.full_name : `Employee ${employeeId}`;
  };

  const toggleCustomFieldsExpansion = () => {
    setIsCustomFieldsExpanded(!isCustomFieldsExpanded);
  };

  const getDisplayCustomFields = () => {
    if (!task.customFields || task.customFields.length === 0) return { fields: [], showMore: false };
    
    const fields = task.customFields;
    const isExpanded = isCustomFieldsExpanded;

    if (fields.length <= 3) {
      return { fields, showMore: false };
    }

    if (isExpanded) {
      return { fields, showMore: true };
    }

    return { fields: fields.slice(0, 3), showMore: true };
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.title.trim() || !newUpdate.description.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }
    
    if (!user?.id || !taskId || !projectId) {
      toast.error('Missing required information');
      return;
    }

    setIsPostingUpdate(true);

    try {
      const employeeId = parseInt(user.id);
      const taskIdNum = parseInt(taskId);
      const projectIdNum = parseInt(projectId);

      const updateData: CreateTaskUpdateRequest = {
        title: newUpdate.title,
        description: newUpdate.description
      };

      const response = await projectUpdatesService.createTaskUpdate(
        employeeId,
        projectIdNum,
        taskIdNum,
        updateData,
        uploadedFiles.length > 0 ? uploadedFiles : undefined
      );

      if (response.success) {
        toast.success('Task update posted successfully');
        
        // Reset form
        setNewUpdate({ title: '', description: '' });
        setUploadedFiles([]);
        setAudioBlob(null);
        
        // Reload task updates and history
        await loadTaskUpdates();
        await loadTaskHistory();
      } else {
        toast.error('Failed to post task update');
      }
    } catch (error) {
      console.error('Error posting task update:', error);
      toast.error('Failed to post task update');
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const handleSubtaskCreate = (newSubtask: any) => {
    const subtask: Subtask = {
      id: newSubtask.id,
      name: newSubtask.name,
      status: newSubtask.status,
      progress: newSubtask.progress,
      priority: newSubtask.priority,
      startDate: newSubtask.startDate,
      endDate: newSubtask.endDate,
      assignees: newSubtask.assignees,
      reportsTo: newSubtask.reportsTo,
      cost: newSubtask.cost || 0
    };

    setTask({
      ...task,
      subtasks: [...task.subtasks, subtask]
    });
  };

  const handleSubtaskClick = (subtaskId: string) => {
    navigate(`/subtask-details/${subtaskId}`);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Task not found</h3>
          <p className="text-gray-600 mb-6">The requested task could not be loaded.</p>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-6">Please log in to view task details.</p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
      toast.success(`${files.length} file(s) selected for upload`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Audio recording is now active");
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Audio recorded successfully");
    }
  };

  const handleDeleteUpdate = (updateId: string) => {
    const updatedUpdates = task.updates.filter(update => update.id !== updateId);
    setTask({
      ...task,
      updates: updatedUpdates
    });
    
    toast.success("Task update has been removed");
  };

  const handleDeleteTaskUpdate = async (updateId: number) => {
    if (!user?.id || !taskId || !projectId) {
      toast.error('Missing required information');
      return;
    }

    try {
      const employeeId = parseInt(user.id);
      const taskIdNum = parseInt(taskId);
      const projectIdNum = parseInt(projectId);

      const response = await projectUpdatesService.deleteTaskUpdate(
        employeeId,
        projectIdNum,
        taskIdNum,
        updateId
      );

      if (response.success) {
        toast.success('Task update deleted successfully');
        // Reload task updates and history
        await loadTaskUpdates();
        await loadTaskHistory();
      } else {
        toast.error('Failed to delete task update');
      }
    } catch (error) {
      console.error('Error deleting task update:', error);
      toast.error('Failed to delete task update');
    }
  };

  const handleSubtaskEdit = (subtaskId: string) => {
    const subtaskToEdit = task.subtasks.find(subtask => subtask.id === subtaskId);
    if (subtaskToEdit) {
      toast.info("Subtask editing functionality will be implemented");
    }
  };

  const handleSubtaskDelete = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
    setTask({
      ...task,
      subtasks: updatedSubtasks
    });
    
    toast.success("Subtask has been removed from the task");
  };

  const handleEditTask = () => {
    setIsEditingTask(true);
    setEditedTask({ ...task });
  };

  const handleCancelEdit = () => {
    setIsEditingTask(false);
    setEditedTask(null);
  };

  const handleTaskFieldChange = (field: keyof TaskDetails, value: any) => {
    if (!editedTask) return;
    
    setEditedTask({
      ...editedTask,
      [field]: value
    });
  };

  const handleSaveTask = async () => {
    if (!editedTask || !taskId || !projectId) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      // Prepare the payload to match the API structure
      const payload: any = {
        project_id: editedTask.projectId,
        name: editedTask.name,
        description: editedTask.description,
        status: editedTask.status,
        priority: editedTask.priority,
        start_date: new Date(editedTask.startDate).toISOString(),
        end_date: new Date(editedTask.endDate).toISOString(),
        assigned_hours: editedTask.assignedHours,
        reports_to_id: editedTask.reportsToId
      };

      // Include custom fields if they exist and have been modified
      if (editedTask.customFields && editedTask.customFields.length > 0) {
        payload.custom_fields = editedTask.customFields.map(field => ({
          id: field.id,
          field_name: field.field_name,
          field_type: field.field_type as 'text' | 'number' | 'date' | 'boolean',
          value: field.value
        }));
      }
      
      console.log('Updating task with payload:', payload);
      
      const response = await taskService.updateTask(employeeId, parseInt(projectId), parseInt(taskId), payload);
      
      if (response.success) {
        setTask(editedTask);
        setIsEditingTask(false);
        setEditedTask(null);
        toast.success("Task details have been updated successfully");
        
        // Reload task data to get updated information
        await loadTask();
      } else {
        toast.error(response.message || 'Failed to update task');
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task details');
    }
  };

  return (
    <AdminLayout 
      // title={task.name}
      // subtitle="Task Details & Management"
      actions={
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      }
    >
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
          {/* Task Overview - Clean Design */}
          <Card className="mb-6 mx-2 sm:mx-0 my-6">
            <CardContent className="p-6">
              {/* Header Row - Title and Action Buttons */}
              <div className="flex items-center justify-end space-x-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                  {!isEditingTask ? (
                    <Button variant="outline" size="sm" onClick={handleEditTask}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveTask}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              <div className="  mb-6">
                <div className="flex items-center ">
                  {isEditingTask ? (
                    <div className="flex flex-col w-full ">
                      <Label className="text-sm font-medium text-gray-600 mb-1">Task Name</Label>
                      <Input
                        value={editedTask?.name || ''}
                        onChange={(e) => handleTaskFieldChange('name', e.target.value)}
                        className="text-2xl font-bold"
                        placeholder="Task title"
                      />
                    </div>
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">
                      <span className="text-gray-500">Task:</span> {task.name}
                    </h1>
                  )}
                </div>
                
                {/* Status Badge and Action Buttons on the Right */}
               
              </div>
           
              {/* Description Section */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-600 flex items-center mb-2">
                  <FileText className="h-4 w-4 mr-1" />
                  Task Description
                </Label>
                {isEditingTask ? (
                  <Textarea
                    value={editedTask?.description || ''}
                    onChange={(e) => handleTaskFieldChange('description', e.target.value)}
                    className="min-h-[80px]"
                    placeholder="Enter task description..."
                  />
                ) : (
                  <p className="text-sm text-gray-800 leading-relaxed">{task.description}</p>
                )}
              </div>

              {/* Detailed Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Priority</Label>
                  {isEditingTask ? (
                    <Select value={editedTask?.priority || 'Medium'} onValueChange={(value) => handleTaskFieldChange('priority', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Progress</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={task.progress} className="flex-1" />
                    <span className="text-sm font-medium">{task.progress}%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                  {isEditingTask ? (
                    <Input
                      type="date"
                      value={editedTask?.startDate ? editedTask.startDate.split('T')[0] : ''}
                      onChange={(e) => handleTaskFieldChange('startDate', e.target.value + 'T09:00:00Z')}
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center text-sm mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {formatDate(task.startDate)}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">End Date</Label>
                  {isEditingTask ? (
                    <Input
                      type="date"
                      value={editedTask?.endDate ? editedTask.endDate.split('T')[0] : ''}
                      onChange={(e) => handleTaskFieldChange('endDate', e.target.value + 'T18:00:00Z')}
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center text-sm mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {formatDate(task.endDate)}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Assigned Hours</Label>
                  {isEditingTask ? (
                    <Input
                      type="number"
                      value={editedTask?.assignedHours || 0}
                      onChange={(e) => handleTaskFieldChange('assignedHours', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center text-sm mt-1">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {task.assignedHours} hrs
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Tracked Hours</Label>
                  <div className="flex items-center text-sm mt-1">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    {task.trackedHours} hrs
                  </div>
                </div>
              </div>

              {/* Assignee Section */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-600 flex items-center mb-2">
                  <User className="h-4 w-4 mr-1" />
                  Assignee
                </Label>
                {isEditingTask ? (
                  <Select 
                    value={editedTask?.reportsToId?.toString() || ''} 
                    onValueChange={(value) => {
                      const selectedEmployee = employees.find(emp => emp.id.toString() === value);
                      if (selectedEmployee) {
                        handleTaskFieldChange('reportsTo', selectedEmployee.full_name);
                        handleTaskFieldChange('reportsToId', selectedEmployee.id);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {task.reportsTo}
                  </div>
                )}
              </div>
              
              {/* Custom Fields - Integrated into Details Grid */}
              {task.customFields && task.customFields.length > 0 && (
                <div className="">
                  {/* <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-medium text-gray-600 flex items-center">
                      <List className="h-4 w-4 mr-1" />
                      Custom Fields
                    </Label>
                    <span className="text-xs text-gray-500">
                      {task.customFields.length} total
                    </span>
                  </div> */}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(() => {
                      const { fields, showMore } = getDisplayCustomFields();
                      return fields.map((field) => (
                        <div key={field.id} className="flex flex-col">
                          <span className="text-sm font-medium text-gray-600 mb-1">{field.field_name}</span>
                          {isEditingTask ? (
                            <Input
                              value={editedTask?.customFields?.find(f => f.id === field.id)?.value || field.value}
                              onChange={(e) => {
                                const updatedFields = editedTask?.customFields?.map(f => 
                                  f.id === field.id ? { ...f, value: e.target.value } : f
                                ) || [];
                                handleTaskFieldChange('customFields', updatedFields);
                              }}
                              placeholder={`Enter ${field.field_name.toLowerCase()}`}
                              type={field.field_type === 'number' ? 'number' : 'text'}
                              className="h-8 text-xs"
                            />
                          ) : (
                            <div className="flex items-center text-sm">
                              <span className="font-medium">{field.value}</span>
                              {/* <span className="ml-2 text-sm text-gray-400">({field.field_type})</span> */}
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                  
                  {getDisplayCustomFields().showMore && (
                    <div className="mt-4">
                      <button
                        onClick={toggleCustomFieldsExpansion}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        {isCustomFieldsExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            See More ({task.customFields.length - 3} more)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card className="mb-8 mx-2 sm:mx-0">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Subtasks</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Total Subtasks: {task.subtasks.length}</CardDescription>
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
                  <CreateTaskDialog 
                    onTaskCreate={handleSubtaskCreate} 
                    employees={[]}
                    buttonText="Add Subtask"
                    isSubtask={true}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'card' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {task.subtasks.map((subtask) => (
                    <Card key={subtask.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSubtaskClick(subtask.id)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{subtask.name}</CardTitle>
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubtaskEdit(subtask.id);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubtaskDelete(subtask.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(subtask.status)}>
                              {subtask.status}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <Progress value={subtask.progress} className="w-16" />
                              <span className="text-sm">{subtask.progress}%</span>
                            </div>
                          </div>
                          <Badge className={getPriorityColor(subtask.priority)}>
                            {subtask.priority}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            <p>Assignees: {subtask.assignees.join(', ')}</p>
                            <p>Reports to: {subtask.reportsTo}</p>
                            <p>Due: {formatDate(subtask.endDate)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignees</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {task.subtasks.map((subtask) => (
                      <TableRow key={subtask.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleSubtaskClick(subtask.id)}>
                        <TableCell className="font-medium">{subtask.id}</TableCell>
                        <TableCell>{subtask.name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(subtask.status)}>
                            {subtask.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={subtask.progress} className="w-16" />
                            <span className="text-sm">{subtask.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(subtask.priority)}>
                            {subtask.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{subtask.assignees.join(', ')}</TableCell>
                        <TableCell>{formatDate(subtask.endDate)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubtaskEdit(subtask.id);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubtaskDelete(subtask.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Task Updates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2 sm:px-0">
            <Card>
              <CardHeader>
                <CardTitle>Add Task Update</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="update-title">Title</Label>
                  <Input
                    id="update-title"
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                    placeholder="Update title..."
                    disabled={isPostingUpdate}
                  />
                </div>
                <div>
                  <Label htmlFor="update-description">Description</Label>
                  <Textarea
                    id="update-description"
                    value={newUpdate.description}
                    onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                    placeholder="Describe the update..."
                    rows={4}
                    disabled={isPostingUpdate}
                  />
                </div>
                <div>
                  <Label>Attach Files</Label>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPostingUpdate}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files {uploadedFiles.length > 0 && `(${uploadedFiles.length} selected)`}
                  </Button>
                </div>
                <div>
                  <Label>Record Audio</Label>
                  <Button 
                    variant={isRecording ? "destructive" : "outline"} 
                    className="w-full"
                    onClick={toggleRecording}
                    disabled={isPostingUpdate}
                  >
                    {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    {isRecording ? "Stop Recording" : "Start Recording"}
                    {audioBlob && !isRecording && " (Recorded)"}
                  </Button>
                </div>
                <Button 
                  onClick={handleAddUpdate} 
                  className="w-full"
                  disabled={isPostingUpdate}
                >
                  {isPostingUpdate ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    'Post Update'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Updates & History</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="updates" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Updates ({taskUpdates.length})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      History ({taskHistory.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="updates" className="mt-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {taskUpdates.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No task updates yet</p>
                      ) : (
                        taskUpdates.map((update) => (
                          <div key={update.id} className="border-l-2 border-blue-200 pl-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{update.title}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  {formatDate(update.created_at)}
                                </span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteTaskUpdate(update.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                            {update.files && update.files.length > 0 && (
                              <div className="mt-2">
                                {update.files.map((file, index) => (
                                  <Badge key={index} variant="outline" className="mr-1">
                                    <FileText className="h-3 w-3 mr-1" />
                                    <a 
                                      href={file.file_path} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:underline"
                                    >
                                      {file.file_name}
                                    </a>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {taskHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No task history yet</p>
                      ) : (
                        taskHistory.map((history) => (
                          <div key={history.id} className="border-l-2 border-gray-300 pl-4 pb-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {history.action}
                                </Badge>
                                <Badge className={getStatusColor(history.status)}>
                                  {history.status}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(history.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{history.description}</p>
                            <p className="text-xs text-gray-500">
                              By: {getEmployeeName(history.employee_id)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
      </div>
    </AdminLayout>
  );
};

export default TaskDetailsPage;
