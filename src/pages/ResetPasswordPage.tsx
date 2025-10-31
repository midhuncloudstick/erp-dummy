import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/authService';

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const email = searchParams.get('email');
  const userType = searchParams.get('user_type');

  const form = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!email) {
      toast({
        title: 'Invalid Link',
        description: 'Email parameter is missing from the reset link.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [email, navigate, toast]);

  const handleSubmit = async (data: ResetPasswordFormInputs) => {
    if (!email) return;

    try {
      setIsLoading(true);
      
      const response = await authService.resetPassword(
        email,
        data.password,
        data.confirmPassword,
        userType as 'customer' | 'admin' | undefined
      );

      if (response.success) {
        setIsSuccess(true);
        toast({
          title: 'Password Reset Successful',
          description: 'Your password has been updated successfully. You can now log in with your new password.',
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        toast({
          title: 'Reset Failed',
          description: response.message || 'Unable to reset password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Something went wrong';
      toast({
        title: 'Reset Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your password has been updated successfully. You will be redirected to the login page shortly.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-3">
            Reset Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your new password below
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              Create New Password
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {email && (
                <span>Resetting password for: <strong>{email}</strong></span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password *</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    {...form.register('password')}
                    className="pl-12 pr-12 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    {...form.register('confirmPassword')}
                    className="pl-12 pr-12 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-blue-600 hover:underline text-sm"
              >
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
