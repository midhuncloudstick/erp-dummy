import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { paymentService, PayPalSubscriptionRequest } from '@/services/paymentService';

interface PayPalPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: PayPalSubscriptionRequest;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PayPalPaymentDialog = ({ 
  open, 
  onOpenChange, 
  paymentData, 
  onSuccess, 
  onError 
}: PayPalPaymentDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);

  const handleCreateSubscription = async () => {
    setIsProcessing(true);
    try {
      const response = await paymentService.createPayPalSubscription(paymentData);
      
      if (response.success && response.approval_url) {
        setApprovalUrl(response.approval_url);
        onSuccess?.();
      } else {
        throw new Error('Failed to create PayPal subscription');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
      onError?.(errorMessage);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedirectToPayPal = () => {
    if (approvalUrl) {
      window.location.href = approvalUrl;
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setApprovalUrl(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {approvalUrl ? 'Redirecting to PayPal' : 'PayPal Payment'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!approvalUrl ? (
            <>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.067 8.478c.492.315.844.825.844 1.478 0 .653-.352 1.163-.844 1.478-.492.315-1.174.478-1.956.478H5.889c-.782 0-1.464-.163-1.956-.478C3.441 11.641 3.089 11.131 3.089 10.478c0-.653.352-1.163.844-1.478.492-.315 1.174-.478 1.956-.478h12.222c.782 0 1.464.163 1.956.478z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Complete Your Payment</h3>
                <p className="text-sm text-gray-600">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Service:</span>
                  <span className="font-medium">{paymentData.service_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity:</span>
                  <span className="font-medium">{paymentData.quantity} server(s)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Type:</span>
                  <span className="font-medium capitalize">{paymentData.payment_type}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleCreateSubscription} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to PayPal'
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-800">Payment Session Created!</h3>
                <p className="text-sm text-gray-600">
                  You will now be redirected to PayPal to complete your payment.
                </p>
              </div>
              
              <Button 
                onClick={handleRedirectToPayPal}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue to PayPal
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                You will be redirected to PayPal's secure payment page.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayPalPaymentDialog;
