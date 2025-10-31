import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AdminLayout } from '@/components/AdminLayout';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Paperclip,
  MessageCircle,
  Send,
  Plus,
  RefreshCw,
  Loader2,
  Download,
  Image,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { clearanceService, ClearanceDetailData, ClearanceRequest, ClearanceResponse } from '@/services/clearanceService';

// Helper function to clean and format dates
const formatCleanDate = (dateString: string, formatString: string) => {
  try {
    // Remove any extra characters that might be in the date string
    const cleanDate = dateString.replace(/[^\d-T:.Z]/g, '');
    return format(new Date(cleanDate), formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Helper function to download files
const downloadFile = (filePath: string, fileName: string) => {
  try {
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    link.target = '_blank'; // Open in new tab as fallback
    link.rel = 'noopener noreferrer'; // Security best practice
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Downloading ${fileName}...`);
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.error('Failed to download file');
  }
};

// Helper function to check if file is an image
const isImageFile = (fileType: string) => {
  return fileType.startsWith('image/');
};

// Helper function to get file icon
const getFileIcon = (fileType: string) => {
  if (isImageFile(fileType)) {
    return <Image className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

export default function ClearanceRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clearanceData, setClearanceData] = useState<ClearanceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseFiles, setResponseFiles] = useState<FileList | null>(null);
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [reRequestDescription, setReRequestDescription] = useState('');
  const [showReRequestForm, setShowReRequestForm] = useState(false);
  const [actedUponRequests, setActedUponRequests] = useState<Set<number>>(new Set());
  const [reRequestActionText, setReRequestActionText] = useState('');
  const [showReRequestActionForm, setShowReRequestActionForm] = useState(false);
  const [reRequestActionType, setReRequestActionType] = useState<'approve' | 'reject' | null>(null);
  const [reRequestActionId, setReRequestActionId] = useState<number | null>(null);

  // Get current user
  const savedUser = localStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    if (id) {
      loadClearanceDetail();
    }
  }, [id]);

  const loadClearanceDetail = async () => {
    try {
      setLoading(true);
      const data = await clearanceService.getClearanceDetail(id!);
      setClearanceData(data);
    } catch (error) {
      console.error('Error loading clearance detail:', error);
      toast.error('Failed to load clearance details');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (type: 'approve' | 'reject') => {
    setActionType(type);
    setShowActionForm(true);
  };

  const handleSubmitAction = async () => {
    if (!id || !responseText.trim()) {
      toast.error('Please provide a response');
      return;
    }

    try {
      setActionLoading(true);
      
      // Immediately mark the main request as acted upon to hide buttons
      if (clearanceData?.clearance?.clearance?.id) {
        setActedUponRequests(prev => new Set(prev).add(clearanceData?.clearance?.clearance?.id));
      }
      
      await clearanceService.submitClearanceResponse(id, {
        response: responseText,
        approve: actionType === 'approve'
      }, responseFiles);

      toast.success(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setResponseText('');
      setResponseFiles(null);
      setShowActionForm(false);
      setActionType(null);
      // Reload the data to show updated status and responses
      await loadClearanceDetail();
    } catch (error: any) {
      console.error('Error submitting response:', error);
      
      // Extract the specific error message from the backend response
      let errorMessage = 'Failed to submit response';
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Remove from acted upon set if there was an error
      if (clearanceData?.clearance?.clearance?.id) {
        setActedUponRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(clearanceData?.clearance?.clearance?.id);
          return newSet;
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponseFiles(e.target.files);
  };

  const handleReRequestActionClick = (reRequestId: number, action: 'approve' | 'reject') => {
    setReRequestActionId(reRequestId);
    setReRequestActionType(action);
    setShowReRequestActionForm(true);
    setReRequestActionText('');
  };

  const handleReRequestAction = async () => {
    if (!reRequestActionId || !reRequestActionText.trim()) {
      toast.error('Please provide a description for your response');
      return;
    }

    try {
      setActionLoading(true);
      
      // Immediately mark this request as acted upon to hide buttons
      setActedUponRequests(prev => new Set(prev).add(reRequestActionId));
      
      // Use the re-request ID instead of the main clearance ID
      await clearanceService.submitClearanceResponse(reRequestActionId.toString(), {
        response: reRequestActionText,
        approve: reRequestActionType === 'approve'
      });

      toast.success(`Re-request ${reRequestActionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      
      // Reset form state
      setReRequestActionText('');
      setShowReRequestActionForm(false);
      setReRequestActionType(null);
      setReRequestActionId(null);
      
      // Reload the data to show updated status
      await loadClearanceDetail();
    } catch (error: any) {
      console.error('Error submitting re-request response:', error);
      
      // Extract the specific error message from the backend response
      let errorMessage = `Failed to ${reRequestActionType} re-request`;
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Remove from acted upon set if there was an error
      if (reRequestActionId) {
        setActedUponRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(reRequestActionId);
          return newSet;
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReRequest = async () => {
    if (!id || !reRequestDescription.trim()) {
      toast.error('Please provide a description for the re-request');
      return;
    }

    try {
      setActionLoading(true);
      await clearanceService.createReRequest(id, {
        description: reRequestDescription
      });

      toast.success('Re-request submitted successfully');
      setReRequestDescription('');
      setShowReRequestForm(false);
      // Reload the data to show the new re-request
      await loadClearanceDetail();
    } catch (error: any) {
      console.error('Error creating re-request:', error);
      
      // Extract the specific error message from the backend response
      let errorMessage = 'Failed to submit re-request';
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Function to find the response for a specific clearance ID
  const getResponseForClearanceId = (clearanceId: number) => {
    return clearanceData?.responses.find(response => response.clearance_id === clearanceId);
  };

  // Check if current user can take actions (is the requester - the person who needs to approve/reject)
  const canTakeAction = clearanceData?.clearance?.clearance?.requester_id === currentUser?.id;
  
  // Check if the main request has been acted upon
  const mainRequestActedUpon = actedUponRequests.has(clearanceData?.clearance?.clearance?.id || 0);
  
  // Check if current user can re-request (only the creator can re-request, and status is rejected)
  const canReRequest = clearanceData?.clearance?.clearance?.created_by_id === currentUser?.id && 
                      clearanceData?.clearance?.clearance?.status?.toLowerCase() === 'rejected' &&
                      (clearanceData?.clearance?.rerequests?.length || 0) < 2;

  if (loading) {
    return (
      <AdminLayout title="Clearance Request" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!clearanceData) {
    return (
      <AdminLayout title="Clearance Request" subtitle="Request Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Request Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested clearance request could not be found.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const request = clearanceData?.clearance?.clearance;

  if (!request) {
    return (
      <AdminLayout title="Clearance Request" subtitle="Request Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Request Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested clearance request could not be found.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Clearance Request" subtitle="Request Details">
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-2">
            {getStatusIcon(request.status)}
            {request.status}
          </Badge>
        </div>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {request.request_title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Requested by {request.created_by.full_name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatCleanDate(request.created_at, 'MMM dd, yyyy \'at\' HH:mm')}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Description</Label>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {request.description}
              </p>
            </div>

            {request.files.length > 0 && (
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments
                </Label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <TooltipProvider>
                    {request.files.map((file, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div 
                            className="relative group cursor-pointer border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                            onClick={() => downloadFile(file.file_path, file.file_name)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {getFileIcon(file.file_type)}
                              <span className="text-sm font-medium truncate">{file.file_name}</span>
                            </div>
                            
                            {isImageFile(file.file_type) ? (
                              <div className="relative">
                                <img 
                                  src={file.file_path} 
                                  alt={file.file_name}
                                  className="w-full h-20 object-cover rounded border"
                                  onError={(e) => {
                                    // Fallback to icon if image fails to load
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                                <div className="hidden w-full h-20 bg-gray-100 rounded border items-center justify-center">
                                  <Image className="h-6 w-6 text-gray-400" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                                <File className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span>{file.file_size}</span>
                              <Download className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                    </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download {file.file_name}</p>
                        </TooltipContent>
                      </Tooltip>
                  ))}
                  </TooltipProvider>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Re-requests History */}
        {clearanceData?.clearance?.rerequests?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Re-requests History ({clearanceData?.clearance?.rerequests?.length || 0}/2)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clearanceData?.clearance?.rerequests?.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((reRequest, index) => {
                const totalRequests = clearanceData?.clearance?.rerequests?.length || 0;
                const attemptNumber = totalRequests - index;
                return (
                <div key={reRequest.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(reRequest.status)} className="flex items-center gap-1">
                        {getStatusIcon(reRequest.status)}
                        {reRequest.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Attempt #{attemptNumber}
                      </span>
                </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatCleanDate(reRequest.created_at, 'MMM dd, yyyy \'at\' HH:mm')}
                </div>
              </div>
                  <div className="space-y-2">
                    <div className='flex items-center gap-2'>
                      <Label className="text-xs font-medium text-muted-foreground">Request Description:</Label>
                      <p className="text-sm text-muted-foreground">{reRequest.description}</p>
                    </div>
                    
                    {/* Show rejection reason if this re-request was rejected */}
                    {reRequest.status.toLowerCase() === 'rejected' && (() => {
                      const response = getResponseForClearanceId(reRequest.id);
                      return response && !response.approve ? (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                          <Label className="text-xs font-medium text-red-700">Rejection Reason:</Label>
                          <p className="text-sm text-red-600 mt-1">{response.response}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-500">by {response.employee.full_name}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                    
                    {/* Show approval reason if this re-request was approved */}
                    {reRequest.status.toLowerCase() === 'approved' && (() => {
                      const response = getResponseForClearanceId(reRequest.id);
                      return response && response.approve ? (
                        <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                          <Label className="text-xs font-medium text-green-700">Approval Message:</Label>
                          <p className="text-sm text-green-600 mt-1">{response.response}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-500">by {response.employee.full_name}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
              </div>
              
                  {/* Action buttons for pending re-requests - only for the requester (approver) on the latest pending re-request */}
                  {reRequest.status.toLowerCase() === 'pending' && 
                   clearanceData?.clearance.clearance.requester_id === currentUser?.id &&
                   index === 0 &&
                   !actedUponRequests.has(reRequest.id) && (
                    <div className="mt-3 pt-3 border-t">
                      {!showReRequestActionForm || reRequestActionId !== reRequest.id ? (
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleReRequestActionClick(reRequest.id, 'approve')}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="mr-2 h-3 w-3" />
                            Approve
                          </Button>
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReRequestActionClick(reRequest.id, 'reject')}
                            disabled={actionLoading}
                          >
                            <XCircle className="mr-2 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                <div>
                            <Label htmlFor="reRequestActionText">
                              {reRequestActionType === 'approve' ? 'Approval Message' : 'Rejection Reason'} *
                  </Label>
                            <Textarea
                              id="reRequestActionText"
                              value={reRequestActionText}
                              onChange={(e) => setReRequestActionText(e.target.value)}
                              placeholder={
                                reRequestActionType === 'approve' 
                                  ? "Provide details about your approval..."
                                  : "Please provide a detailed reason for rejecting this re-request..."
                              }
                              className="mt-2"
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={handleReRequestAction}
                              disabled={actionLoading}
                              variant={reRequestActionType === 'reject' ? 'destructive' : 'default'}
                            >
                              {actionLoading ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="mr-2 h-3 w-3" />
                              )}
                              {reRequestActionType === 'approve' ? 'Approve' : 'Reject'}
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline" 
                              onClick={() => {
                                setShowReRequestActionForm(false);
                                setReRequestActionText('');
                                setReRequestActionType(null);
                                setReRequestActionId(null);
                              }}
                              disabled={actionLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })}
            </CardContent>
          </Card>
        )}

        {/* Initial Clearance Request Card */}
        {(() => {
          const response = getResponseForClearanceId(request.id);
          
          // Only show the card if there's a response for the main clearance request
          if (!response) return null;
          
          const actualStatus = response.approve ? 'Approved' : 'Rejected';
          
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Initial Clearance Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(actualStatus)} className="flex items-center gap-1">
                        {getStatusIcon(actualStatus)}
                        {actualStatus}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Initial Request
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatCleanDate(request.created_at, 'MMM dd, yyyy \'at\' HH:mm')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className='flex items-center gap-2'>
                      <Label className="text-xs font-medium text-muted-foreground">Request Description:</Label>
                      <p className="text-sm mb-1 text-muted-foreground">{request.description}</p>
                    </div>
                    
                    {/* Show response if there is one */}
                    {response && (
                      <div className={`p-2 border rounded-md ${
                        response.approve 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <Label className={`text-xs font-medium ${
                          response.approve ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {response.approve ? 'Approval Message:' : 'Rejection Reason:'}
                        </Label>
                        <p className={`text-sm mt-1 ${
                          response.approve ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {response.response}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <User className={`h-3 w-3 ${
                            response.approve ? 'text-green-500' : 'text-red-500'
                          }`} />
                          <span className={`text-xs ${
                            response.approve ? 'text-green-500' : 'text-red-500'
                          }`}>
                            by {response.employee.full_name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Responses Section - Chat-like interface */}
        {/* {clearanceData.responses && clearanceData.responses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversation ({clearanceData.responses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clearanceData.responses.slice().reverse().map((response, index) => (
                <div key={response.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{response.employee.full_name}</p>
                        <p className="text-xs text-muted-foreground">{response.employee.role_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {response.approve ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </Badge>
                      )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                        {format(new Date(response.created_at), 'MMM dd, yyyy at HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm leading-relaxed">{response.response}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )} */}

        {/* Action Buttons - Approve/Reject (Only for requester/approver when pending and not acted upon) */}
        {canTakeAction && request.status.toLowerCase() === 'pending' && !mainRequestActedUpon && (
        <Card>
          <CardHeader>
              <CardTitle>Take Action</CardTitle>
              <p className="text-sm text-muted-foreground">
                As the approver, you can approve or reject this clearance request.
              </p>
            </CardHeader>
            <CardContent>
              {!showActionForm ? (
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleActionClick('approve')} 
                    className="flex-1"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Approve Request
                </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleActionClick('reject')}
                    className="flex-1"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reject Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
              <div>
                    <Label htmlFor="responseText">
                      {actionType === 'approve' ? 'Approval Message' : 'Rejection Reason'} *
                    </Label>
                <Textarea
                      id="responseText"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder={
                        actionType === 'approve' 
                          ? "Provide details about your approval..."
                          : "Please provide a detailed reason for rejecting this request..."
                      }
                  className="mt-2"
                  rows={4}
                />
              </div>
              <div>
                    <Label htmlFor="responseFiles">Attachments (optional)</Label>
                <Input
                      id="responseFiles"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mt-2"
                />
                    {responseFiles && responseFiles.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                        {responseFiles.length} file(s) selected
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                    <Button 
                      onClick={handleSubmitAction} 
                      disabled={actionLoading}
                      variant={actionType === 'reject' ? 'destructive' : 'default'}
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      {actionLoading ? 'Processing...' : (actionType === 'approve' ? 'Approve Request' : 'Reject Request')}
                    </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                        setShowActionForm(false);
                        setResponseText('');
                        setResponseFiles(null);
                        setActionType(null);
                      }}
                      disabled={actionLoading}
                >
                  Cancel
                </Button>
              </div>
                </div>
              )}
            </CardContent>
          </Card>
          )}

        {/* Re-request Section (For requester or creator when rejected and under 3 attempts) */}
        {canReRequest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Request Again
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showReRequestForm ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This clearance request was rejected. You can request again with additional details or clarifications.
                    ({clearanceData?.clearance?.rerequests?.length || 0}/2 attempts used)
                  </p>
                  <Button onClick={() => setShowReRequestForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Re-request
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reRequestDescription">Additional Details *</Label>
                    <Textarea
                      id="reRequestDescription"
                      value={reRequestDescription}
                      onChange={(e) => setReRequestDescription(e.target.value)}
                      placeholder="Provide additional details or clarifications for your request..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleReRequest} 
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Submit Re-request
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowReRequestForm(false);
                        setReRequestDescription('');
                      }}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
