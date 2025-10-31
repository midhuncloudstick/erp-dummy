
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProduct } from '@/store/slices/productSlice';
import { toast } from 'sonner';

interface CreateProductForm {
  name: string;
  description: string;
}

const CreateProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { creatingProduct, createProductError } = useAppSelector((s) => s.products);

  const form = useForm<CreateProductForm>({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const onSubmit = async (data: CreateProductForm) => {
    try {
      const payload = { product_name: data.name, description: data.description };
      const resultAction = await dispatch(createProduct(payload)).unwrap();
      console.log(resultAction)
      toast.success("Product created successfully")
      navigate('/product');
    }
    catch (error: any) {
      toast.error(error)
    }

  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/product')}
                className="text-white hover:bg-white/10 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
              <img
                src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png"
                alt="CloudHouse Technologies"
                className="h-8 w-auto mr-3"
              />
              <h1 className="text-xl font-semibold text-white">Create New Product</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          className="min-h-[100px]"
                          {...field}
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
                    onClick={() => navigate('/product')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingProduct} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    <Save className="h-4 w-4 mr-2" />
                    {creatingProduct ? 'Creating...' : 'Create Product'}
                  </Button>
                </div>
                {createProductError && (
                  <p className="text-sm text-red-600">{createProductError}</p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateProductPage;
