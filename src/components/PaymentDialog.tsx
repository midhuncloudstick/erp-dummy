
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Lock, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: string;
  totalAmount: number;
  onPaymentSuccess: () => void;
}

const PaymentDialog = ({ open, onOpenChange, paymentMethod, totalAmount, onPaymentSuccess }: PaymentDialogProps) => {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'generic';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Successful!",
        description: `Payment of $${totalAmount.toFixed(2)} processed successfully`,
      });
      onPaymentSuccess();
      onOpenChange(false);
      // Navigate to dashboard after successful payment
      navigate('/dashboard');
    }, 3000);
  };

  const cardType = getCardType(cardNumber);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Secure Payment - {paymentMethod === 'stripe' ? 'Credit Card' : 'PayPal'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Preview */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Card Preview</h3>
            <div className="relative">
              <div className={`w-full h-56 rounded-xl shadow-xl transform transition-all duration-300 ${
                cardType === 'visa' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                cardType === 'mastercard' ? 'bg-gradient-to-br from-red-600 to-red-800' :
                cardType === 'amex' ? 'bg-gradient-to-br from-green-600 to-green-800' :
                'bg-gradient-to-br from-gray-700 to-gray-900'
              } text-white p-6 flex flex-col justify-between relative overflow-hidden`}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/20"></div>
                  <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/20"></div>
                </div>
                
                {/* Card chip */}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg shadow-sm"></div>
                  <div className="text-right">
                    {cardType === 'visa' && <div className="text-xl font-bold">VISA</div>}
                    {cardType === 'mastercard' && <div className="text-xl font-bold">MasterCard</div>}
                    {cardType === 'amex' && <div className="text-xl font-bold">AMEX</div>}
                  </div>
                </div>

                {/* Card number */}
                <div className="text-center">
                  <div className="text-2xl font-mono tracking-wider">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                </div>

                {/* Cardholder info */}
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-gray-300 uppercase">Cardholder</div>
                    <div className="text-sm font-medium">
                      {cardholderName || 'YOUR NAME'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-300 uppercase">Expires</div>
                    <div className="text-sm font-mono">
                      {expiryDate || 'MM/YY'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Payment Details</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="text-lg font-mono"
                />
              </div>

              <div>
                <Label htmlFor="cardholderName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cardholder Name
                </Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expiry Date
                  </Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="font-mono"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold mb-4">
                <span>Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay $${totalAmount.toFixed(2)}`
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <Lock className="h-3 w-3 inline mr-1" />
              Your payment information is secure and encrypted
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
