
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save } from 'lucide-react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createMiddleman } from '@/store/slices/middlemanSlice';
import { toast } from 'sonner';

interface CreateMiddleManForm {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
}

const CreateMiddleManPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { creatingMiddleman, createMiddlemanError } = useAppSelector((s) => s.middlemen);
  
  const form = useForm<CreateMiddleManForm>({
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      address: ''
    },
    mode: 'onBlur'
  });

  const onSubmit = async (data: CreateMiddleManForm) => {
    // Validate phone number format
    if (!/^[\d\s\-\+\(\)]+$/.test(data.phoneNumber) || data.phoneNumber.replace(/[\s\-\+\(\)]/g, '').length < 10) {
      form.setError('phoneNumber', { 
        type: 'manual', 
        message: 'Please enter a valid phone number (at least 10 digits)' 
      });
      return;
    }

   try{
     const payload = { 
      full_name: data.name, 
      phone_number: data.phoneNumber, // Keep as string
      email: data.email, 
      address: data.address 
    };
    const resultAction = await dispatch(createMiddleman(payload)).unwrap();
    console.log(resultAction)
   
    
      navigate('/middleman');
       toast.success("MiddleMan created successfully")
    
    
   }
   catch(error:any){
    console.log("error",error)
    toast.error(error)
   }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white">
        <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/leads')}
                  className="text-white hover:bg-white/10 mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Leads
                </Button>
                <img 
                  src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" 
                  alt="CloudHouse Technologies" 
                  className="h-8 w-auto mr-3"
                />
                <h1 className="text-xl font-semibold text-white">Create New Middle Man</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Middle Man Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    rules={{ 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[\d\s\-\+\(\)]+$/,
                        message: 'Please enter a valid phone number'
                      },
                      minLength: {
                        value: 10,
                        message: 'Phone number must be at least 10 digits'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    rules={{ required: 'Address is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter complete address" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6">
                   
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/middleman')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit"  disabled={creatingMiddleman} className="bg-orange-600 hover:bg-orange-700">
                      <Save className="h-4 w-4 mr-2" />
                      Create Middle Man
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default CreateMiddleManPage;
