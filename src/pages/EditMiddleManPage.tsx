
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMiddlemanById, updateMiddleman, clearCurrentMiddleman } from '@/store/slices/middlemanSlice';
import { CreateMiddlemanRequest } from '@/types/middleman';
import { toast } from 'sonner';

interface EditMiddleManForm {
  full_name: string;
  phone_number: string;
  email: string;
  address: string;
}

const EditMiddleManPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { middleManId } = useParams();
  
  const { currentMiddleman, loading, error, updatingMiddleman, updateMiddlemanError } = useAppSelector((state) => state.middlemen);
  
  const form = useForm<EditMiddleManForm>({
    defaultValues: {
      full_name: '',
      phone_number: '',
      email: '',
      address: ''
    }
  });

  useEffect(() => {
    if (middleManId) {
      console.log('Fetching middleman with ID:', middleManId);
      dispatch(fetchMiddlemanById(middleManId));
    }
    
    return () => {
      dispatch(clearCurrentMiddleman());
    };
  }, [dispatch, middleManId]);

  useEffect(() => {
    if (currentMiddleman) {
      console.log('Populating form with:', currentMiddleman);
      form.reset({
        full_name: currentMiddleman.full_name || '',
        phone_number: currentMiddleman.phone_number || '',
        email: currentMiddleman.email || '',
        address: currentMiddleman.address || ''
      });
    }
  }, [currentMiddleman, form]);

  const onSubmit = async (data: EditMiddleManForm) => {
  try{  if (middleManId) {
      const result = await dispatch(updateMiddleman({ id: middleManId, middlemanData: data }));
      // console.log(result.payload.message)
      toast.success(result.payload.message)
      if (updateMiddleman.fulfilled.match(result)) {
        navigate('/middleman');
      }}
    }
    catch(error:any){
     console.log("error in middleman",error)
      toast.error(error|| error?.message)
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading middle man data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={() => navigate('/middleman')} className="mt-4">
            Back to Middle Men
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/middleman')}
                className="text-white hover:bg-white/10 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Middle Men
              </Button>
              <img 
                src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" 
                alt="CloudHouse Technologies" 
                className="h-8 w-auto mr-3"
              />
              <h1 className="text-xl font-semibold text-white">Edit Middle Man</h1>
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
            {updateMiddlemanError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {updateMiddlemanError}
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter name" 
                          value={field.value || ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter phone number" 
                          value={field.value || ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter email" 
                          value={field.value || ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter address" 
                          value={field.value || ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/middleman')}
                    disabled={updatingMiddleman}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    disabled={updatingMiddleman}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatingMiddleman ? 'Updating...' : 'Update Middle Man'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditMiddleManPage;
