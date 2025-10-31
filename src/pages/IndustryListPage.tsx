import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchIndustries, deleteIndustry } from '@/store/slices/industrySlice';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const IndustryListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { industries, loading, error } = useAppSelector((state) => state.industries);

  useEffect(() => {
    dispatch(fetchIndustries());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this industry?')) {
      const result = await dispatch(deleteIndustry(id));
      if (deleteIndustry.fulfilled.match(result)) {
        toast.success('Industry deleted successfully');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold text-white">Industry List</h1>
            <Button onClick={() => navigate('/industry/create')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Industry
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Industries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ul className="space-y-4">
                {industries.map((industry) => (
                  <li key={industry.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold text-lg">{industry.industry_name}</h2>
                      <p className="text-gray-600">{industry.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/industry/edit/${industry.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(industry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default IndustryListPage;
