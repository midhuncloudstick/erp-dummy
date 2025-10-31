
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { CreateTaskRequest } from '@/services/taskService';
import { ApiEmployee } from '@/types/employee';

interface CustomField {
  field_name: string;
  field_type: 'text' | 'number' | 'date' | 'boolean';
  value: string;
}

interface CreateTaskDialogProps {
  onTaskCreate: (task: CreateTaskRequest) => void;
  employees: ApiEmployee[];
  buttonText?: string;
  dialogTitle?: string;
  isSubtask?: boolean;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ 
  onTaskCreate, 
  employees,
  buttonText = "Add Task",
  dialogTitle,
  isSubtask = false
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Todo' as CreateTaskRequest['status'],
    priority: 'Medium' as CreateTaskRequest['priority'],
    startDate: '',
    endDate: '',
    assignedHours: '',
    reportsToId: ''
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const statuses: CreateTaskRequest['status'][] = ['Todo', 'In Progress', 'Reviewed', 'Completed'];
  const priorities: CreateTaskRequest['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.reportsToId) {
      return;
    }

    const taskData: CreateTaskRequest = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      start_date: new Date(formData.startDate).toISOString(),
      end_date: new Date(formData.endDate).toISOString(),
      assigned_hours: parseFloat(formData.assignedHours) || 0,
      reports_to_id: parseInt(formData.reportsToId),
      custom_fields: customFields
    };

    onTaskCreate(taskData);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      startDate: '',
      endDate: '',
      assignedHours: '',
      reportsToId: ''
    });
    setCustomFields([]);
    
    setOpen(false);
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { field_name: '', field_type: 'text', value: '' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: keyof CustomField, value: string) => {
    setCustomFields(prev => prev.map((cf, i) => 
      i === index ? { ...cf, [field]: value } : cf
    ));
  };

  const defaultTitle = isSubtask ? "Create New Subtask" : "Create New Task";
  const hoursLabel = isSubtask ? "Assigned Hours" : "Assigned Hours";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle || defaultTitle}</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new {isSubtask ? 'subtask' : 'task'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={`${isSubtask ? 'Subtask' : 'Task'} Name`}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={`${isSubtask ? 'Subtask' : 'Task'} Description`}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" defaultValue={formData.status} />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={(value) => handleSelectChange('priority', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Priority" defaultValue={formData.priority} />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="assignedHours">{hoursLabel}</Label>
            <Input
              type="number"
              id="assignedHours"
              name="assignedHours"
              value={formData.assignedHours}
              onChange={handleInputChange}
              placeholder="0"
              step="0.5"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="reportsToId">Reports To *</Label>
            <Select onValueChange={(value) => handleSelectChange('reportsToId', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.full_name} - {employee.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Custom Fields</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>
            {customFields.map((field, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-3 border rounded">
                <div className="col-span-3">
                  <Input
                    placeholder="Field name"
                    value={field.field_name}
                    onChange={(e) => updateCustomField(index, 'field_name', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Select 
                    value={field.field_type} 
                    onValueChange={(value: 'text' | 'number' | 'date' | 'boolean') => 
                      updateCustomField(index, 'field_type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-5">
                  <Input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeCustomField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={!formData.name.trim() || !formData.reportsToId}>
            Create {isSubtask ? 'Subtask' : 'Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
