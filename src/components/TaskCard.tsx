import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

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

interface TaskCardProps {
  task: Task;
  onTaskEdit: (taskId: number) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskClick: (taskId: number) => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  isDragging?: boolean;
}

const TaskCard = ({
  task,
  onTaskEdit,
  onTaskDelete,
  onTaskClick,
  formatDate,
  getStatusColor,
  getPriorityColor,
  isDragging = false,
}: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-pointer hover:shadow-md transition-shadow bg-card-bg hover:bg-hover-bg ${
        isDragging || isSortableDragging ? 'shadow-lg rotate-3' : ''
      }`}
      onClick={() => onTaskClick(task.id)}
    >
      <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2 flex-1 min-w-0">
            {task.name}
          </CardTitle>
          <div className="flex space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTaskEdit(task.id);
              }}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-30 group-hover:opacity-100 hover:bg-gray-100 transition-all"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTaskDelete(task.id);
              }}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-30 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge className={getPriorityColor(task.priority)} variant="outline">
              <span className="text-xs">{task.priority}</span>
            </Badge>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Progress value={task.progress} className="w-8 sm:w-12 h-1.5 sm:h-2" />
              <span className="text-xs text-gray-500 min-w-0">{task.progress}%</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-medium truncate">{task.assignee}</p>
            <p className="text-xs sm:text-xs">Due: {formatDate(task.endDate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;