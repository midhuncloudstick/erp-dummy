import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Server, Edit, Save, X, Eye, EyeOff, User, Settings, LogOut, Bell, TrendingUp, Trash2, ChevronDown, FileText, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { serviceService } from '@/services/serviceService';
import { PurchasedService, Credential } from '@/types/service';
import { ClientSidebar } from '@/components/ClientSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import paypalLogo from '@/assets/paypal.png';
import stripeLogo from '@/assets/stripe.png';

const ServiceDetailPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user, userType, loading } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const [service, setService] = useState<PurchasedService | null>(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCredentials, setEditingCredentials] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverMonitoring, setServerMonitoring] = useState(true);
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});

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

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (user && user.id && serviceId) {
        try {
          setServiceLoading(true);
          setServiceError(null);
          const response = await serviceService.getPurchasedServiceDetails(user.id, parseInt(serviceId));
          if (response.success) {
            setService(response.data);
            // Initialize editing credentials with current values
            const initialCredentials: Record<number, string> = {};
            response.data.credentials.forEach(cred => {
              initialCredentials[cred.custom_field_id] = cred.custom_field_value;
            });
            setEditingCredentials(initialCredentials);
          } else {
            setServiceError('Failed to fetch service details');
          }
        } catch (error) {
          console.error('Error fetching service details:', error);
          setServiceError('Failed to fetch service details');
        } finally {
          setServiceLoading(false);
        }
      }
    };

    fetchServiceDetails();
  }, [user, serviceId]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset editing credentials to original values
    if (service) {
      const originalCredentials: Record<number, string> = {};
      service.credentials.forEach(cred => {
        originalCredentials[cred.custom_field_id] = cred.custom_field_value;
      });
      setEditingCredentials(originalCredentials);
    }
  };

  const handleSave = async () => {
    if (!service || !user) return;

    try {
      setSaving(true);
      const credentials = Object.entries(editingCredentials).map(([fieldId, value]) => {
        // Find the credential by custom_field_id to get the actual credential id
        const credential = service.credentials.find(cred => cred.custom_field_id === parseInt(fieldId));
        return {
          id: credential?.id || parseInt(fieldId), // Use credential id, fallback to fieldId if not found
          custom_field_value: value
        };
      }) as Array<{ id: number; custom_field_value: string }>;

      const response = await serviceService.updatePurchasedServiceCredentials(
        user.id,
        service.id,
        { credentials }
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Service credentials updated successfully",
        });
        setIsEditing(false);
        // Refresh service data
        const updatedResponse = await serviceService.getPurchasedServiceDetails(user.id, service.id);
        if (updatedResponse.success) {
          setService(updatedResponse.data);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast({
        title: "Error",
        description: "Failed to update credentials",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCredentialChange = (fieldId: number, value: string) => {
    setEditingCredentials(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const togglePasswordVisibility = (fieldId: number) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const isPasswordField = (fieldName: string): boolean => {
    return fieldName.toLowerCase().includes('password') || 
           fieldName.toLowerCase().includes('pwd') ||
           fieldName.toLowerCase().includes('secret');
  };

  // Show loading while checking authentication or fetching service
  if (loading || serviceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  // If not logged in or not a customer, show login form
  if (!user || (userType && userType !== 'customer')) {
    return (
      <div className="min-h-screen bg-content-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access service details.</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (serviceError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Server className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-destructive">Error Loading Service</h3>
          <p className="text-muted-foreground mb-4">{serviceError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Service Not Found</h3>
          <p className="text-muted-foreground mb-4">The requested service could not be found.</p>
          <Button onClick={() => navigate('/my-services')} variant="outline">
            Back to My Services
          </Button>
        </div>
      </div>
    );
  }

  const paymentLogo = getPaymentLogo(service.payment_type);

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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/my-services')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Services
                </Button>
                <div className="h-6 w-px bg-border" />
                <h1 className="text-lg font-semibold text-foreground">{service.service.name}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
                </Button>
                
                <ThemeToggle />
                
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{user.full_name}</span>
                </Button>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Service Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Service Information
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Name:</span>
                      <span className="font-medium">{service.service.name}</span>
                    </div>
                    
                    {/* Display credentials as service details */}
                    {service.credentials.map((credential) => (
                      <div key={credential.id} className="flex justify-between">
                        <span className="text-muted-foreground">{credential.custom_field_title}:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium font-mono">
                            {isPasswordField(credential.custom_field_title) && !showPassword[credential.custom_field_id]
                              ? '••••••••'
                              : credential.custom_field_value
                            }
                          </span>
                          {isPasswordField(credential.custom_field_title) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => togglePasswordVisibility(credential.custom_field_id)}
                            >
                              {showPassword[credential.custom_field_id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{service.service.category?.category || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registration Date:</span>
                      <span className="font-medium">{formatDate(service.registered_date)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-primary">{getBillingCostDisplay(service)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Server Monitoring */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Server Monitoring</div>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications about server status
                        </div>
                      </div>
                      <Switch
                        checked={serverMonitoring}
                        onCheckedChange={setServerMonitoring}
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="w-full justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Upgrade Service
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem>Basic Plan - $19.99/month</DropdownMenuItem>
                          <DropdownMenuItem>Pro Plan - $49.99/month</DropdownMenuItem>
                          <DropdownMenuItem>Enterprise Plan - $99.99/month</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel Service
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Service</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this service? This action cannot be undone.
                              You will lose access to all service features and data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Service</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Cancel Service
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Service Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Service Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {service.service.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Credentials Management Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Service Credentials
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button onClick={handleEdit} variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Credentials
                        </Button>
                      ) : (
                        <>
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={handleSave} disabled={saving} size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage your service-specific configuration details
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {service.credentials.map((credential) => (
                      <div key={credential.id} className="space-y-2">
                        <Label htmlFor={`credential-${credential.id}`} className="text-sm font-medium">
                          {credential.custom_field_title}
                        </Label>
                        {isEditing ? (
                          <Input
                            id={`credential-${credential.id}`}
                            value={editingCredentials[credential.custom_field_id] || ''}
                            onChange={(e) => handleCredentialChange(credential.custom_field_id, e.target.value)}
                            placeholder={`Enter ${credential.custom_field_title.toLowerCase()}`}
                            type={isPasswordField(credential.custom_field_title) ? 'password' : 'text'}
                          />
                        ) : (
                          <div className="p-3 bg-muted rounded-md">
                            <span className="font-mono text-sm">
                              {isPasswordField(credential.custom_field_title) && !showPassword[credential.custom_field_id]
                                ? '••••••••'
                                : credential.custom_field_value
                              }
                            </span>
                            {isPasswordField(credential.custom_field_title) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-2"
                                onClick={() => togglePasswordVisibility(credential.custom_field_id)}
                              >
                                {showPassword[credential.custom_field_id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ServiceDetailPage;