import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, DollarSign, User, AlertCircle, Clock, CheckCircle, Grid, List, FileText } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { projectService, ApiProject } from '@/services/projectService';
import { toast } from 'sonner';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id: number;
  name: string;
  description: string;
  client: string;
  cost: number;
  progress: number;
  status: 'Created' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

// Helper function to map API project to UI project
const mapApiProjectToUi = (apiProject: ApiProject): Project => {
  // Calculate progress based on status (since API doesn't provide progress)
  const getProgressByStatus = (status: string): number => {
    switch (status.toLowerCase()) {
      case 'created': return 10;
      case 'in progress': return 50;
      case 'completed': return 100;
      case 'on hold': return 25;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  return {
    id: apiProject.id,
    name: apiProject.project_name,
    description: apiProject.project_description,
    client: apiProject.lead?.customer?.company_name || 'Unknown Client',
    cost: apiProject.project_cost,
    progress: getProgressByStatus(apiProject.status),
    status: apiProject.status as Project['status'],
    priority: apiProject.priority,
    startDate: apiProject.start_date,
    endDate: apiProject.end_date,
    createdAt: apiProject.start_date, // Using start_date as created date
  };
};


interface SortableProjectCardProps {
  project: Project;
  onNavigate: (id: number) => void;
}

const SortableProjectCard = ({ project, onNavigate }: SortableProjectCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return <FileText className="h-4 w-4" />;
      case 'in progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'on hold':
        return <Clock className="h-4 w-4" />;    
      case 'cancelled':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-lg scale-105' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <CardTitle 
            className="text-base text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(project.id);
            }}
          >
            {project.name}
          </CardTitle>
          <Badge className={getPriorityColor(project.priority)}>
            {project.priority}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600 line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(project.status)} variant="outline">
            {getStatusIcon(project.status)}
            <span className="ml-1">{project.status}</span>
          </Badge>
          <span className="text-xs text-gray-500">
            {project.progress}%
          </span>
        </div>

        <Progress value={project.progress} className="h-1.5" />

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center text-gray-600">
            <User className="h-3 w-3 mr-2" />
            {project.client}
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-3 w-3 mr-2" />
            ${project.cost.toLocaleString()}
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(project.id);
            }}
            size="sm"
            className="w-full h-7 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface DroppableColumnProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  projects: Project[];
  bgColor: string;
  borderColor: string;
  onNavigate: (id: number) => void;
}

const DroppableColumn = ({ 
  id, 
  title, 
  icon, 
  projects, 
  bgColor, 
  borderColor,
  onNavigate 
}: DroppableColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : undefined,
  };

  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          {icon}
          {title}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {projects.length}
        </Badge>
      </div>
      <SortableContext
        items={projects.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          style={style}
          className={`space-y-3 min-h-[400px] p-2 rounded-lg border-2 border-dashed ${borderColor} transition-all duration-200 ${
            isOver ? 'border-solid bg-white/50' : ''
          }`}
        >
          {projects.map((project) => (
            <SortableProjectCard
              key={project.id}
              project={project}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Get current user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1; // Fallback to employee ID 1 for testing
      
      if (!employeeId) {
        toast.error('User not authenticated');
        return;
      }

      const response = await projectService.getProjects(employeeId);
      console.log("Projects",response.response)
      
      if (response.success && response.response?.data) {
        const mappedProjects = response.response.data.map(mapApiProjectToUi);
        setProjects(mappedProjects);
      } else {
        toast.error('Failed to load projects');
      }
    } catch (error: any) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate progress based on status
  const getProgressByStatus = (status: string): number => {
    switch (status.toLowerCase()) {
      case 'created': return 10;
      case 'in progress': return 50;
      case 'completed': return 100;
      case 'on hold': return 25;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getProjectsByStatus = (status: 'Created' | 'In Progress' | 'Completed') => {
    return projects.filter(project => project.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as number;
    const overId = over.id as string;
    
    // Extract status from drop zone id (e.g., "droppable-created" -> "Created")
    const statusMap: { [key: string]: Project['status'] } = {
      'created': 'Created',
      'in-progress': 'In Progress', 
      'completed': 'Completed'
    };
    const newStatus = statusMap[overId.replace('droppable-', '')] || 'Created';
    
    // Find the current project to check if status actually changed
    const currentProject = projects.find(p => p.id === activeId);
    if (!currentProject || currentProject.status === newStatus) {
      setActiveId(null);
      return;
    }

    // Optimistically update the UI
    setProjects(prev => 
      prev.map(project => 
        project.id === activeId 
          ? { ...project, status: newStatus, progress: getProgressByStatus(newStatus) }
          : project
      )
    );
    
    try {
      // Get current user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user?.id || 1; // Fallback to employee ID 1 for testing
      
      if (!employeeId) {
        throw new Error('User not authenticated');
      }

      // Call the API to update project status
      await projectService.updateProjectStatus(employeeId, activeId, newStatus);
      
      toast.success(`Project status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating project status:', error);
      
      // Revert the optimistic update on error
      setProjects(prev => 
        prev.map(project => 
          project.id === activeId 
            ? { ...project, status: currentProject.status, progress: currentProject.progress }
            : project
        )
      );
      
      toast.error('Failed to update project status');
    }
    
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return <FileText className="h-4 w-4" />;
      case 'in progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'on hold':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout 
      title="Project Management"
      // subtitle="Manage and track all your projects in one place"
      actions={
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => navigate('/projects/create')} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              <DroppableColumn
                id="droppable-created"
                title="Created"
                icon={<FileText className="h-5 w-5 mr-2 text-gray-600" />}
                projects={getProjectsByStatus('Created')}
                bgColor="bg-gray-50"
                borderColor="border-gray-200"
                onNavigate={(id) => navigate(`/project-details/${id}`)}
              />
              
              <DroppableColumn
                id="droppable-in-progress"
                title="In Progress"
                icon={<AlertCircle className="h-5 w-5 mr-2 text-blue-600" />}
                projects={getProjectsByStatus('In Progress')}
                bgColor="bg-blue-50"
                borderColor="border-blue-200"
                onNavigate={(id) => navigate(`/project-details/${id}`)}
              />
              
              <DroppableColumn
                id="droppable-completed"
                title="Completed"
                icon={<CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
                projects={getProjectsByStatus('Completed')}
                bgColor="bg-green-50"
                borderColor="border-green-200"
                onNavigate={(id) => navigate(`/project-details/${id}`)}
              />
            </div>

            <DragOverlay>
              {activeId ? (
                <SortableProjectCard
                  project={projects.find(p => p.id === activeId)!}
                  onNavigate={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.client}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)} variant="outline">
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={project.progress} className="w-16" />
                          <span className="text-sm">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>${project.cost.toLocaleString()}</TableCell>
                      <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => navigate(`/project-details/${project.id}`)}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first project.</p>
              <Button 
                onClick={() => navigate('/projects/create')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProjectsPage;
