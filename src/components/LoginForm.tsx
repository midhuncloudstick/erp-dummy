import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, User, Building, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, register, clearError } from '@/store/slices/authSlice';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { authService } from '@/services/authService';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const registerSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  companyName: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const forgotSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;
type RegisterFormInputs = z.infer<typeof registerSchema>;
type ForgotFormInputs = z.infer<typeof forgotSchema>;

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginTypeModal, setShowLoginTypeModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<{ email: string; password: string } | null>(null);
  const [pendingForgotEmail, setPendingForgotEmail] = useState<string | null>(null);
  const [selectedLoginType, setSelectedLoginType] = useState<'customer' | 'admin'>('customer');
  
  const dispatch = useAppDispatch();
  const { loading, error, user, userType } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', companyName: '', email: '', password: '', confirmPassword: '' },
  });

  const forgotForm = useForm<ForgotFormInputs>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const openForgot = () => {
    setForgotOpen(true);
    const currentEmail = loginForm.getValues('email');
    forgotForm.reset({ email: currentEmail || '' });
  };

  const handleForgotSubmit = async (data: ForgotFormInputs) => {
    try {
      setForgotLoading(true);
      const res = await authService.forgotPassword(data.email);
      if (res && res.success) {
        toast({ description: 'Password reset link sent to your email' });
        setForgotOpen(false);
      } else {
        toast({
          title: 'Request Failed',
          description: (res as any)?.message || 'Unable to process request',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Something went wrong';
      
      // Check if it's the ambiguous email error
      if (errorMsg.includes('Email exists for both admin and customer. Please specify user_type.')) {
        setPendingForgotEmail(data.email);
        setForgotOpen(false);
        setShowLoginTypeModal(true);
      } else {
        toast({ title: 'Request Failed', description: errorMsg, variant: 'destructive' });
      }
    } finally {
      setForgotLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      // Check if it's the specific error about email existing in both accounts
      if (error.includes('Email exists in both customer and admin accounts')) {
        setShowLoginTypeModal(true);
        setPendingLoginData({
          email: loginForm.getValues('email'),
          password: loginForm.getValues('password')
        });
      } else {
        toast({
          title: isLogin ? 'Login Failed' : 'Registration Failed',
          description: error,
          variant: 'destructive',
        });
      }
      dispatch(clearError());
    }
  }, [error, dispatch, toast, isLogin, loginForm]);

  useEffect(() => {
    if (userType && user) {
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.full_name}!`,
      });
      navigate(userType === 'admin' ? '/admin' : '/dashboard');
    }
  }, [userType, user, navigate, toast]);

  const handleLoginSubmit = (data: LoginFormInputs) => {
    // First attempt without login_type
    dispatch(login({
      email: data.email,
      password: data.password,
      login_type: '' // Empty string to trigger the error
    }));
  };

  const handleLoginTypeSubmit = async () => {
    if (pendingLoginData) {
      // Second attempt with login_type for login
      dispatch(login({
        email: pendingLoginData.email,
        password: pendingLoginData.password,
        login_type: selectedLoginType
      }));
      setShowLoginTypeModal(false);
      setPendingLoginData(null);
    } else if (pendingForgotEmail) {
      // Retry forgot password with user_type
      try {
        setForgotLoading(true);
        const res = await authService.forgotPassword(pendingForgotEmail, selectedLoginType);
        if (res && res.success) {
          toast({ description: 'Password reset link sent to your email' });
          setShowLoginTypeModal(false);
          setPendingForgotEmail(null);
        } else {
          toast({
            title: 'Request Failed',
            description: (res as any)?.message || 'Unable to process request',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Something went wrong';
        toast({ title: 'Request Failed', description: msg, variant: 'destructive' });
      } finally {
        setForgotLoading(false);
      }
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormInputs) => {
    const result = await dispatch(register({
      full_name: data.fullName,
      company_name: data.companyName,
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
    }));

    if (register.fulfilled.match(result)) {
      toast({
        title: 'Account Created',
        description: 'Please log in to continue.',
      });
      setIsLogin(true);
      registerForm.reset();
    }
  };

  const { formState: { errors: loginErrors } } = loginForm;
  const { formState: { errors: registerErrors } } = registerForm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30 relative overflow-hidden">
      <header className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" alt="CloudHouse Technologies" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">CloudHouse Technologies</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Premium Solutions & Support</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex items-center justify-center p-4 py-12 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-3">
              {isLogin ? 'Welcome Back!' : 'Join Our Platform'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              {isLogin ? 'Access your projects and premium support' : 'Create your account and start your journey'}
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 p-6 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-2xl text-center font-bold text-gray-900 dark:text-white">
                {isLogin ? 'Sign In' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300 mt-2">
                {isLogin ? 'Enter your credentials to continue' : 'Fill in your details to get started'}
              </CardDescription>
            </div>

            <CardContent className="p-8 space-y-6">
              <form onSubmit={isLogin ? loginForm.handleSubmit(handleLoginSubmit) : registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-5">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input id="fullName" type="text" placeholder="Enter your full name" {...registerForm.register('fullName')} className="pl-12 h-12" />
                      </div>
                      {registerErrors.fullName && <p className="text-red-500 text-xs mt-1">{registerErrors.fullName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company</Label>
                      <div className="relative group">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input id="companyName" type="text" placeholder="Your company name (optional)" {...registerForm.register('companyName')} className="pl-12 h-12" />
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="email" type="email" placeholder="your@email.com" {...(isLogin ? loginForm.register('email') : registerForm.register('email'))} className="pl-12 h-12" />
                  </div>
                  {isLogin && loginErrors.email && <p className="text-red-500 text-xs mt-1">{loginErrors.email.message}</p>}
                  {!isLogin && registerErrors.email && <p className="text-red-500 text-xs mt-1">{registerErrors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder={isLogin ? 'Enter your password' : 'Create a strong password'} {...(isLogin ? loginForm.register('password') : registerForm.register('password'))} className="pl-12 pr-12 h-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {isLogin && loginErrors.password && <p className="text-red-500 text-xs mt-1">{loginErrors.password.message}</p>}
                  {!isLogin && registerErrors.password && <p className="text-red-500 text-xs mt-1">{registerErrors.password.message}</p>}
                </div>
                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" onClick={openForgot} className="text-sm text-blue-600 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" {...registerForm.register('confirmPassword')} className="pl-12 pr-12 h-12" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {registerErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{registerErrors.confirmPassword.message}</p>}
                  </div>
                )}
                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </Button>
              </form>
              <div className="text-center">
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">
                  {isLogin ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address to receive a password reset link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={forgotForm.handleSubmit(handleForgotSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input id="forgot-email" type="email" placeholder="your@email.com" {...forgotForm.register('email')} />
              {forgotForm.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{forgotForm.formState.errors.email.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setForgotOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={forgotLoading}>{forgotLoading ? 'Sending...' : 'Send reset link'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login Type Selection Modal */}
      {showLoginTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select Account Type
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This email exists in both customer and admin accounts. {pendingLoginData ? 'Please select which account you want to access.' : 'Please select which account you want to reset the password for.'}
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <RadioGroup value={selectedLoginType} onValueChange={(value: 'customer' | 'admin') => setSelectedLoginType(value)}>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <RadioGroupItem value="customer" id="modal-customer" />
                  <Label htmlFor="modal-customer" className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900 dark:text-white">Customer Account</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Access your projects and support</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <RadioGroupItem value="admin" id="modal-admin" />
                  <Label htmlFor="modal-admin" className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900 dark:text-white">Admin Account</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Manage system and users</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowLoginTypeModal(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleLoginTypeSubmit} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading || forgotLoading}
              >
                {loading ? 'Signing In...' : forgotLoading ? 'Sending...' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
