import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentFailedPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <Cloud 
              className="w-16 h-16 text-red-500 animate-bounce"
              style={{
                animationDuration: '1.5s',
                animationIterationCount: 'infinite'
              }}
            />
            <div 
              className="absolute inset-0 w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin"
              style={{
                animationDuration: '1s',
                animationIterationCount: 'infinite'
              }}
            />
          </div>
          <div className="text-lg font-medium text-gray-700 animate-pulse">
            Processing your payment...
          </div>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                  animationIterationCount: 'infinite'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="relative inline-block">
              <XCircle className="w-20 h-20 text-red-500 mx-auto" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-red-200 rounded-full animate-ping opacity-30" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            We were unable to process your payment. Please check your payment details and try again.
          </p>
          
          <div className="space-y-3 text-sm text-gray-500 mb-6">
            <div className="flex justify-between items-center">
              <span>Transaction ID:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <span className="text-red-600 font-medium">Failed</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Error Code:</span>
              <span className="font-mono bg-red-50 text-red-600 px-2 py-1 rounded">
                ERR-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleRetry} 
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              If the problem persists, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailedPage;
