import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/EventServices';
import { Lock } from 'lucide-react';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type FormValues = z.infer<typeof schema>;

const NewEmployeeUpdatePasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const employeeIdParam = searchParams.get('employee_id');
  const token = searchParams.get('token');

  const employee_id = useMemo(() => {
    if (!employeeIdParam) return null;
    const n = Number(employeeIdParam);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [employeeIdParam]);

  const isLinkValid = !!employee_id && !!token;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm_password: '' },
    mode: 'onChange',
  });

  useEffect(() => {}, [employee_id, token]);

  const onSubmit = async (values: FormValues) => {
    if (!isLinkValid) {
      toast({ title: 'Invalid link', description: 'Employee ID or token missing.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await api.patchEvent('https://dev-api.cloudhousetechnologies.com/api/v1/employee/new_password', {
        employee_id,
        token,
        password: values.password,
        confirm_password: values.confirm_password,
      });
      toast({ title: 'Password updated', description: 'You can now log in with your new password.' });
      navigate('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update password. Please try again or request a new link.';
      toast({ title: 'Update failed', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 flex items-center justify-center p-4">
     
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome Back!</h1>
          <p className="text-sm text-muted-foreground">Access your projects and premium support</p>
        </div>

        <Card className="shadow-lg border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Set Your Password</CardTitle>
          </CardHeader>
          <CardContent>
            {!isLinkValid ? (
              <div className="space-y-4">
                <p className="text-sm text-destructive">Invalid or incomplete link. Please use the link from your email.</p>
                <div className="flex items-center justify-between">
                  <Button asChild variant="default">
                    <Link to="/login">Go to Login</Link>
                  </Button>
                  <Link to="/login" className="text-sm text-primary underline-offset-4 hover:underline">
                    Back to login
                  </Link>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Re-enter new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Set Password'}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link to="/login" className="text-primary underline-offset-4 hover:underline">Login</Link>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewEmployeeUpdatePasswordPage;
