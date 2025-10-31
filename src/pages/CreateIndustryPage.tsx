import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createIndustry } from '@/store/slices/industrySlice';
import { CreateIndustryRequest } from '@/types/industry';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

const createIndustrySchema = z.object({
  industry_name: z.string().min(1, { message: 'Industry name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
});

type CreateIndustryFormInputs = z.infer<typeof createIndustrySchema>;

const CreateIndustryPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.industries);

  const form = useForm<CreateIndustryFormInputs>({
    resolver: zodResolver(createIndustrySchema),
    defaultValues: {
      industry_name: '',
      description: '',
    },
  });

  const {
    formState: { errors },
  } = form;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreateIndustry = async (data: CreateIndustryFormInputs) => {
    const result = await dispatch(createIndustry(data));
    if (createIndustry.fulfilled.match(result)) {
      toast.success('Industry created successfully');
      navigate('/industry');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/industry')} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Industries
            </Button>
            <h1 className="text-xl font-semibold text-white">Create Industry</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Industry Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleCreateIndustry)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="industry_name">Industry Name</Label>
                <Input id="industry_name" {...form.register('industry_name')} />
                {errors.industry_name && <p className="text-red-500 text-xs mt-1">{errors.industry_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...form.register('description')} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Industry'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateIndustryPage;