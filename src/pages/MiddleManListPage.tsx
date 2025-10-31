
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, UserPlus, Edit, Trash2, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteMiddleman, fetchMiddlemen } from '@/store/slices/middlemanSlice';
import { toast } from 'sonner';

const MiddleManListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { middlemen, loading, error } = useAppSelector((s) => s.middlemen);

  useEffect(() => {
    dispatch(fetchMiddlemen());
  }, [dispatch]);



  const handleEdit = (middleManId: number) => {
    navigate(`/middleman/edit/${middleManId}`);
  };

  // const handleDelete = (middleManId: number) => {
  //   if (window.confirm('Are you sure you want to delete this middle man?')) {
  //     // TODO: Implement delete functionality
  //     console.log('Delete middle man:', middleManId);
  //   }
  // };
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this Middleman?')) {
      const result = await dispatch(deleteMiddleman(id));
      if (deleteMiddleman.fulfilled.match(result)) {
        toast.success('Middleman deleted successfully');
      }
    }
  };
  const handleViewDetails = (middleManId: number) => {
    navigate(`/middleman/${middleManId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-xl font-semibold text-white">Middle Man Management</h1>
            </div>
            <Button
              onClick={() => navigate('/middleman/create')}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Middle Man
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-gray-900">
              <UserPlus className="h-6 w-6 mr-3 text-orange-600" />
              Middle Man List
            </CardTitle>
            <CardDescription>
              Manage all your middle men and their lead activities in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Active Leads</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {middlemen.map((middleMan) => (
                    <TableRow key={middleMan.id}>
                      <TableCell className="font-medium">{middleMan.full_name}</TableCell>
                      <TableCell>{middleMan.phone_number}</TableCell>
                      <TableCell>{middleMan.email}</TableCell>
                      <TableCell>{middleMan.address}</TableCell>
                      <TableCell>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {middleMan.leadsCount} leads
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(middleMan.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(middleMan.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(middleMan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MiddleManListPage;
