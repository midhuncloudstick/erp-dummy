import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { missionService, ImportantMission, MissionProgress } from '@/services/missionService';
import { Target } from "lucide-react"; // add this import
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { celebrate } from '@/lib/celebrate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Using ImportantMission from missionService instead of local interface

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

const MissionsFeed = () => {
  const [missions, setMissions] = useState<ImportantMission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get staff ID from localStorage
  const getUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  const staffId = getUserFromStorage();

  // Get current user info from localStorage
  const getCurrentUserInfo = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          id: user.id,
          full_name: user.full_name,
          email: user.email
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  useEffect(() => {
    if (staffId) {
      fetchMissions();
    } else {
      setLoading(false);
      toast({
        title: "Error",
        description: "User not authenticated. Please log in again.",
        variant: "destructive"
      });
    }
  }, [staffId]);

  const fetchMissions = async () => {
    if (!staffId) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await missionService.getImportantMissions(staffId);
      setMissions(response.response.data);
    } catch (error) {
      console.error('Failed to fetch missions:', error);
      toast({
        title: "Error",
        description: "Failed to load missions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const updateProgressMutation = useMutation({
    mutationFn: ({ missionId, progress }: { missionId: string; progress: MissionProgress }) =>
      missionService.updateImportantMissionProgress(staffId as number, missionId, progress),
  });
  const handleProgressUpdate = async (mission: ImportantMission) => {
    if (!staffId) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newProgress: MissionProgress = mission.progress === 'created' ? 'in_progress' : 'completed';
      
      console.log('Updating mission progress:', { staffId, missionId: mission.id, progress: newProgress });
      
      const response = await missionService.updateImportantMissionProgress(staffId, mission.id, newProgress);
      
      console.log('Progress update response:', response);
      
      // Get current user info for the "marked by" text
      const currentUser = getCurrentUserInfo();
      
      // Update local state with progress and staff info
      setMissions(prev => prev.map(m => 
        m.id === mission.id 
          ? { 
              ...m, 
              progress: newProgress,
              staff: currentUser ? {
                id: currentUser.id,
                full_name: currentUser.full_name,
                email: currentUser.email,
                profile_pic: '',
                company_id: 0,
                company_name: '',
                role_id: 0,
                role_name: '',
                department_id: 0,
                department_name: '',
                phone_number: '',
                address: '',
                is_active: true,
                join_date: '',
                created_at: '',
                updated_at: '',
                salary: '',
                employment_type: ''
              } : m.staff
            }
          : m
      ));
      
      toast({
        title: "Success",
        description: `Mission ${newProgress === 'in_progress' ? 'started' : 'completed'} successfully`,
      });

      if (newProgress === 'completed') {
        celebrate();
      }
    } catch (error: any) {
      console.error('Failed to update mission progress:', error);
      
      // More detailed error handling
      let errorMessage = "Failed to update mission progress";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
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
    <div className="mb-6 w-full" style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Important Missions</h2>
        <Badge variant="outline" className="text-xs">
          {missions.filter(m => m.progress === 'created').length} Created
        </Badge>
      </div>
      
      {/* Horizontal scrolling animation with absolute containment */}
      <div 
        className="relative" 
        style={{ 
          width: '100%',
          height: '280px',
          overflow: 'hidden',
          maxWidth: '100%'
        }}
      >
        <div 
          className="absolute top-0 left-0 flex gap-4 animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused]" 
          style={{ 
            width: 'max-content',
            height: '150%'
          }}
        >
          {/* Duplicate the missions array to create seamless infinite scroll */}
          {loading ? (
  <div className="flex items-center justify-center w-full h-64">
    <div className="text-muted-foreground">Loading missions...</div>
  </div>
) : (
  (() => {
    const activeMissions = missions.filter(mission => mission.progress !== "completed");

    if (activeMissions.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-64">
          <div className="text-muted-foreground">No Missions</div>
        </div>
      );
    }

    return activeMissions.map((mission) => (
      <Card
        key={mission.id}
        className="flex-shrink-0 w-80 h-52 hover:shadow-md transition-shadow"
      >
    <CardHeader className="pb-3 ">
  <div className="flex items-center justify-between">
    <Badge className={getPriorityColor(mission.priority)} variant="secondary">
      {mission.priority.toUpperCase()}
    </Badge>
    {getStatusIcon(mission.progress)}
  </div>
  <CardTitle className="text-lg">{mission.title}</CardTitle>

  {/* ✅ Tooltip for description */}
  <TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <CardDescription
        className="text-sm truncate w-full max-w-[220px] cursor-pointer"
        style={{ whiteSpace: "nowrap" }} // ✅ force single line
      >
        {mission.description}
      </CardDescription>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs break-words">
      {mission.description}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

</CardHeader>

        <CardContent className="pt-0 flex flex-col justify-between h-full">
          <div className="space-y-3 flex-1">
            <div className="space-y-2">
              {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Created by: {mission.created_by?.full_name || "N/A"}</span>
              </div> */}
              {/* {mission.staff && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Assigned to: {mission.staff.full_name}</span>
                </div>
              )} */}
              {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Created:{" "}
                  {mission.created_at
                    ? new Date(mission.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div> */}
              <div className="text-xs">
                <span className={`font-medium ${
                  mission.progress === 'created' ? 'text-muted-foreground' :
                  mission.progress === 'in_progress' ? 'text-green-600' :
                  mission.progress === 'completed' ? 'text-green-600' :
                  'text-muted-foreground'
                }`}>
                  Status: {mission.progress}
                </span>
                {mission.progress === 'in_progress' && mission.staff && (
                  <span className="ml-1 text-blue-600">
                    (marked by {mission.staff.full_name})
                  </span>
                )}
                {mission.progress === 'completed' && mission.staff && (
                  <span className="ml-1 text-green-600">
                    (completed by {mission.staff.full_name})
                  </span>
                )}
              </div>
            </div>
            <Button 
                    size="sm" 
                    className="w-full"
                    disabled={isButtonDisabled(mission.progress) || updateProgressMutation.isPending}
                    onClick={() => handleProgressUpdate(mission)}
                  >
                    {getButtonText(mission.progress)}
                  </Button>
          </div>

          {/* <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                toast({
                  title: "New Updates",
                  description: `Checking for updates on ${mission.title}`,
                });
              }}
            >
              New Updates
            </Button>
            <Button
              size="sm"
              className="flex-1"
              disabled={isButtonDisabled(mission.progress)}
              onClick={() => handleProgressUpdate(mission)}
            >
              {getButtonText(mission.progress)}
            </Button>
          </div> */}
        </CardContent>
    
      </Card>
    ));
  })()
)}

        </div>
      </div>

    </div>
  );
};

export default MissionsFeed;
