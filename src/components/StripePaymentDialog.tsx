import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { paymentService, PayPalSubscriptionRequest } from '@/services/paymentService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const publishableKey: string = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || localStorage.getItem('stripe_pk') || '';
const stripePromise: Promise<Stripe | null> | null = publishableKey ? loadStripe(publishableKey) : null;

interface InnerProps {
  onClose: () => void;
  payload: Omit<PayPalSubscriptionRequest, 'provider'> & { provider: 'stripe' };
}

function StripeInner({ onClose, payload }: InnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setError(null);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Card element not found');

      const pmResult = await stripe.createPaymentMethod({ type: 'card', card });
      if (pmResult.error || !pmResult.paymentMethod) {
        throw new Error(pmResult.error?.message || 'Unable to create payment method');
      }

      const backendRes = await paymentService.createStripeSubscription({
        ...payload,
        provider: 'stripe',
        payment_method_id: pmResult.paymentMethod.id,
      });

      if (backendRes.client_secret) {
        const confirm = await stripe.confirmCardPayment(backendRes.client_secret);
        if (confirm.error) {
          throw new Error(confirm.error.message);
        }
      }

      if ((backendRes as any).redirectUrl) {
        window.location.href = (backendRes as any).redirectUrl as string;
        return;
      }

      // Handle successful payment - verify if needed
      if (backendRes.success && backendRes.message) {
        if (payload.payment_type === 'recurring') {
          // For recurring payments, extract subscription ID and verify
          const subscriptionId = paymentService.extractStripeSubscriptionId(backendRes.message);
          if (subscriptionId) {
            try {
              const res = await paymentService.verifySubscription(subscriptionId, 'stripe');
              if (res?.success) {
                toast({ title: 'Payment Verified', description: 'Subscription verified successfully', className: 'bg-green-600 text-white border-green-600' });
              } else {
                const raw = (res as any);
                const exact = (raw && typeof raw === 'object' ? (raw.error || raw.message) : undefined) || (typeof raw === 'string' ? raw : JSON.stringify(raw));
                toast({ title: 'Verification Failed', description: exact, variant: 'destructive' });
              }
            } catch (verifyError: any) {
              console.error('Error verifying Stripe subscription:', verifyError);
              const raw = verifyError?.response?.data || verifyError?.message || 'Verification failed';
              const exact = (raw && typeof raw === 'object' ? (raw.error || raw.message) : undefined) || (typeof raw === 'string' ? raw : JSON.stringify(raw));
              toast({ title: 'Verification Error', description: exact, variant: 'destructive' });
            }
          }
        } else {
          // For one-time payments, extract order ID and verify
          const orderIdMatch = backendRes.message.match(/Order ID:\s*([^\s]+)/);
          const orderId = orderIdMatch ? orderIdMatch[1] : null;
          
          if (orderId) {
            try {
              const res = await paymentService.verifyOnetime(orderId);
              if (res?.success) {
                toast({ title: 'Payment Verified', description: 'One-time payment verified successfully', className: 'bg-green-600 text-white border-green-600' });
              } else {
                const raw = (res as any);
                const exact = (raw && typeof raw === 'object' ? (raw.error || raw.message) : undefined) || (typeof raw === 'string' ? raw : JSON.stringify(raw));
                toast({ title: 'Verification Failed', description: exact, variant: 'destructive' });
              }
            } catch (verifyError: any) {
              console.error('Error verifying one-time payment:', verifyError);
              const raw = verifyError?.response?.data || verifyError?.message || 'Verification failed';
              const exact = (raw && typeof raw === 'object' ? (raw.error || raw.message) : undefined) || (typeof raw === 'string' ? raw : JSON.stringify(raw));
              toast({ title: 'Verification Error', description: exact, variant: 'destructive' });
            }
          } else {
            // If backend indicates success but no order id was found, still inform the user
            if (backendRes?.success) {
              const msg = backendRes?.message || 'One-time payment initiated successfully';
              toast({ title: 'Payment Successful', description: msg, className: 'bg-green-600 text-white border-green-600' });
            } else {
              const msg = backendRes?.message || 'Failed to initiate one-time payment';
              toast({ title: 'Payment Failed', description: msg, variant: 'destructive' });
            }
          }
        }
      }

      // ✅ Navigate after successful payment with delay to prevent Element unmounting
      setTimeout(() => {
        navigate('/dashboard');
        onClose();
      }, 1000);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Payment failed';
      setError(msg);
      toast({ title: 'Payment Failed', description: msg, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 border rounded-md">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handlePay} disabled={isProcessing || !stripe} className="w-full">
        {isProcessing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>) : 'Pay with Stripe'}
      </Button>
      <Button variant="outline" onClick={onClose} disabled={isProcessing} className="w-full">Cancel</Button>
    </div>
  );
}

interface StripePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: Omit<PayPalSubscriptionRequest, 'provider'> & { provider: 'stripe' };
}

const StripePaymentDialog = ({ open, onOpenChange, payload }: StripePaymentDialogProps) => {
  const handleClose = (next: boolean) => {
    if (!next) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="stripe-desc">
        <DialogHeader>
          <DialogTitle className="text-center">Stripe Payment</DialogTitle>
        </DialogHeader>
        <p id="stripe-desc" className="sr-only">Enter your card details to complete payment with Stripe.</p>
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <StripeInner onClose={() => onOpenChange(false)} payload={payload} />
          </Elements>
        ) : (
          <div className="space-y-3 text-sm">
            <p className="text-red-600">Stripe publishable key is missing.</p>
            <p>Add VITE_STRIPE_PUBLISHABLE_KEY to your .env and restart, or set it temporarily:</p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">localStorage.setItem('stripe_pk', 'pk_test_...')</pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentDialog;