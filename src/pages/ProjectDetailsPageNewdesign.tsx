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
import { projectService, DetailedProject } from '@/services/projectService';
import { employeeService } from '@/services/employeeService';
import { taskService, ApiTask, CreateTaskRequest } from '@/services/taskService';
import { projectUpdatesService, ApiProjectUpdate, ProjectHistory } from '@/services/projectUpdatesService';
import { ApiEmployee } from '@/types/employee';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  LogOut, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Upload,
  FileText,
  Mic,
  MicOff,
  Grid,
  List,
  ExternalLink,
  Users,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Copy,
  Video,
  Link2,
  History
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/AdminLayout';
import KanbanColumn from '@/components/KanbanColumn';
import TaskCard from '@/components/TaskCard';
import CreateTaskDialog from '@/components/CreateTaskDialog';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

interface Task {
  id: number;
  name: string;
  status: 'Todo' | 'In Progress' | 'Reviewed' | 'Completed';
  progress: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  startDate: string;
  endDate: string;
  assignee: string;
  description: string;
  assignedHours: number;
  trackedHours: number;
  reportsToId: number;
}

interface ProjectUpdate {
  id: number;
  title: string;
  description: string;
  date: string;
  author: string;
  files?: Array<{
    id: number;
    file_name: string;
    file_size: string;
    file_path: string;
    file_type: string;
  }>;
  audio?: string;
}

interface ProjectDetails {
  id: number;
  title: string;
  description: string;
  clientName: string;
  projectCost: number;
  assignedHours: number;
  demoUrl?: string;
  designUrl?: string;
  developmentUrl?: string;
  projectManager: string;
  assignees: string[];
  status: 'Created' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: string;
  startDate: string;
  endDate: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  totalTickets: number;
  tasks: Task[];
  fundsCollected: number;
  paymentsReceived: number;
  remainingBalance: number;
  updates: ProjectUpdate[];
  leadId: string;
  projectManagerId: number;
}

// Helper function to map API task to UI task
const mapApiTaskToUi = (apiTask: ApiTask): Task => {
  return {
    id: apiTask.id,
    name: apiTask.name,
    description: apiTask.description,
    status: apiTask.status,
    priority: apiTask.priority,
    startDate: apiTask.start_date,
    endDate: apiTask.end_date,
    assignee: apiTask.reports_to?.full_name || 'Unassigned',
    progress: apiTask.progress,
    assignedHours: apiTask.assigned_hours,
    trackedHours: apiTask.tracked_hours,
    reportsToId: apiTask.reports_to_id,
  };
};

// Helper function to map API project update to UI project update
const mapApiProjectUpdateToUi = (apiUpdate: ApiProjectUpdate): ProjectUpdate => {
  return {
    id: apiUpdate.id,
    title: apiUpdate.title,
    description: apiUpdate.description,
    date: apiUpdate.created_at,
    author: 'Project Team', // API doesn't provide author info, using default
    files: apiUpdate.files?.map(file => ({
      id: file.id,
      file_name: file.file_name,
      file_size: file.file_size,
      file_path: file.file_path,
      file_type: file.file_type
    })) || []
  };
};

// Helper function to map API project to UI project
const mapDetailedProjectToUi = (apiProject: DetailedProject): ProjectDetails => {
  return {
    id: apiProject.id,
    title: apiProject.project_name,
    description: apiProject.project_description,
    clientName: apiProject.lead?.customer?.company_name || 'Unknown Client',
    projectCost: apiProject.project_cost,
    assignedHours: apiProject.assigned_hours,
    demoUrl: apiProject.demo_url,
    designUrl: apiProject.demo_url, // For now, both URLs use the same field
    developmentUrl: apiProject.demo_url, // For now, both URLs use the same field
    projectManager: apiProject.project_manager?.full_name || 'Not Assigned',
    assignees: apiProject.assignees?.map(assignee => assignee.employee.full_name) || [],
    status: apiProject.status as ProjectDetails['status'],
    priority: apiProject.priority,
    startDate: apiProject.start_date,
    endDate: apiProject.end_date,
    clientEmail: apiProject.lead?.customer?.email || '',
    clientPhone: apiProject.lead?.customer?.phone_number || '',
    clientAddress: apiProject.lead?.customer?.address || '',
    totalTickets: 0, // This would need to come from a separate API
    tasks: [], // This would need to come from a separate API
    fundsCollected: apiProject.project_cost * 0.6, // Mock calculation
    paymentsReceived: apiProject.project_cost * 0.5, // Mock calculation
    remainingBalance: apiProject.project_cost * 0.5, // Mock calculation
    updates: [], // Will be loaded separately
    leadId: apiProject.lead_id,
    projectManagerId: apiProject.project_manager_id,
  };
};


const ProjectDetailsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [projectHistory, setProjectHistory] = useState<ProjectHistory[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [activeTab, setActiveTab] = useState('updates');
  const [isProjectExpanded, setIsProjectExpanded] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [editingTask, setEditingTask] = useState<Task | null>(null); 
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editedProject, setEditedProject] = useState<ProjectDetails | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
    
    if (projectId) {
      loadProject();
    } else {
      navigate('/projects');
    }
  }, [projectId, navigate]);

  const loadTasks = async () => {
    if (!projectId) return;
    
    try {
      setTasksLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      const response = await taskService.getTasks(employeeId, parseInt(projectId));
      
      if (response.success && response.message?.data) {
        const mappedTasks = response.message.data.map(mapApiTaskToUi);
        setTasks(mappedTasks);
      }
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  const loadProjectUpdates = async () => {
    if (!projectId) return;
    
    try {
      setUpdatesLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      const response = await projectUpdatesService.getProjectUpdates(employeeId, parseInt(projectId));
      
      if (response.success && response.data) {
        const mappedUpdates = response.data.map(mapApiProjectUpdateToUi);
        setProjectUpdates(mappedUpdates);
      }
    } catch (error: any) {
      console.error('Error loading project updates:', error);
      toast.error('Failed to load project updates');
    } finally {
      setUpdatesLoading(false);
    }
  };

  const loadProjectHistory = async () => {
    if (!projectId) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      console.log('Loading project history with:', { employeeId, projectId });

      const response = await projectUpdatesService.getProjectHistory(employeeId, parseInt(projectId));
      
      console.log('Project history response:', response);

      if (response.success && response.message?.data) {
        setProjectHistory(response.message.data);
        console.log('Project history loaded successfully:', response.message.data);
      } else {
        console.error('Failed to load project history:', response);
      }
    } catch (error) {
      console.error('Error loading project history:', error);
    }
  };

  const loadProject = async () => {
    try {
      setLoading(true);
      // Get current user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1; // Fallback to employee ID 1 for testing
      
      if (!employeeId) {
        toast.error('User not authenticated');
        navigate('/projects');
        return;
      }

      if (!projectId) {
        toast.error('Project ID not provided');
        navigate('/projects');
        return;
      }

      const response = await projectService.getProjectById(employeeId, parseInt(projectId));
      
      if (response.success && response.data) {
        const mappedProject = mapDetailedProjectToUi(response.data);
        setProject(mappedProject);
        setEditedProject(mappedProject);
        
        // Load employees for assignee selection
        try {
          const employeesResponse = await employeeService.getEmployees();
          if (employeesResponse.success && employeesResponse.message?.data) {
            setEmployees(employeesResponse.message.data);
          }
        } catch (error) {
          console.error('Error loading employees:', error);
        }
        
        // Load tasks, project updates, and project history for this project
        loadTasks();
        loadProjectUpdates();
        loadProjectHistory();
      } else {
        toast.error('Failed to load project details');
        navigate('/projects');
      }
    } catch (error: any) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
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
    navigate('/projects');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'frontend':
        return 'bg-blue-100 text-blue-800';
      case 'backend':
        return 'bg-purple-100 text-purple-800';
      case 'testing':
        return 'bg-orange-100 text-orange-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'created':
        return 'bg-gray-100 text-gray-800';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
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
      case 'urgent':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleConnectZoom = () => {
    // Create a Zoom meeting URL
    const meetingId = Math.random().toString(36).substring(2, 15);
    const zoomUrl = `https://zoom.us/j/${meetingId}`;
    
    // Open Zoom meeting in a new tab
    window.open(zoomUrl, '_blank');
    
    // Also copy the meeting link to clipboard
    navigator.clipboard.writeText(zoomUrl).then(() => {
      toast.success('Zoom meeting link copied to clipboard!');
    }).catch(() => {
      toast.info(`Zoom meeting created: ${zoomUrl}`);
    });
  };

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

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAddUpdate = async () => {
    if (!projectId || !newUpdate.title.trim() || !newUpdate.description.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }
    
    setIsPostingUpdate(true);
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      const updateData = {
        title: newUpdate.title,
        description: newUpdate.description
      };
      
      const response = await projectUpdatesService.createProjectUpdate(
        employeeId, 
        parseInt(projectId), 
        updateData, 
        uploadedFiles.length > 0 ? uploadedFiles : undefined
      );
      
      if (response.success && response.data) {
        const newProjectUpdate = mapApiProjectUpdateToUi(response.data);
        setProjectUpdates(prevUpdates => [newProjectUpdate, ...prevUpdates]);
        
        // Reset form
        setNewUpdate({ title: '', description: '' });
        setUploadedFiles([]);
        setAudioBlob(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Reload project history
        await loadProjectHistory();
        
        toast.success("Project update has been posted successfully");
      } else {
        toast.error(response.message || 'Failed to create project update');
      }
    } catch (error: any) {
      console.error('Error creating project update:', error);
      toast.error('Failed to create project update');
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const handleDeleteUpdate = async (updateId: number) => {
    if (!projectId) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      const response = await projectUpdatesService.deleteProjectUpdate(employeeId, parseInt(projectId), updateId);
      
      if (response.success) {
        setProjectUpdates(prevUpdates => prevUpdates.filter(update => update.id !== updateId));
        // Reload project history
        await loadProjectHistory();
        toast.success("Project update has been removed");
      } else {
        toast.error(response.message || 'Failed to delete project update');
      }
    } catch (error: any) {
      console.error('Error deleting project update:', error);
      toast.error('Failed to delete project update');
    }
  };

  const handleTaskCreate = async (taskData: CreateTaskRequest) => {
    if (!project || !projectId) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      const response = await taskService.createTask(employeeId, parseInt(projectId), taskData);
      
      if (response.success && response.data) {
        const newTask = mapApiTaskToUi(response.data);
        setTasks(prevTasks => [...prevTasks, newTask]);
        toast.success('Task created successfully');
      } else {
        toast.error(response.message || 'Failed to create task');
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleTaskEdit = (taskId: number) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      toast.info("Task editing functionality will be implemented");
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    if (!projectId) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      const response = await taskService.deleteTask(employeeId, parseInt(projectId), taskId);
      
      if (response.success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        toast.success("Task has been removed from the project");
      } else {
        toast.error(response.message || 'Failed to delete task');
      }
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/project/${projectId}/task/${taskId}`);
  };

  const handleEditProject = () => {
    setIsEditingProject(true);
    setIsProjectExpanded(true); // Expand the card when editing
  };

  const handleSaveProject = async () => {
    if (!editedProject || !projectId) return;
    
    try {
      // Get current user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      // Prepare the payload to match the API structure
      const payload: any = {
        project_name: editedProject.title,
        lead_id: editedProject.leadId,
        project_description: editedProject.description,
        start_date: new Date(editedProject.startDate).toISOString(),
        end_date: new Date(editedProject.endDate).toISOString(),
        project_cost: editedProject.projectCost,
        status: editedProject.status,
        priority: editedProject.priority,
        demo_url: editedProject.designUrl || editedProject.developmentUrl || '', // Use design URL as primary, fallback to development URL
        assigned_hours: editedProject.assignedHours,
        project_manager_id: editedProject.projectManagerId,
        assignees: editedProject.assignees.map(name => {
          // Find employee by name and return their ID
          const employee = employees.find(emp => emp.full_name === name);
          return { employee_id: employee?.id || 0 };
        }).filter(assignee => assignee.employee_id > 0)
      };
      
      const response = await projectService.updateProject(employeeId, parseInt(projectId), payload);
      
      if (response.success) {
        setProject(editedProject);
        setIsEditingProject(false);
        toast.success("Project details have been saved successfully");
        
        // Reload project data to get updated information
        loadProject();
      } else {
        toast.error(response.message || 'Failed to update project');
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project details');
    }
  };

  const handleCancelEdit = () => {
    setEditedProject(project);
    setIsEditingProject(false);
  };

  const handleProjectFieldChange = (field: keyof ProjectDetails, value: any) => {
    if (!editedProject) return;
    
    setEditedProject({
      ...editedProject,
      [field]: value
    });
  };

  const handleAddAssignee = () => {
    if (!selectedAssigneeId || !editedProject) return;
    
    const employee = employees.find(emp => emp.id.toString() === selectedAssigneeId);
    if (!employee) return;
    
    // Check if already assigned
    if (editedProject.assignees.includes(employee.full_name)) {
      toast.error('Employee is already assigned to this project');
      return;
    }
    
    setEditedProject({
      ...editedProject,
      assignees: [...editedProject.assignees, employee.full_name]
    });
    
    setSelectedAssigneeId('');
  };

  const handleAssigneeSelect = (employeeId: string) => {
    if (!editedProject) return;
    
    const employee = employees.find(emp => emp.id.toString() === employeeId);
    if (!employee) return;
    
    // Check if already assigned
    if (editedProject.assignees.includes(employee.full_name)) {
      toast.error('Employee is already assigned to this project');
      return;
    }
    
    setEditedProject({
      ...editedProject,
      assignees: [...editedProject.assignees, employee.full_name]
    });
    
    setSelectedAssigneeId('');
  };

  const handleRemoveAssignee = (assigneeName: string) => {
    if (!editedProject) return;
    
    setEditedProject({
      ...editedProject,
      assignees: editedProject.assignees.filter(name => name !== assigneeName)
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !projectId) return;

    const taskId = active.id as number;
    
    // Debug logging
    console.log('Drag end event:', { 
      activeId: active.id, 
      overId: over.id, 
      overIdType: typeof over.id,
      availableColumns: COLUMNS.map(col => col.id),
      availableTasks: tasks.map(task => ({ id: task.id, status: task.status }))
    });
    
    let newStatus: Task['status'];
    
    // Check if we're dropping on a column (string) or on a task (number)
    if (typeof over.id === 'string') {
      // Dropping directly on a column
      const targetColumn = COLUMNS.find(col => col.id === over.id);
      if (!targetColumn) {
        console.error('Invalid drop target - column not found:', over.id);
        toast.error('Invalid drop target');
        return;
      }
      newStatus = targetColumn.id;
    } else if (typeof over.id === 'number') {
      // Dropping on a task - find which column that task belongs to
      const targetTask = tasks.find(task => task.id === over.id);
      if (!targetTask) {
        console.error('Invalid drop target - task not found:', over.id);
        toast.error('Invalid drop target');
        return;
      }
      newStatus = targetTask.status;
    } else {
      console.error('Invalid drop target - unexpected type:', typeof over.id, over.id);
      toast.error('Invalid drop target');
      return;
    }
    
    // Validate that the new status is valid
    const validStatuses: Task['status'][] = ['Todo', 'In Progress', 'Reviewed', 'Completed'];
    if (!validStatuses.includes(newStatus)) {
      console.error('Invalid status received:', newStatus);
      toast.error('Invalid drop target');
      return;
    }
    
    // Find the current task
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    // Optimistic update
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      )
    );

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1;
      
      console.log('Updating task status:', { employeeId, projectId, taskId, newStatus, statusType: typeof newStatus });
      
      const response = await taskService.updateTaskStatus(employeeId, parseInt(projectId), taskId, newStatus);
      
      console.log('Task status update response:', response);
      
      if (response.success) {
        toast.success(`Task moved to ${newStatus} column`);
      } else {
        // Revert optimistic update on failure
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: currentTask.status }
              : task
          )
        );
        toast.error(response.message || 'Failed to update task status');
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: currentTask.status }
            : task
        )
      );
      console.error('Error updating task status:', error);
      console.error('Error details:', { 
        message: error.message, 
        response: error.response?.data, 
        status: error.response?.status,
        taskId, 
        newStatus 
      });
      toast.error('Failed to update task status');
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status) || [];
  };

  const COLUMNS: { id: Task['status']; title: string; color: string }[] = [
    { id: 'Todo', title: 'Todo', color: 'bg-gray-50 border-gray-200' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { id: 'Reviewed', title: 'Reviewed', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'Completed', title: 'Completed', color: 'bg-green-50 border-green-200' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-gray-600 mb-6">The requested project could not be loaded.</p>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      subtitle="Project Details & Task Management"
      actions={
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Button>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">
              {/* Premium Project Showcase Card */}
              <div className="mb-8">
                <Card 
                  className="group relative cursor-pointer overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2"
                  onClick={() => setIsProjectExpanded(!isProjectExpanded)}
                >
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-500"></div>
                  <div className="absolute inset-[1px] bg-white/90 backdrop-blur-xl rounded-2xl"></div>
                  <CardContent className="relative z-10 p-8">
                    {/* Premium Header with Project Name and Action Buttons */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-6">
                        {isEditingProject ? (
                          <Input
                            value={editedProject?.title || ''}
                            onChange={(e) => handleProjectFieldChange('title', e.target.value)}
                            className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent border-none p-0 h-auto focus:ring-0 focus:border-b-2 focus:border-blue-500 bg-transparent placeholder:text-slate-400"
                            placeholder="Project title"
                          />
                        ) : (
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent leading-tight">
                            {project.title}
                          </h1>
                        )}
                        {/* Premium URL Links */}
                        <div 
                          className="flex items-center space-x-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {project.designUrl && (
                            <a
                              href={project.designUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 rounded-full border border-amber-200/50 hover:border-amber-300 transition-all duration-300 hover:scale-105"
                            >
                              <Link2 className="h-4 w-4 text-amber-600 group-hover/link:rotate-12 transition-transform duration-300" />
                              <span className="text-sm font-medium text-amber-700">Design</span>
                            </a>
                          )}
                          {project.developmentUrl && (
                            <a
                              href={project.developmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-full border border-emerald-200/50 hover:border-emerald-300 transition-all duration-300 hover:scale-105"
                            >
                              <Link2 className="h-4 w-4 text-emerald-600 group-hover/link:rotate-12 transition-transform duration-300" />
                              <span className="text-sm font-medium text-emerald-700">Development</span>
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Premium Action Buttons */}
                      <div 
                        className="flex items-center space-x-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Badge className={`${getStatusColor(project.status)} px-4 py-2 text-sm font-semibold rounded-full shadow-sm border-0 backdrop-blur-sm`}>
                          {project.status}
                        </Badge>
                        {!isEditingProject ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleEditProject}
                            className="group relative overflow-hidden bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          >
                            <Edit className="h-4 w-4 mr-2 transition-transform group-hover:rotate-12" />
                            Edit Project
                          </Button>
                        ) : (
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleCancelEdit}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveProject}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Premium Timeline Card */}
                    <div className="relative bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/50 shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
                      <div className="relative z-10 grid grid-cols-2 gap-6">
                        <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-300">
                          <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Start Date</p>
                            <p className="text-sm font-semibold text-slate-800">{formatDate(project.startDate)}</p>
                          </div>
                        </div>
                        <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-300">
                          <div className="p-2 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors duration-300">
                            <Calendar className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">End Date</p>
                            <p className="text-sm font-semibold text-slate-800">{formatDate(project.endDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Premium Team Members Row */}
                    <div className="flex items-center justify-between">
                      {/* Team Members */}
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Team Members</span>
                        <div className="flex flex-wrap gap-3">
                          {project.assignees.map((assignee, index) => (
                            <div
                              key={index}
                              className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-blue-100 hover:to-indigo-100 text-slate-800 rounded-full border border-slate-200/50 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                            >
                              <div className="p-1 bg-white rounded-full group-hover:bg-blue-50 transition-colors duration-300">
                                <User className="h-3 w-3 text-slate-600 group-hover:text-blue-600" />
                              </div>
                              <span className="text-sm font-medium">{assignee}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Premium Expand/Collapse Indicator */}
                      <div className="group flex items-center space-x-3 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/50 hover:bg-white/80 transition-all duration-300 cursor-pointer">
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                          {isProjectExpanded ? 'Collapse Details' : 'Expand Details'}
                        </span>
                        {isProjectExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-600 group-hover:text-slate-900 transition-all duration-300 group-hover:scale-110" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-600 group-hover:text-slate-900 transition-all duration-300 group-hover:scale-110" />
                        )}
                      </div>
                    </div>

                    {/* Premium Expanded Details */}
                    {isProjectExpanded && (
                      <div 
                        className="mt-8 pt-8 border-t border-gradient-to-r from-transparent via-slate-200 to-transparent space-y-8 animate-in slide-in-from-top-4 duration-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Premium Project Description */}
                        <div className="group">
                          <Label className="text-sm font-semibold text-slate-700 flex items-center mb-4 uppercase tracking-wide">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors duration-300">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            Project Description
                          </Label>
                          {isEditingProject ? (
                            <Textarea
                              value={editedProject?.description || ''}
                              onChange={(e) => handleProjectFieldChange('description', e.target.value)}
                              className="min-h-[100px] bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                              placeholder="Enter project description..."
                            />
                          ) : (
                            <div className="p-6 bg-gradient-to-br from-slate-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm">
                              <p className="text-slate-800 leading-relaxed font-medium">{project.description}</p>
                            </div>
                          )}
                        </div>

                        {/* URLs Section - Only show in edit mode */}
                        {isEditingProject && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600 flex items-center mb-2">
                              <Link2 className="h-4 w-4 mr-1" />
                              Project URLs
                            </Label>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs text-gray-500">Design URL</Label>
                                <Input
                                  value={editedProject?.designUrl || ''}
                                  onChange={(e) => handleProjectFieldChange('designUrl', e.target.value)}
                                  placeholder="https://design.example.com"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Development URL</Label>
                                <Input
                                  value={editedProject?.developmentUrl || ''}
                                  onChange={(e) => handleProjectFieldChange('developmentUrl', e.target.value)}
                                  placeholder="https://dev.example.com"
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                  Note: Both URLs currently use the same backend field. Will be separated later.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Detailed Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Project Cost</Label>
                            {isEditingProject ? (
                              <Input
                                type="number"
                                value={editedProject?.projectCost || 0}
                                onChange={(e) => handleProjectFieldChange('projectCost', parseFloat(e.target.value) || 0)}
                                placeholder="Project cost"
                              />
                            ) : (
                              <p className="text-lg font-semibold">{formatCurrency(project.projectCost)}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Assigned Hours</Label>
                            {isEditingProject ? (
                              <Input
                                type="number"
                                value={editedProject?.assignedHours || 0}
                                onChange={(e) => handleProjectFieldChange('assignedHours', parseInt(e.target.value) || 0)}
                                placeholder="Assigned hours"
                              />
                            ) : (
                              <p className="flex items-center text-lg font-semibold">
                                <Clock className="h-4 w-4 mr-1" />
                                {project.assignedHours} hrs
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Project Manager</Label>
                            {isEditingProject ? (
                              <Input
                                value={editedProject?.projectManager || ''}
                                onChange={(e) => handleProjectFieldChange('projectManager', e.target.value)}
                                placeholder="Project manager name"
                              />
                            ) : (
                              <p className="flex items-center text-lg font-semibold">
                                <User className="h-4 w-4 mr-1" />
                                {project.projectManager}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Client Contact Details */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            Client Contact
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Client Name</Label>
                              {isEditingProject ? (
                                <Input
                                  value={editedProject?.clientName || ''}
                                  onChange={(e) => handleProjectFieldChange('clientName', e.target.value)}
                                  placeholder="Client name"
                                />
                              ) : (
                                <p className="text-lg font-semibold">{project.clientName}</p>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Email</Label>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{project.clientEmail}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(project.clientEmail, 'Email')}
                                  className="p-1"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{project.clientPhone}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(project.clientPhone, 'Phone number')}
                                  className="p-1"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Address</Label>
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                <span className="text-sm">{project.clientAddress}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Connect via Zoom */}
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <div className="flex flex-col space-y-2">
                              <Button
                                variant="outline"
                                onClick={handleConnectZoom}
                                className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Video className="h-4 w-4" />
                                <span>Connect via Zoom</span>
                              </Button>
                              <p className="text-xs text-gray-500">
                                Click to create and join a Zoom meeting instantly
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Team Assignees */}
                        <div>
                          <Label className="text-sm font-medium text-gray-600 flex items-center mb-2">
                            <Users className="h-4 w-4 mr-1" />
                            Team Assignees ({project.assignees.length})
                          </Label>
                          {isEditingProject ? (
                            <div className="space-y-3">
                              {/* Current Assignees with Remove Option */}
                              <div className="flex flex-wrap gap-2">
                                {editedProject?.assignees.map((assignee, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className="px-3 py-1 flex items-center gap-1 bg-gray-100 text-gray-800 border border-gray-300"
                                  >
                                    <User className="h-3 w-3" />
                                    {assignee}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAssignee(assignee)}
                                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              
                              {/* Add New Assignee */}
                              <div className="flex gap-2">
                                <Select value={selectedAssigneeId} onValueChange={handleAssigneeSelect}>
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select an employee to assign" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {employees
                                      .filter(emp => !editedProject?.assignees.includes(emp.full_name))
                                      .map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id.toString()}>
                                          {employee.full_name} - {employee.role_name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {project.assignees.map((assignee, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1">
                                  <User className="h-3 w-3 mr-1" />
                                  {assignee}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Premium Financial Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative z-10 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors duration-300">
                        <DollarSign className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{formatCurrency(project.projectCost)}</p>
                        <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Project Cost</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative z-10 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{formatCurrency(project.fundsCollected)}</p>
                        <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Funds Collected</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative z-10 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-300">
                        <CheckCircle className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{formatCurrency(project.paymentsReceived)}</p>
                        <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Payments Received</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative z-10 p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors duration-300">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{formatCurrency(project.remainingBalance)}</p>
                        <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Remaining Balance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Premium Task Management - Kanban Board */}
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-2xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pb-6">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Grid className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Project Tasks</span>
                    </div>
                    <CreateTaskDialog
                      onTaskCreate={handleTaskCreate}
                      employees={employees}
                      buttonText="Add Task"
                    />
                  </CardTitle>
                  <CardDescription className="text-slate-600 font-medium mt-2">Drag and drop tasks between columns to update status</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  {tasksLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                        </div>
                        <span className="text-slate-600 font-medium">Loading tasks...</span>
                      </div>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
                        {COLUMNS.map((column) => (
                          <KanbanColumn
                            key={column.id}
                            column={column}
                            tasks={getTasksByStatus(column.id)}
                            onTaskEdit={handleTaskEdit}
                            onTaskDelete={handleTaskDelete}
                            onTaskClick={handleTaskClick}
                            formatDate={formatDate}
                            getStatusColor={getTaskStatusColor}
                            getPriorityColor={getPriorityColor}
                          />
                        ))}
                      </div>
                      <DragOverlay>
                        {activeTask ? (
                          <TaskCard
                            task={activeTask}
                            onTaskEdit={handleTaskEdit}
                            onTaskDelete={handleTaskDelete}
                            onTaskClick={handleTaskClick}
                            formatDate={formatDate}
                            getStatusColor={getTaskStatusColor}
                            getPriorityColor={getPriorityColor}
                            isDragging={true}
                          />
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  )}
                </CardContent>
              </Card>

              {/* Premium Project Updates Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Add Project Update</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-6">
                    <div className="group">
                      <Label htmlFor="update-title" className="text-sm font-semibold text-slate-700 mb-2 block">Update Title</Label>
                      <Input
                        id="update-title"
                        value={newUpdate.title}
                        onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                        placeholder="Enter a descriptive title..."
                        disabled={isPostingUpdate}
                        className="bg-white/80 backdrop-blur-sm border-slate-200 focus:border-green-400 focus:ring-green-400/20 rounded-xl transition-all duration-300"
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="update-description" className="text-sm font-semibold text-slate-700 mb-2 block">Description</Label>
                      <Textarea
                        id="update-description"
                        value={newUpdate.description}
                        onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                        placeholder="Describe the progress, changes, or important updates..."
                        rows={4}
                        disabled={isPostingUpdate}
                        className="bg-white/80 backdrop-blur-sm border-slate-200 focus:border-green-400 focus:ring-green-400/20 rounded-xl transition-all duration-300"
                      />
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Attach Files</Label>
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <Button 
                        variant="outline" 
                        className="w-full group/btn bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300 hover:scale-105"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPostingUpdate}
                      >
                        <Upload className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                        Upload Files {uploadedFiles.length > 0 && `(${uploadedFiles.length} selected)`}
                      </Button>
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Record Audio</Label>
                      <Button 
                        variant={isRecording ? "destructive" : "outline"} 
                        className={`w-full transition-all duration-300 hover:scale-105 ${
                          isRecording 
                            ? "bg-red-500 hover:bg-red-600 border-red-500" 
                            : "bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                        onClick={toggleRecording}
                        disabled={isPostingUpdate}
                      >
                        {isRecording ? (
                          <MicOff className="h-4 w-4 mr-2 animate-pulse" />
                        ) : (
                          <Mic className="h-4 w-4 mr-2" />
                        )}
                        {isRecording ? "Stop Recording" : "Start Recording"}
                        {audioBlob && !isRecording && " (Recorded)"}
                      </Button>
                    </div>
                    <Button 
                      onClick={handleAddUpdate} 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      disabled={isPostingUpdate}
                    >
                      {isPostingUpdate ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Posting Update...
                        </>
                      ) : (
                        'Post Update'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <History className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Project Updates & History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {updatesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200"></div>
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                          </div>
                          <span className="text-slate-600 font-medium">Loading updates...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                        {projectUpdates.map((update) => (
                        <div key={update.id} className="group/update relative bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-l-xl"></div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-slate-800 group-hover/update:text-slate-900 transition-colors duration-300">{update.title}</h4>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                {formatDate(update.date)}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteUpdate(update.id)}
                                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 mb-3 leading-relaxed">{update.description}</p>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">By {update.author}</p>
                          {update.files && update.files.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {update.files.map((file) => (
                                <Badge key={file.id} variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-300 transition-all duration-300">
                                  <FileText className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-[150px]">{file.file_name}</span>
                                  <span className="ml-1 text-xs text-slate-400">({file.file_size})</span>
                                </Badge>
                              ))}
                            </div>
                          )}
                          {update.audio && (
                            <div className="mt-3">
                              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200 hover:border-purple-300 transition-all duration-300">
                                <Mic className="h-3 w-3 mr-1" />
                                Audio Recording
                              </Badge>
                            </div>
                          )}
                        </div>
                        ))}
                        {projectUpdates.length === 0 && (
                          <div className="text-center py-12">
                            <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                              <FileText className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-medium">No project updates yet</p>
                            <p className="text-sm text-slate-500 mt-1">Add your first update to get started</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProjectDetailsPage;

