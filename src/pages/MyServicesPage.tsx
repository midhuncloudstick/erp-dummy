import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Server, Eye, Bell, BellOff, User, Settings, LogOut, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { ClientSidebar } from '../components/ClientSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ThemeToggle from '../components/ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { serviceService } from '@/services/serviceService';
import { PurchasedService } from '@/types/service';
import paypalLogo from '@/assets/paypal.png';
import stripeLogo from '@/assets/stripe.png';

// Remove the User interface as we'll use the one from Redux store

const MyServicesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, userType, loading } = useAppSelector((state) => state.auth);
  const [services, setServices] = useState<PurchasedService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set());

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user && !loading) {
      navigate('/');
      return;
    }

    // If user is admin, redirect to admin dashboard
    if (user && userType === 'admin') {
      navigate('/admin');
      return;
    }
  }, [user, userType, loading, navigate]);

  // Fetch purchased services
  useEffect(() => {
    const fetchPurchasedServices = async () => {
      if (user && user.id) {
        try {
          setServicesLoading(true);
          setServicesError(null);
          const response = await serviceService.getPurchasedServices(user.id);
          if (response.success) {
            setServices(response.data);
          } else {
            setServicesError('Failed to fetch services');
          }
        } catch (error) {
          console.error('Error fetching purchased services:', error);
          setServicesError('Failed to fetch services');
        } finally {
          setServicesLoading(false);
        }
      }
    };

    fetchPurchasedServices();
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Show loading while checking authentication or fetching services
  if (loading || servicesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in or not a customer, show login form
  if (!user || (userType && userType !== 'customer')) {
    return (
      <div className="min-h-screen bg-content-bg">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your services.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'created':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleServiceClick = (serviceId: number) => {
    navigate(`/my-services/${serviceId}`);
  };


  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get billing cost display
  const getBillingCostDisplay = (service: PurchasedService): string => {
    if (service.billing_type === 'onetime') {
      return `$${service.billing_cost} (One-time)`;
    } else if (service.billing_type === 'monthly') {
      return `$${service.billing_cost}/month`;
    } else if (service.billing_type === 'yearly') {
      return `$${service.billing_cost}/year`;
    }
    return `$${service.billing_cost}`;
  };

  // Helper function to get payment logo
  const getPaymentLogo = (paymentType: string) => {
    switch (paymentType.toLowerCase()) {
      case 'paypal':
        return paypalLogo;
      case 'stripe':
        return stripeLogo;
      default:
        return null;
    }
  };

  // Helper function to toggle features expansion
  const toggleFeaturesExpansion = (serviceId: number) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedFeatures(newExpanded);
  };

  // Helper function to get display features
  const getDisplayFeatures = (service: PurchasedService) => {
    const features = service.service.features;
    const isExpanded = expandedFeatures.has(service.id);
    
    if (features.length <= 3) {
      return { features, showMore: false };
    }
    
    if (isExpanded) {
      return { features, showMore: true };
    }
    
    return { features: features.slice(0, 3), showMore: true };
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ClientSidebar user={user} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="h-6 w-px bg-border" />
                <h2 className="text-lg font-semibold text-foreground">My Services</h2>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
                </Button>
                
                <ThemeToggle />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{user.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">My Services</h2>
                <p className="text-muted-foreground">Manage your hosting and server services</p>
              </div>
              <Button 
                onClick={() => navigate('/purchase-services')}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Purchase New Service
              </Button>
            </div>

            {servicesError && (
              <Card className="text-center py-12 mb-6">
                <CardContent>
                  <Server className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-destructive">Error Loading Services</h3>
                  <p className="text-muted-foreground">{servicesError}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="mt-4"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const { features, showMore } = getDisplayFeatures(service);
                const isExpanded = expandedFeatures.has(service.id);
                const paymentLogo = getPaymentLogo(service.payment_type);
                
                return (
                  <Card 
                    key={service.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                    onClick={() => handleServiceClick(service.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg font-semibold">{service.service.name}</span>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Service Type */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Service Type:</span>
                          <span className="text-sm font-medium capitalize">{service.service.type}</span>
                        </div>
                        
                        {/* Payment Type with Logo */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Payment:</span>
                          <div className="flex items-center gap-2">
                            {paymentLogo && (
                              <img 
                                src={paymentLogo} 
                                alt={service.payment_type}
                                className="h-4 w-auto"
                              />
                            )}
                            {/* <span className="text-sm font-medium capitalize">{service.payment_type}</span> */}
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <span className="text-sm font-semibold text-primary">{getBillingCostDisplay(service)}</span>
                        </div>
                        
                        {/* Registration Date */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Registered:</span>
                          <span className="text-sm font-medium">{formatDate(service.registered_date)}</span>
                        </div>
                        
                        {/* Features */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Features:</span>
                            {/* <span className="text-xs text-muted-foreground">
                              {service.service.features.length} total
                            </span> */}
                          </div>
                          <div className="space-y-1">
                            {features.map((feature, index) => (
                              <div key={index} className="text-xs text-muted-foreground flex items-center">
                                <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                                {feature}
                              </div>
                            ))}
                            {showMore && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFeaturesExpansion(service.id);
                                }}
                                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3 w-3" />
                                    Show Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3" />
                                    See More ({service.service.features.length - 3} more)
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* View Details Button */}
                        <Button className="w-full mt-4" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {!servicesLoading && !servicesError && services.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Services Found</h3>
                  <p className="text-muted-foreground mb-4">You haven't purchased any services yet.</p>
                  <Button 
                    onClick={() => navigate('/purchase-services')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Purchase Your First Service
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MyServicesPage;
