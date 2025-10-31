import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  User, 
  LogOut, 
  Calendar, 
  Upload,
  FileText,
  Mic,
  MicOff,
  Trash2
} from 'lucide-react';
import { ThemeProvider } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import LoginForm from '../components/LoginForm';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

interface SubtaskUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  files?: string[];
  audio?: string;
}

interface SubtaskDetails {
  id: string;
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  assignees: string[];
  reportsTo: string;
  updates: SubtaskUpdate[];
}

// Mock subtask data
const mockSubtask: SubtaskDetails = {
  id: 'ST001',
  name: 'Create User Tables',
  description: 'Design and implement user authentication tables with proper indexing',
  status: 'completed',
  progress: 100,
  priority: 'high',
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  assignees: ['John Smith'],
  reportsTo: 'Mike Wilson',
  updates: [
    {
      id: 'STU001',
      title: 'Table Structure Complete',
      description: 'Created users, roles, and permissions tables with proper relationships.',
      date: '2024-01-18T10:00:00Z',
      author: 'John Smith'
    }
  ]
};

const SubtaskDetailsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subtask, setSubtask] = useState<SubtaskDetails>(mockSubtask);
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { subtaskId } = useParams<{ subtaskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
  }, []);

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
    navigate(-1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) selected for upload`,
      });
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
      toast({
        title: "Recording started",
        description: "Audio recording is now active",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Audio recorded successfully",
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAddUpdate = () => {
    if (!newUpdate.title.trim() || !newUpdate.description.trim()) return;
    
    const update: SubtaskUpdate = {
      id: `STU${Date.now()}`,
      title: newUpdate.title,
      description: newUpdate.description,
      date: new Date().toISOString(),
      author: user?.name || 'Unknown',
      files: uploadedFiles.map(file => file.name),
      audio: audioBlob ? 'audio_recording.wav' : undefined
    };

    setSubtask({
      ...subtask,
      updates: [update, ...subtask.updates]
    });

    setNewUpdate({ title: '', description: '' });
    setUploadedFiles([]);
    setAudioBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Update added",
      description: "Subtask update has been posted successfully",
    });
  };

  const handleDeleteUpdate = (updateId: string) => {
    const updatedUpdates = subtask.updates.filter(update => update.id !== updateId);
    setSubtask({
      ...subtask,
      updates: updatedUpdates
    });
    
    toast({
      title: "Update deleted",
      description: "Subtask update has been removed",
    });
  };

  if (!user) {
    return (
      <ThemeProvider>
        <LoginForm onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button variant="ghost" onClick={handleBack} className="mr-3 text-purple-300 hover:bg-purple-900/30">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <img 
                  src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" 
                  alt="CloudHouse Technologies" 
                  className="h-8 w-auto mr-3"
                />
                <h1 className="text-xl font-semibold text-white">{subtask.name}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <div className="flex items-center">
                  <User className="h-4 w-4 text-purple-400 mr-2" />
                  <span className="text-sm font-medium text-white">{user.name}</span>
                </div>
                <Button variant="outline" onClick={handleLogout} className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Subtask Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {subtask.name}
                <Badge className={getStatusColor(subtask.status)}>
                  {subtask.status}
                </Badge>
              </CardTitle>
              <CardDescription>{subtask.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Priority</Label>
                  <Badge className={getPriorityColor(subtask.priority)}>
                    {subtask.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Progress</Label>
                  <div className="flex items-center space-x-2">
                    <Progress value={subtask.progress} className="w-20" />
                    <span className="text-sm">{subtask.progress}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(subtask.startDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">End Date</Label>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(subtask.endDate)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assignees</Label>
                  <div className="flex flex-wrap gap-2">
                    {subtask.assignees.map((assignee, index) => (
                      <Badge key={index} variant="outline">{assignee}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Reports To</Label>
                  <p>{subtask.reportsTo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subtask Updates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Subtask Update</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="update-title">Title</Label>
                  <Input
                    id="update-title"
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                    placeholder="Update title..."
                  />
                </div>
                <div>
                  <Label htmlFor="update-description">Description</Label>
                  <Textarea
                    id="update-description"
                    value={newUpdate.description}
                    onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                    placeholder="Describe the update..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Attach Files</Label>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files {uploadedFiles.length > 0 && `(${uploadedFiles.length} selected)`}
                  </Button>
                </div>
                <div>
                  <Label>Record Audio</Label>
                  <Button 
                    variant={isRecording ? "destructive" : "outline"} 
                    className="w-full"
                    onClick={toggleRecording}
                  >
                    {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    {isRecording ? "Stop Recording" : "Start Recording"}
                    {audioBlob && !isRecording && " (Recorded)"}
                  </Button>
                </div>
                <Button onClick={handleAddUpdate} className="w-full">
                  Post Update
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subtask Updates & History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {subtask.updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-blue-200 pl-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{update.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(update.date)}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteUpdate(update.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                      <p className="text-xs text-gray-500">By {update.author}</p>
                      {update.files && update.files.length > 0 && (
                        <div className="mt-2">
                          {update.files.map((file, index) => (
                            <Badge key={index} variant="outline" className="mr-1">
                              <FileText className="h-3 w-3 mr-1" />
                              {file}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {update.audio && (
                        <div className="mt-2">
                          <Badge variant="outline">
                            <Mic className="h-3 w-3 mr-1" />
                            Audio Recording
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default SubtaskDetailsPage;
