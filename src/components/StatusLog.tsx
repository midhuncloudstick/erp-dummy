import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { AppDispatch, RootState } from '@/store';
import { TodostatusLogg } from '@/store/slices/todoListSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertTriangle, ListTodo } from 'lucide-react';

interface StatusLogProps {
  todoId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Completed':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case 'Pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'Created':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          <ListTodo className="h-3 w-3 mr-1" />
          Created
        </Badge>
      );
    case 'Overdue':
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const StatusLog: React.FC<StatusLogProps> = ({ todoId, open, onOpenChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { statusLog, loading } = useSelector((state: RootState) => state.todoList);

  useEffect(() => {
    // Only fetch logs when the modal is opened
    if (open) {
      dispatch(TodostatusLogg());
    }
  }, [open, dispatch]);

  const todoLogs = statusLog.filter(log => log.todo_task_id === todoId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Status History</DialogTitle>
          <DialogDescription>
            A log of all status changes for this task.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : todoLogs.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No status history found for this task.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-4">
            {todoLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(log.status || '')}
                    <span className="text-sm font-medium text-gray-800">
                      by {log.employee.full_name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(log.changed_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StatusLog;