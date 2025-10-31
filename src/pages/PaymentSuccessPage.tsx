import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { paymentService } from '@/services/paymentService';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    console.log("PaymentSuccessPage useEffect triggered");
    const query = new URLSearchParams(location.search);
    const type = query.get("type");
    
    console.log("URL params:", location.search);
    console.log("Payment type:", type);

    if (!type) {
      console.log("No type found in URL");
      setVerificationStatus('failed');
      setMessage('Invalid payment return URL');
      setVerifying(false);
      return;
    }

    if (type === "subscription") {
      const subscription_id = query.get("subscription_id");
      console.log("Subscription ID:", subscription_id);
      
      if (!subscription_id) {
        console.log("Missing subscription ID");
        setVerificationStatus('failed');
        setMessage('Missing subscription ID');
        setVerifying(false);
        return;
      }

      // Single POST request for subscription verification
      setTimeout(async () => {
        console.log("Starting subscription verification for:", subscription_id);
        try {
          // Determine provider based on subscription_id format or URL params
          // PayPal subscription IDs typically start with 'I-' or 'B-', Stripe starts with 'sub_'
          const provider = subscription_id.startsWith('sub_') ? 'stripe' : 'paypal';
          const res = await paymentService.verifySubscription(subscription_id, provider);
          console.log("Subscription verification response:", res);
          
          const msg = (res as any)?.message || '';
          const ok = (res as any)?.success === true || /first\s+payment\s+completed/i.test(msg);
          if (ok) {
            console.log("Subscription verification successful");
            setVerificationStatus('success');
            setMessage('Payment Successful');
            toast.success("Payment verified successfully");
            setVerifying(false);
            setTimeout(() => navigate("/dashboard"), 2000);
          } else {
            console.log("Subscription verification failed - unexpected response");
            setVerificationStatus('failed');
            const raw: any = res;
            const exact = (raw && typeof raw === 'object' ? (raw.error || raw.message) : undefined) || (typeof raw === 'string' ? raw : JSON.stringify(raw));
            setMessage('Payment verification failed');
            toast.error(exact);
            setVerifying(false);
            setTimeout(() => navigate("/dashboard"), 3000);
          }
        } catch (err) {
          console.error("Subscription verify error:", err);
          setVerificationStatus('failed');
          setMessage('Payment verification failed');
          toast.error("Payment verification failed");
          setVerifying(false);
          setTimeout(() => navigate("/dashboard"), 3000);
        }
      }, 20_000); // 1 minute (60,000 ms)
    }

    if (type === "onetime") {
      const orderId = query.get("token"); // token = order_id for onetime
      console.log("Order ID (token):", orderId);
      
      if (!orderId) {
        console.log("Missing order ID");
        setVerificationStatus('failed');
        setMessage('Missing order ID');
        setVerifying(false);
        return;
      }

      // Single POST request for onetime verification
      (async () => {
        console.log("Starting onetime verification for:", orderId);
        try {
          const res = await paymentService.verifyOnetime(orderId);
          console.log("Onetime verification response:", res);
          
          if (res?.message === "Payment completed successfully") {
            console.log("Onetime verification successful");
            setVerificationStatus('success');
            setMessage('Payment Successful');
            toast.success("Payment verified successfully");
            setVerifying(false);
            setTimeout(() => navigate("/dashboard"), 2000);
          } else {
            console.log("Onetime verification failed - unexpected response");
            setVerificationStatus('failed');
            setMessage('Payment verification failed');
            toast.error("Payment verification failed");
            setVerifying(false);
            setTimeout(() => navigate("/dashboard"), 3000);
          }
        } catch (err) {
          console.error("Onetime verify error:", err);
          setVerificationStatus('failed');
          setMessage('Payment verification failed');
          toast.error("Payment verification failed");
          setVerifying(false);
          setTimeout(() => navigate("/dashboard"), 3000);
        }
      })();
    }
  }, [location.search, navigate]);

  const getStatusIcon = () => {
    if (verificationStatus === 'verifying') {
      return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
    } else if (verificationStatus === 'success') {
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    } else {
      return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (verificationStatus === 'verifying') return 'text-blue-600';
    if (verificationStatus === 'success') return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-2xl ${getStatusColor()}`}>
            {verificationStatus === 'verifying' && 'Verifying Payment'}
            {verificationStatus === 'success' && 'Payment Successful'}
            {verificationStatus === 'failed' && 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
          
          {verificationStatus === 'verifying' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Please wait while we verify your payment...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-green-600">
                Your payment has been successfully processed and verified.
              </p>
              <p className="text-xs text-gray-500">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {verificationStatus === 'failed' && (
            <div className="space-y-4">
              <p className="text-sm text-red-600">
                We encountered an issue verifying your payment.
              </p>
              <p className="text-xs text-gray-500">
                Please contact support if you believe this is an error.
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button 
              onClick={() => navigate("/dashboard")}
              variant={verificationStatus === 'failed' ? 'destructive' : 'default'}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;