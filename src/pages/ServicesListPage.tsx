
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Edit, Trash2, Server, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchServices, toggleServiceStatus } from '@/store/slices/serviceSlice';
import { Service } from '@/types/service';

const ServicesListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { 
    services, 
    loading, 
    error, 
    togglingStatus, 
    toggleError 
  } = useAppSelector((state) => state.services);

  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Fetch services on component mount
  useEffect(() => {
    dispatch(fetchServices({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (toggleError) {
      toast.error(toggleError);
    }
  }, [toggleError]);

  const handleToggleStatus = async (id: number) => {
    const result = await dispatch(toggleServiceStatus(id));
    
    if (toggleServiceStatus.fulfilled.match(result)) {
      toast.success('Service status updated successfully');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      // TODO: Implement delete service functionality
      toast.info('Delete functionality will be implemented soon');
    }
  };

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const categoryName = service.category.category;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  // Helper function to format price
  const formatPrice = (service: Service) => {
    if (service.type === 'onetime' && service.one_time_cost) {
      return `$${parseFloat(service.one_time_cost).toLocaleString()}`;
    } else if (service.type === 'recurring') {
      if (service.monthly_cost) {
        return `$${parseFloat(service.monthly_cost).toLocaleString()}/month`;
      } else if (service.yearly_cost) {
        return `$${parseFloat(service.yearly_cost).toLocaleString()}/year`;
      }
    }
    return 'Price not set';
  };

  // Helper function to get billing type
  const getBillingType = (service: Service) => {
    if (service.type === 'onetime') {
      return 'one-time';
    } else if (service.type === 'recurring') {
      if (service.monthly_cost) {
        return 'monthly';
      } else if (service.yearly_cost) {
        return 'yearly';
      }
    }
    return 'recurring';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/admin')} className="text-white hover:bg-white/10 mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <Server className="h-6 w-6 text-white mr-2" />
                <h1 className="text-xl font-semibold text-white">Services Management</h1>
              </div>
            </div>
            <Button onClick={() => navigate('/services/create')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Service
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Services</h2>
          <p className="text-gray-600">Manage your service offerings and pricing by category</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading services...</span>
          </div>
        ) : (
          <>
            {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <div key={category} className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded mr-4"></div>
                  {category}
                  <Badge variant="outline" className="ml-3 bg-purple-50 text-purple-700 border-purple-200">
                    {categoryServices.length} services
                  </Badge>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryServices.map((service) => (
                    <Card key={service.id} className="group relative bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                      
                      <CardHeader className="pb-4 pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={service.status === 'active' ? "default" : "secondary"} 
                                   className={service.status === 'active'
                                     ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                     : "bg-gray-100 text-gray-600"}>
                              {service.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/services/edit/${service.id}`)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {/* <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(service.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button> */}
                            </div>
                          </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2">{service.name}</CardTitle>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-3xl font-bold text-purple-600">{formatPrice(service)}</span>
                          {service.type === 'recurring' && (
                            <span className="text-gray-500 text-sm">
                              per {getBillingType(service)}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Service Status</span>
                          <div className="flex items-center space-x-2">
                            {togglingStatus[service.id] && (
                              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                            )}
                            <Switch
                              checked={service.status === 'active'}
                              onCheckedChange={() => handleToggleStatus(service.id)}
                              disabled={togglingStatus[service.id]}
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3">Features included:</h4>
                          <ul className="space-y-2">
                            {service.features.map((item, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-600">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {services.length === 0 && !loading && (
              <Card className="text-center py-16 bg-white border-2 border-dashed border-gray-200">
                <CardContent>
                  <Server className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Services Found</h3>
                  <p className="text-gray-600 mb-6">Create your first service to get started.</p>
                  <Button onClick={() => navigate('/services/create')} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ServicesListPage;
