import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TodoItem, StaffOption } from '@/store/slices/todoListSlice';

// Define the props for the dialog component
interface EditTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  todo: TodoItem | null;
  staffOptions: StaffOption[];
  onEdit: (id: number, updatedTodo: Partial<TodoItem>) => void;
}

const EditTodoDialog: React.FC<EditTodoDialogProps> = ({
  isOpen,
  onClose,
  todo,
  staffOptions,
  onEdit,
}) => {
  // Initialize form state with the data from the 'todo' prop
  const [formState, setFormState] = useState<Partial<TodoItem>>({});

  // Use useEffect to update the form state whenever the 'todo' prop changes
  useEffect(() => {
    if (todo) {
      setFormState({
        task_title: todo.task_title,
        description: todo.description,
        status: todo.status,
        task_type: todo.task_type,
        due_date: todo.due_date,
        assign_to_staff: todo.assign_to_staff,
      });
    }
  }, [todo]);


  console.log("due_date", formState)

  // Handle changes to form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Handle changes to select inputs
  const handleSelectChange = (id: string, value: string) => {
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Handle form submission
  const handleSave = () => {
    if (todo && todo.id) {
      // Call the onEdit function with the todo's ID and the form data
      onEdit(todo.id, formState);
      onClose();
    }
  };

  console.log("todo", todo)
  if (!todo) {
    return null; // Don't render if there's no todo item to edit
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Todo Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task_title" className="text-right">
              Task Title
            </Label>
            <Input
              id="task_title"
              value={formState.task_title || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formState.description || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor="task type" className='text-right'>
              Task Type
            </Label>
            <Input
              id="task_type"
              value={formState.task_type || ""}
              onChange={handleChange}
              className="col-span-3"
              readOnly
            />
          </div>

          {formState.task_type !== "Recurring" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due_date" className="text-right">
                Due Date
              </Label>
              <Input
                id="due_date"
                type="date"
                value={formState.due_date?.split('T')[0] || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          )}

          {/* Assign to Staff dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assign_to_staff" className="text-right">
              Assign to
            </Label>
            <Select
              onValueChange={(value) => handleSelectChange('assign_to_staff', value)}
              value={formState.assign_to_staff?.toString()}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffOptions.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id.toString()}>
                    {staff.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTodoDialog;