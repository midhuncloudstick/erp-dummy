import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building, Tag, Package, Plus, Trash2, Clock, CheckSquare, Square, FileText, StickyNote, Upload, Save, X, DollarSign } from 'lucide-react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  date: string;
  description: string;
}

interface Note {
  id: string;
  content: string;
  timestamp: string;
}

interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
  createdAt: string;
}

interface Lead {
  id: string;
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  industry: string;
  location: string;
  product: string;
  status: 'active' | 'pending' | 'disqualified' | 'converted';
  dealCost?: number;
  notes?: string;
  attachments?: string[];
  reminders?: Reminder[];
}

const mockLeads: Lead[] = [
  {
    id: 'L001',
    companyName: 'TechCorp Solutions',
    contactPersonName: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    industry: 'Technology',
    location: 'San Francisco, CA',
    product: 'CRM System',
    status: 'active',
    dealCost: 75000,
    notes: 'Interested in enterprise-level CRM solution. Mentioned budget of $50K-$100K.',
    attachments: ['proposal_techcorp.pdf', 'pricing_sheet.xlsx'],
    reminders: [
      { id: 'R001', date: '2024-01-15', description: 'Follow up on proposal discussion' },
      { id: 'R002', date: '2024-01-20', description: 'Schedule demo with technical team' }
    ]
  },
  {
    id: 'L002',
    companyName: 'Green Energy Ltd',
    contactPersonName: 'Sarah Johnson',
    email: 'sarah@greenenergy.com',
    phone: '+1 (555) 987-6543',
    industry: 'Energy',
    location: 'Austin, TX',
    product: 'Website Development',
    status: 'pending'
  },
  {
    id: 'L003',
    companyName: 'Retail Plus',
    contactPersonName: 'Mike Davis',
    email: 'mike.davis@retailplus.com',
    phone: '+1 (555) 456-7890',
    industry: 'Retail',
    location: 'New York, NY',
    product: 'E-commerce Platform',
    status: 'converted'
  },
  {
    id: 'L004',
    companyName: 'HealthCare Pro',
    contactPersonName: 'Emily Wilson',
    email: 'emily@healthcarepro.com',
    phone: '+1 (555) 321-0987',
    industry: 'Healthcare',
    location: 'Chicago, IL',
    product: 'Management System',
    status: 'disqualified'
  }
];

const LeadDetailsPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [lead, setLead] = useState<Lead | undefined>(
    mockLeads.find(l => l.id === leadId)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | undefined>(lead);

  // Notes management
  const [notes, setNotes] = useState<Note[]>([
    { id: 'N001', content: 'Initial contact made via phone call', timestamp: '2024-01-10 09:30' },
    { id: 'N002', content: 'Sent proposal document via email', timestamp: '2024-01-12 14:15' }
  ]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');

  // Reminders management
  const [reminders, setReminders] = useState<Reminder[]>(lead?.reminders || []);
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');

  // Todo management
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: 'T001', task: 'Prepare technical presentation', completed: false, createdAt: '2024-01-10' },
    { id: 'T002', task: 'Research client requirements', completed: true, createdAt: '2024-01-09' }
  ]);
  const [newTodo, setNewTodo] = useState('');

  // File upload management
  const [attachments, setAttachments] = useState<string[]>(lead?.attachments || []);
  const [uploading, setUploading] = useState(false);

  if (!lead) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Lead Not Found</h1>
            <Button onClick={() => navigate('/leads')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      case 'disqualified':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: `N${Date.now()}`,
        content: newNote,
        timestamp: new Date().toLocaleString()
      };
      setNotes([note, ...notes]);
      setNewNote('');
      toast({ title: "Note added successfully" });
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast({ title: "Note deleted successfully" });
  };

  const startEditNote = (note: Note) => {
    setEditingNote(note.id);
    setEditNoteContent(note.content);
  };

  const saveEditNote = () => {
    if (editNoteContent.trim()) {
      setNotes(notes.map(note => 
        note.id === editingNote 
          ? { ...note, content: editNoteContent }
          : note
      ));
      setEditingNote(null);
      setEditNoteContent('');
      toast({ title: "Note updated successfully" });
    }
  };

  const addReminder = () => {
    if (newReminderDate && newReminderDescription.trim()) {
      const reminder: Reminder = {
        id: `R${Date.now()}`,
        date: newReminderDate,
        description: newReminderDescription
      };
      setReminders([...reminders, reminder]);
      setNewReminderDate('');
      setNewReminderDescription('');
      toast({ title: "Reminder added successfully" });
    }
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== reminderId));
    toast({ title: "Reminder deleted successfully" });
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: `T${Date.now()}`,
        task: newTodo,
        completed: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTodos([todo, ...todos]);
      setNewTodo('');
      toast({ title: "To-do item added successfully" });
    }
  };

  const toggleTodo = (todoId: string) => {
    setTodos(todos.map(todo => 
      todo.id === todoId 
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  const deleteTodo = (todoId: string) => {
    setTodos(todos.filter(todo => todo.id !== todoId));
    toast({ title: "To-do item deleted successfully" });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      // Simulate file upload (in real app, this would upload to server/cloud storage)
      const newFiles = Array.from(files).map(file => file.name);
      setAttachments([...attachments, ...newFiles]);
      toast({ title: `${files.length} file(s) uploaded successfully` });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (fileName: string) => {
    setAttachments(attachments.filter(file => file !== fileName));
    toast({ title: "File removed successfully" });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleEdit = () => {
    setEditedLead({ ...lead });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedLead) {
      setLead(editedLead);
      setIsEditing(false);
      toast({ title: "Lead updated successfully" });
    }
  };

  const handleCancel = () => {
    setEditedLead(lead);
    setIsEditing(false);
  };

  const updateEditedLead = (field: keyof Lead, value: any) => {
    if (editedLead) {
      setEditedLead({ ...editedLead, [field]: value });
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white">
        <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/leads')}
                  className="text-white hover:bg-white/10 mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Leads
                </Button>
                <img 
                  src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" 
                  alt="CloudHouse Technologies" 
                  className="h-8 w-auto mr-3"
                />
                <h1 className="text-xl font-semibold text-white">Lead Details - {lead.id}</h1>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="text-white border-white hover:bg-white hover:text-gray-900"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="text-white border-white hover:bg-white hover:text-gray-900"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Lead
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Deal Cost Highlight */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium">Deal Value</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedLead?.dealCost || ''}
                      onChange={(e) => updateEditedLead('dealCost', parseInt(e.target.value) || 0)}
                      className="text-3xl font-bold text-green-800 text-center w-48 mx-auto"
                      placeholder="Enter deal cost"
                    />
                  ) : (
                    <p className="text-3xl font-bold text-green-800">
                      ${lead.dealCost ? lead.dealCost.toLocaleString() : 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  {isEditing ? (
                    <Input
                      value={editedLead?.companyName || ''}
                      onChange={(e) => updateEditedLead('companyName', e.target.value)}
                    />
                  ) : (
                    <p className="text-lg font-semibold">{lead.companyName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Industry</label>
                  {isEditing ? (
                    <Input
                      value={editedLead?.industry || ''}
                      onChange={(e) => updateEditedLead('industry', e.target.value)}
                    />
                  ) : (
                    <p className="flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      {lead.industry}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  {isEditing ? (
                    <Input
                      value={editedLead?.location || ''}
                      onChange={(e) => updateEditedLead('location', e.target.value)}
                    />
                  ) : (
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {lead.location}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Interest</label>
                  {isEditing ? (
                    <Input
                      value={editedLead?.product || ''}
                      onChange={(e) => updateEditedLead('product', e.target.value)}
                    />
                  ) : (
                    <p className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      {lead.product}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  {isEditing ? (
                    <Input
                      value={editedLead?.contactPersonName || ''}
                      onChange={(e) => updateEditedLead('contactPersonName', e.target.value)}
                    />
                  ) : (
                    <p className="text-lg font-semibold">{lead.contactPersonName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedLead?.email || ''}
                      onChange={(e) => updateEditedLead('email', e.target.value)}
                    />
                  ) : (
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                        {lead.email}
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  {isEditing ? (
                    <Input
                      value={editedLead?.phone || ''}
                      onChange={(e) => updateEditedLead('phone', e.target.value)}
                    />
                  ) : (
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                        {lead.phone}
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  {isEditing ? (
                    <Select 
                      value={editedLead?.status} 
                      onValueChange={(value) => updateEditedLead('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="disqualified">Disqualified</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Lead Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Lead ID</p>
                  <p className="text-lg font-semibold">{lead.id}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="text-lg font-semibold">{lead.companyName}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="text-lg font-semibold">{lead.industry}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </Badge>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600">Deal Value</p>
                  <p className="text-lg font-semibold text-green-800">
                    ${lead.dealCost ? lead.dealCost.toLocaleString() : 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <StickyNote className="h-5 w-5 mr-2" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add New Note */}
              <div className="mb-6">
                <Textarea
                  placeholder="Add a new note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={addNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 bg-gray-50">
                    {editingNote === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={saveEditNote}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-800 mb-2">{note.content}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{note.timestamp}</span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => startEditNote(note)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteNote(note.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reminders Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add New Reminder */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="date"
                  value={newReminderDate}
                  onChange={(e) => setNewReminderDate(e.target.value)}
                  placeholder="Reminder date"
                />
                <Input
                  placeholder="Reminder description"
                  value={newReminderDescription}
                  onChange={(e) => setNewReminderDescription(e.target.value)}
                />
                <Button onClick={addReminder} disabled={!newReminderDate || !newReminderDescription.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reminder
                </Button>
              </div>

              {/* Reminders List */}
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(reminder.date).toLocaleDateString()}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {reminder.description}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => deleteReminder(reminder.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* To-Do List Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                To-Do List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add New Todo */}
              <div className="mb-6 flex space-x-2">
                <Input
                  placeholder="Add a to-do item..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                <Button onClick={addTodo} disabled={!newTodo.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Todo List */}
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <button onClick={() => toggleTodo(todo.id)}>
                      {todo.completed ? (
                        <CheckSquare className="h-5 w-5 text-green-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <span className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {todo.task}
                      </span>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(todo.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => deleteTodo(todo.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Attachments
                </div>
                <Button onClick={triggerFileUpload} disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              />
              
              <div>
                {attachments && attachments.length > 0 ? (
                  <ul className="space-y-2">
                    {attachments.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{file}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => removeAttachment(file)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">No attachments yet</p>
                    <Button onClick={triggerFileUpload} variant="outline" disabled={uploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload your first file'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default LeadDetailsPage;
