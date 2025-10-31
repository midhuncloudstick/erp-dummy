import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Calendar,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/services/EventServices';

// Helper function to clean and format dates
const formatCleanDate = (dateString: string, formatString: string) => {
  try {
    const cleanDate = dateString.replace(/[^\d-T:.Z]/g, '');
    return format(new Date(cleanDate), formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export default function ClearanceEmailReplyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');
  
  // Extract parameters from URL
  const clearanceId = searchParams.get('clearance_id');
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'approve' or 'reject'
  
  const isApprove = action === 'approve';
  const isReject = action === 'reject';

  useEffect(() => {
    if (!clearanceId || !token || (action !== 'approve' && action !== 'reject')) {
      toast.error('Invalid or expired link');
    }
    // No GET call needed; page is ready for immediate response submission
    setLoading(false);
  }, [clearanceId, token, action]);

  const handleSubmit = async () => {
    if (!responseText.trim()) {
      toast.error('Please provide a response');
      return;
    }

    if (!token || !clearanceId) {
      toast.error('Invalid request parameters');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        token: token,
        id: parseInt(clearanceId),
        action: isApprove, // true for approve, false for reject
        response: responseText.trim()
      };

      const response = await api.postEvents('/clearance/reply_email', payload);
      
      if (response.data.success) {
        toast.success(`Request ${isApprove ? 'approved' : 'rejected'} successfully`);
        setResponseText('');
        
        // Redirect to a success page or show success message
        setTimeout(() => {
          window.close(); // Close the tab/window
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to submit response');
      }
    } catch (error: any) {
      console.error('Error submitting response:', error);
      
      let errorMessage = `Failed to ${isApprove ? 'approve' : 'reject'} request`;
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading clearance request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.close()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Close
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Clearance Request Response</h1>
          <p className="text-gray-600 mt-1">
            {isApprove ? 'Approve' : 'Reject'} this clearance request
          </p>
        </div>

        {/* Note: We are not loading request details on this page to avoid unnecessary API calls */}

        {/* Response Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isApprove ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {isApprove ? 'Approve Request' : 'Reject Request'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {isApprove 
                ? 'Provide details about your approval decision.'
                : 'Please provide a detailed reason for rejecting this request.'
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="responseText">
                {isApprove ? 'Approval Message' : 'Rejection Reason'} *
              </Label>
              <Textarea
                id="responseText"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={
                  isApprove 
                    ? "Provide details about your approval..."
                    : "Please provide a detailed reason for rejecting this request..."
                }
                className="mt-2"
                rows={4}
              />
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                variant={isReject ? 'destructive' : 'default'}
                className="flex-1"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isApprove ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                {submitting ? 'Processing...' : (isApprove ? 'Approve Request' : 'Reject Request')}
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-md">
              <strong>Note:</strong> This link will expire in 24 hours. Please respond promptly.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
