import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CreateClearanceRequestDialogProps {
  onRequestCreated: () => void;
}

export default function CreateClearanceRequestDialog({ onRequestCreated }: CreateClearanceRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Sample requester names - in a real app, this would come from an API
  const requesterOptions = [
    'John Smith',
    'Sarah Johnson',
    'Michael Brown',
    'Emily Davis',
    'Robert Wilson',
    'Lisa Anderson',
    'David Miller',
    'Jennifer Taylor'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !requesterName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Generate numerical ID
    const existingRequests = JSON.parse(localStorage.getItem('clearanceRequests') || '[]');
    const maxId = existingRequests.length > 0 
      ? Math.max(...existingRequests.map((req: any) => parseInt(req.id) || 0))
      : 1000;
    const newId = (maxId + 1).toString();

    // Here you would typically save to your backend
    // For now, we'll just simulate success
    const newRequest = {
      id: newId,
      title,
      description,
      requesterName,
      attachments: attachments.map(file => file.name),
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: 'Current User', // Would come from auth
    };

    // Save to localStorage for demo purposes
    existingRequests.push(newRequest);
    localStorage.setItem('clearanceRequests', JSON.stringify(existingRequests));

    toast.success('Clearance request submitted successfully');
    setTitle('');
    setDescription('');
    setRequesterName('');
    setAttachments([]);
    setOpen(false);
    onRequestCreated();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Clearance Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Clearance Request</DialogTitle>
          <DialogDescription>
            Submit a new clearance request for approval.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter request title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requester">Requester Name *</Label>
              <Select value={requesterName} onValueChange={setRequesterName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select requester" />
                </SelectTrigger>
                <SelectContent>
                  {requesterOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your clearance request in detail"
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attachments">Attachments</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachments"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {attachments.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected files: {attachments.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}