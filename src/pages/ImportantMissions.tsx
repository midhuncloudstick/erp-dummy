import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { missionService, ImportantMission, MissionPriority, MissionProgress } from '@/services/missionService';

interface UiMission {
  id: string;
  title: string;
  description: string;
  priority: MissionPriority;
  progress: MissionProgress;
  status: 'in-progress' | 'completed';
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-destructive text-destructive-foreground';
    case 'medium': return 'bg-secondary text-secondary-foreground';
    case 'low': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getStatusIcon = (progress: MissionProgress) => {
  switch (progress) {
    case 'created': return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'in_progress': return <Clock className="h-4 w-4 text-primary" />;
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const mapToUiMission = (m: ImportantMission): UiMission => ({
  id: String(m.id),
  title: m.title,
  description: m.description,
  priority: m.priority,
  progress: m.progress,
  status: m.progress === 'completed' ? 'completed' : 'in-progress',
});

const ImportantMissionsPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const staffId: number | null = useMemo(() => {
    try {
      if (!storedUser) return null;
      const parsed = JSON.parse(storedUser);
      return typeof parsed?.id === 'number' ? parsed.id : null;
    } catch {
      return null;
    }
  }, [storedUser]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMission, setNewMission] = useState<{ title: string; description: string; priority: MissionPriority }>({
    title: '',
    description: '',
    priority: 'medium',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['important-missions', staffId],
    queryFn: () => missionService.getImportantMissions(staffId as number),
    enabled: !!staffId,
  });

  const missions: UiMission[] = useMemo(() => (data?.response.data ?? []).map(mapToUiMission), [data]);

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description: string; priority: MissionPriority }) =>
      missionService.createImportantMission(staffId as number, payload),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ missionId, progress }: { missionId: string; progress: MissionProgress }) =>
      missionService.updateImportantMissionProgress(staffId as number, missionId, progress),
  });

  const handleCreateMission = async () => {
    if (!newMission.title) {
      toast({ title: 'Missing Information', description: 'Title is required', variant: 'destructive' });
      return;
    }
    if (!staffId) {
      toast({ title: 'Not logged in', description: 'Please login again', variant: 'destructive' });
      return;
    }
    try {
      const res = await createMutation.mutateAsync({
        title: newMission.title,
        description: newMission.description,
        priority: newMission.priority,
      });
      await qc.invalidateQueries({ queryKey: ['important-missions', staffId] });
      setNewMission({ title: '', description: '', priority: 'medium' });
      setIsCreateDialogOpen(false);
      const message = (res as any)?.message || 'New important mission has been created';
      toast({ title: 'Mission Created', description: message });
    } catch (err: any) {
      const apiMsg: string | undefined = err?.response?.data?.message || err?.message;
      if (typeof apiMsg === 'string' && apiMsg.toLowerCase().includes('created')) {
        await qc.invalidateQueries({ queryKey: ['important-missions', staffId] });
        setNewMission({ title: '', description: '', priority: 'medium' });
        setIsCreateDialogOpen(false);
        toast({ title: 'Mission Created', description: apiMsg });
        return;
      }
      const message = apiMsg || 'Failed to create mission';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleProgressUpdate = async (mission: UiMission) => {
    if (!staffId) {
      toast({ title: 'Not logged in', description: 'Please login again', variant: 'destructive' });
      return;
    }

    try {
      const newProgress: MissionProgress = mission.progress === 'created' ? 'in_progress' : 'completed';
      
      await updateProgressMutation.mutateAsync({
        missionId: mission.id,
        progress: newProgress,
      });
      
      await qc.invalidateQueries({ queryKey: ['important-missions', staffId] });
      
      toast({
        title: "Success",
        description: `Mission ${newProgress === 'in_progress' ? 'started' : 'completed'} successfully`,
      });
    } catch (err: any) {
      const apiMsg: string | undefined = err?.response?.data?.message || err?.message;
      const message = apiMsg || 'Failed to update mission progress';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const getButtonText = (progress: MissionProgress) => {
    switch (progress) {
      case 'created': return 'Mark as In progress';
      case 'in_progress': return 'Mark as completed';
      case 'completed': return 'Completed';
      default: return 'Mark Complete';
    }
  };

  const isButtonDisabled = (progress: MissionProgress) => {
    return progress === 'completed';
  };

  return (
    <AdminLayout title="Important Missions" subtitle="Manage critical mission assignments">
      <div className="space-y-6 ml-6 mr-6 mt-8">
        <div className="flex items-start justify-between mb-12 gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold">Mission History</h1>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                Total: {missions.length}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Completed: {missions.filter(m => m.status === 'completed').length}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Active: {missions.filter(m => m.status !== 'completed').length}
              </Badge>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Create Mission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Mission</DialogTitle>
                <DialogDescription>
                  Add a new important mission to track critical tasks
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newMission.title}
                    onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Mission title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMission.description}
                    onChange={(e) => setNewMission(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mission description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newMission.priority} onValueChange={(value) => setNewMission(prev => ({ ...prev, priority: value as MissionPriority }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateMission} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Mission'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && (
          <div className="text-muted-foreground">Loading missions...</div>
        )}
        {isError && (
          <div className="text-destructive">Failed to load missions</div>
        )}

        {/* Active Missions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Missions</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {missions.filter(mission => mission.status !== 'completed').map((mission) => (
              <Card key={mission.id} className="relative h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getPriorityColor(mission.priority)} variant="secondary">
                      {mission.priority.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(mission.progress)}
                      <DeleteButton staffId={staffId} id={mission.id} onDone={() => qc.invalidateQueries({ queryKey: ['important-missions', staffId] })} />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{mission.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {mission.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={isButtonDisabled(mission.progress) || updateProgressMutation.isPending}
                    onClick={() => handleProgressUpdate(mission)}
                  >
                    {getButtonText(mission.progress)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Completed Missions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Completed Missions</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {missions.filter(mission => mission.status === 'completed').map((mission) => (
              <Card key={mission.id} className="relative h-fit opacity-80">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getPriorityColor(mission.priority)} variant="secondary">
                      {mission.priority.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(mission.progress)}
                      <DeleteButton staffId={staffId} id={mission.id} onDone={() => qc.invalidateQueries({ queryKey: ['important-missions', staffId] })} />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{mission.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {mission.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0" />
              </Card>
            ))}
          </div>
        </div>

        {!isLoading && missions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">No missions found</div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create your first mission
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ImportantMissionsPage;

function DeleteButton({ staffId, id, onDone }: { staffId: number | null; id: string | number; onDone: () => void }) {
  const { toast } = useToast();
  const deleteMutation = useMutation({
    mutationFn: () => missionService.deleteImportantMission(staffId as number, id),
  });

  const onDelete = async () => {
    if (!staffId) {
      toast({ title: 'Not logged in', description: 'Please login again', variant: 'destructive' });
      return;
    }
    try {
      await deleteMutation.mutateAsync();
      onDone();
      toast({ title: 'Mission Deleted', description: 'The mission has been removed' });
    } catch (err: any) {
      const apiMsg: string | undefined = err?.response?.data?.message || err?.message;
      const message = apiMsg || 'Failed to delete mission';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onDelete}
      className="text-destructive hover:text-destructive h-8 w-8 p-0"
      disabled={deleteMutation.isPending}
      title="Delete mission"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
