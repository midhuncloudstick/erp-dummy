
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CreateTicketDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    title: string; 
    description: string; 
    priority: string;
    category: string;
    subModule?: string;
  }) => void;
}

const modules = [
  { value: 'uptime-server', label: 'Uptime/Server Issues' },
  { value: 'ui', label: 'UI Issues' },
  { value: 'integrations', label: 'Integration Issues' },
  { value: 'general', label: 'General Support' }
];

const integrationSubModules = [
  { value: 'mapbox', label: 'Mapbox Integration' },
  { value: 'aws-s3', label: 'AWS S3 Integration' },
  { value: 'mail', label: 'Mail Service Issues' },
  { value: 'payment', label: 'Payment Gateway' },
  { value: 'api', label: 'API Integration' },
  { value: 'database', label: 'Database Connection' }
];

const CreateTicketDialog = ({ open, onClose, onSubmit }: CreateTicketDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) return;

    onSubmit({ 
      title: title.trim(), 
      description: description.trim(), 
      priority,
      category,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setCategory('');
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setCategory('');
    onClose();
  };

  const handleModuleChange = (value: string) => {
    setCategory(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Describe your issue or request. Our support team will respond as soon as possible.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief summary of your issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={handleModuleChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select the module affected" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((mod) => (
                  <SelectItem key={mod.value} value={mod.value}>
                    {mod.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* {category === 'integrations' && (
            <div className="space-y-2">
              <Label htmlFor="subModule">Integration Type</Label>
              <Select value={subModule} onValueChange={setSubModule} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select the integration" />
                </SelectTrigger>
                <SelectContent>
                  {integrationSubModules.map((subMod) => (
                    <SelectItem key={subMod.value} value={subMod.value}>
                      {subMod.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )} */}

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low - General inquiry</SelectItem>
                <SelectItem value="Medium">Medium - Standard issue</SelectItem>
                <SelectItem value="High">High - Important issue</SelectItem>
                {/* <SelectItem value="urgent">Urgent - Critical issue</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide a detailed description of your issue or request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !description.trim() || !category}
            >
              Create Ticket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;
