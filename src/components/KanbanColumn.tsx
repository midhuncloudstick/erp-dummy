import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TaskCard from '@/components/TaskCard';

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

interface Column {
  id: Task['status'];
  title: string;
  color: string;
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onTaskEdit: (taskId: number) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskClick: (taskId: number) => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

const KanbanColumn = ({
  column,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskClick,
  formatDate,
  getStatusColor,
  getPriorityColor,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="w-full">
      <Card className={`h-full bg-card-bg ${column.color} ${isOver ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            {column.title}
            <Badge variant="secondary" className="ml-2">
              {tasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            ref={setNodeRef}
            className="min-h-[300px] sm:min-h-[400px] lg:min-h-[450px] max-h-[600px] overflow-y-auto space-y-2 sm:space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
          >
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskEdit={onTaskEdit}
                  onTaskDelete={onTaskDelete}
                  onTaskClick={onTaskClick}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </SortableContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanColumn;