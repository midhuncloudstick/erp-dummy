import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Eye, EyeOff, Server, CreditCard, Tag } from 'lucide-react';
import PayPalPaymentDialog from '@/components/PayPalPaymentDialog';
import { serviceService } from '@/services/serviceService';
import { Service } from '@/types/service';
import { PayPalSubscriptionRequest, paymentService } from '@/services/paymentService';
import StripePaymentDialog from '@/components/StripePaymentDialog';
import { loadStripe } from '@stripe/stripe-js';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ClientSidebar } from '../components/ClientSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import ClientHeader from '../components/ClientHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/use-toast';
interface ServerCredentials {
  ipAddress: string;
  hostname: string;
  rootPassword: string;
  showPassword: boolean;
  controlPanel: string;
}

interface CouponCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

const OrderServerCarePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, userType } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const serviceIdFromState = (location.state as any)?.serviceId as number | undefined;
  const [quantity, setQuantity] = useState(1);
  const [tenure, setTenure] = useState('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [couponError, setCouponError] = useState('');
  const [serverCredentials, setServerCredentials] = useState<ServerCredentials[]>([
    { ipAddress: '', hostname: '', rootPassword: '', showPassword: false, controlPanel: '' }
  ]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [customErrors, setCustomErrors] = useState<Record<number, Record<string, string>>>({});
  
  // Helper function to get field values for a specific server
  const getServerFieldValues = (serverIndex: number) => {
    return customFieldValues[serverIndex] || {};
  };
  
  // Helper function to update field values for a specific server
  const updateServerFieldValues = (serverIndex: number, fieldName: string, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [serverIndex]: {
        ...prev[serverIndex],
        [fieldName]: value
      }
    }));
    setCustomErrors(prev => ({
      ...prev,
      [serverIndex]: {
        ...(prev[serverIndex] || {}),
        [fieldName]: ''
      }
    }));
  };

  const [personalDetails, setPersonalDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    countryCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'stripe'>('paypal');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showPayPalDialog, setShowPayPalDialog] = useState(false);

  // Autofill from profile on component mount
  useEffect(() => {
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        setPersonalDetails(prev => ({
          ...prev,
          fullName: userData.full_name || '',   // ✅ use full_name
          email: userData.email || '',
          company: userData.company_name || '' // ✅ use company_name
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        setPersonalDetails(prev => ({
          ...prev,
          fullName: profile.full_name || prev.fullName,
          email: profile.email || prev.email,
          phone: profile.phone || '',
          company: profile.company_name || prev.company, // ✅ company_name again
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          zipCode: profile.zipCode || '',
          country: profile.country || '',
          countryCode: profile.countryCode || ''
        }));
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }
    }
  }, []);
  

  // Load selected service (for right panel) if navigated from purchase page
  useEffect(() => {
    const fromState = serviceIdFromState;
    const fromStorage = Number(localStorage.getItem('selectedServiceId')) || undefined;
    const svcId = fromState ?? fromStorage;
    if (!svcId) return;
    (async () => {
      try {
        const res = await serviceService.getServiceById(svcId);
        if (res.success) {
          const svc = (res as any)?.response?.data;
          if (svc) {
            setSelectedService(svc);
            // Initialize empty field values for each server based on current quantity
            const initialValues: Record<string, Record<string, string>> = {};
            for (let serverIndex = 0; serverIndex < quantity; serverIndex++) {
              initialValues[serverIndex] = {};
              (svc.custom_fields || []).forEach((cf: any) => {
                initialValues[serverIndex][cf.field_name] = '';
              });
            }
            setCustomFieldValues(initialValues);
          }
        }
      } catch {}
    })();
  }, [serviceIdFromState]);

  const controlPanels = [
    'cPanel/WHM',
    'Plesk',
    'DirectAdmin',
    'CyberPanel',
    'VestaCP',
    'ISPConfig',
    'Webmin/Virtualmin',
    'None'
  ];

  const countryCodes = [
    { code: 'USA', country: 'United States' },
    { code: 'CAN', country: 'Canada' },
    { code: 'GBR', country: 'United Kingdom' },
    { code: 'AUS', country: 'Australia' },
    { code: 'DEU', country: 'Germany' },
    { code: 'FRA', country: 'France' },
    { code: 'IND', country: 'India' },
    { code: 'JPN', country: 'Japan' },
    { code: 'CHN', country: 'China' },
    { code: 'RUS', country: 'Russia' },
    { code: 'KOR', country: 'South Korea' },
    { code: 'ITA', country: 'Italy' },
    { code: 'ESP', country: 'Spain' },
    { code: 'NLD', country: 'Netherlands' },
    { code: 'SWE', country: 'Sweden' },
    { code: 'NOR', country: 'Norway' },
    { code: 'DNK', country: 'Denmark' },
    { code: 'FIN', country: 'Finland' }
  ];

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'India',
    'Japan',
    'China',
    'Russia',
    'South Korea',
    'Italy',
    'Spain',
    'Netherlands',
    'Sweden',
    'Norway',
    'Denmark',
    'Finland',
    'Other'
  ];

  const statesByCountry = {
    'United States': [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
      'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
      'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
      'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
      'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ],
    'Canada': [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
      'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
      'Quebec', 'Saskatchewan', 'Yukon'
    ],
    'India': [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
      'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
      'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
      'Uttarakhand', 'West Bengal'
    ],
    'Australia': [
      'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
      'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
    ],
    'United Kingdom': [
      'England', 'Scotland', 'Wales', 'Northern Ireland'
    ]
  };

  const getStatesForCountry = (country: string) => {
    return statesByCountry[country as keyof typeof statesByCountry] || ['Other'];
  };

  const serverCarePlan = selectedService
    ? {
        name: selectedService.name,
        monthlyPrice: selectedService.monthly_cost ? Number(selectedService.monthly_cost) : undefined,
        yearlyPrice: selectedService.yearly_cost ? Number(selectedService.yearly_cost) : undefined,
        onetimePrice: selectedService.one_time_cost ? Number(selectedService.one_time_cost) : undefined,
        features: selectedService.features || [],
        type: selectedService.type,
      }
    : {
        name: 'Professional Server Care',
        monthlyPrice: 99,
        yearlyPrice: 999,
        onetimePrice: undefined,
        features: [
          '24/7 Server Monitoring',
          'Real-time Security Updates',
          'Performance Optimization',
          'Database Management',
          'Backup & Recovery',
          'Priority Support',
          'Monthly Security Reports',
          'Load Balancing Setup'
        ],
        type: 'recurring' as const,
      };

  // Mock coupon codes - in a real app, this would come from an API
  const validCoupons: CouponCode[] = [
    { code: 'SAVE10', discount: 10, type: 'percentage' },
    { code: 'SAVE20', discount: 20, type: 'percentage' },
    { code: 'WELCOME50', discount: 50, type: 'fixed' },
    { code: 'NEWCLIENT', discount: 15, type: 'percentage' }
  ];

  // Calculate total price based on quantity, tenure, and coupon
  const calculateTotalPrice = () => {
    const pricePerServer = serverCarePlan.type === 'onetime'
      ? (serverCarePlan.onetimePrice ?? 0)
      : tenure === 'yearly' ? (serverCarePlan.yearlyPrice ?? 0) : (serverCarePlan.monthlyPrice ?? 0);
    const subtotal = pricePerServer * quantity;
    
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        return subtotal - (subtotal * appliedCoupon.discount / 100);
      } else {
        return Math.max(0, subtotal - appliedCoupon.discount);
      }
    }
    
    return subtotal;
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const pricePerServer = serverCarePlan.type === 'onetime'
      ? (serverCarePlan.onetimePrice ?? 0)
      : tenure === 'yearly' ? (serverCarePlan.yearlyPrice ?? 0) : (serverCarePlan.monthlyPrice ?? 0);
    const subtotal = pricePerServer * quantity;
    
    if (appliedCoupon.type === 'percentage') {
      return subtotal * appliedCoupon.discount / 100;
    } else {
      return Math.min(appliedCoupon.discount, subtotal);
    }
  };

  const applyCoupon = () => {
    const foundCoupon = validCoupons.find(coupon => coupon.code.toLowerCase() === couponCode.toLowerCase());
    
    if (foundCoupon) {
      setAppliedCoupon(foundCoupon);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    const newCredentials = [...serverCredentials];
    
    if (newQuantity > serverCredentials.length) {
      // Add new server credential fields
      for (let i = serverCredentials.length; i < newQuantity; i++) {
        newCredentials.push({ ipAddress: '', hostname: '', rootPassword: '', showPassword: false, controlPanel: '' });
      }
    } else {
      // Remove excess server credential fields
      newCredentials.splice(newQuantity);
    }
    
    setServerCredentials(newCredentials);
  };

  const updateServerCredential = (index: number, field: keyof ServerCredentials, value: string | boolean) => {
    const updated = [...serverCredentials];
    updated[index] = { ...updated[index], [field]: value };
    setServerCredentials(updated);
  };

  const togglePasswordVisibility = (index: number) => {
    updateServerCredential(index, 'showPassword', !serverCredentials[index].showPassword);
  };

  const [showStripeDialog, setShowStripeDialog] = useState(false);

  const validateForm = (): boolean => {
    const newPersonal: Record<string, string> = {};
    const newCustom: Record<number, Record<string, string>> = {};

    if (!personalDetails.fullName.trim()) newPersonal.fullName = 'Full name is required';
    if (!personalDetails.email.trim()) {
      newPersonal.email = 'Email is required';
    } else if (!/.+@.+\..+/.test(personalDetails.email)) {
      newPersonal.email = 'Enter a valid email';
    }
    if (!personalDetails.country.trim()) newPersonal.country = 'Country is required';

    if (selectedService?.custom_fields?.length) {
      for (let serverIndex = 0; serverIndex < quantity; serverIndex++) {
        const perServer: Record<string, string> = {};
        (selectedService.custom_fields || []).forEach((cf: any) => {
          if (cf.is_mandatory) {
            const v = (customFieldValues[serverIndex] || {})[cf.field_name] || '';
            if (!String(v).trim()) perServer[cf.field_name] = `${cf.field_name} is required`;
          }
        });
        if (Object.keys(perServer).length) newCustom[serverIndex] = perServer;
      }
    }

    setPersonalErrors(newPersonal);
    setCustomErrors(newCustom);

    const ok = Object.keys(newPersonal).length === 0 && Object.keys(newCustom).length === 0;
    if (!ok) {
      toast({ title: 'Missing Information', description: 'Please fill all required fields', variant: 'destructive' });
    }
    return ok;
  };

  const handleProceedToPayment = () => {
    if (!validateForm()) return;
    if (paymentMethod === 'paypal') {
      setShowPayPalDialog(true);
      return;
    }
    setShowStripeDialog(true);
  };

  const handlePaymentSuccess = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const dashboardUser = {
    id: user?.id?.toString() || '1',
    email: user?.email || 'user@example.com',
    name: user?.full_name || 'User',
    full_name: user?.full_name || 'User',
    type: (userType === 'admin' ? 'admin' : 'client') as 'admin' | 'client',
    projects: []
  };


  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <ClientSidebar user={dashboardUser} />
            
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <ClientHeader user={dashboardUser} title="Order Server Care" onLogout={handleLogout} />
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Customer Details and Server Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Please provide your contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={personalDetails.fullName}
                    onChange={(e) => { setPersonalDetails({...personalDetails, fullName: e.target.value}); setPersonalErrors(prev => ({...prev, fullName: ''})); }}
                    className={personalErrors.fullName ? 'border-red-500' : undefined}
                    required
                  />
                  {personalErrors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{personalErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalDetails.email}
                    onChange={(e) => { setPersonalDetails({...personalDetails, email: e.target.value}); setPersonalErrors(prev => ({...prev, email: ''})); }}
                    className={personalErrors.email ? 'border-red-500' : undefined}
                    required
                  />
                  {personalErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{personalErrors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={personalDetails.phone}
                    onChange={(e) => setPersonalDetails({...personalDetails, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={personalDetails.company}
                    onChange={(e) => setPersonalDetails({...personalDetails, company: e.target.value})}
                  />
                </div>
                 <div>
                   <Label htmlFor="country">Country *</Label>
                   <Select 
                     value={personalDetails.country} 
                     onValueChange={(value) => {
                       const selectedCountryCode = countryCodes.find(item => item.country === value)?.code || '';
                       setPersonalDetails({
                         ...personalDetails, 
                         country: value,
                         countryCode: selectedCountryCode,
                         state: '' // Reset state when country changes
                       });
                       setPersonalErrors(prev => ({...prev, country: ''}));
                     }}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select country" />
                     </SelectTrigger>
                     <SelectContent>
                       {countries.map((country) => (
                         <SelectItem key={country} value={country}>
                           {country}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                  {personalErrors.country && (
                    <p className="text-sm text-red-600 mt-1">{personalErrors.country}</p>
                  )}
                 </div>
                  <div>
                    <Label htmlFor="countryCode">Country Code</Label>
                    <Input
                      id="countryCode"
                      value={personalDetails.countryCode}
                      readOnly
                      placeholder="Auto-filled based on country"
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>
                 <div>
                   <Label htmlFor="state">State/Province</Label>
                   <Select 
                     value={personalDetails.state} 
                     onValueChange={(value) => setPersonalDetails({...personalDetails, state: value})}
                     disabled={!personalDetails.country}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select state" />
                     </SelectTrigger>
                     <SelectContent>
                       {getStatesForCountry(personalDetails.country).map((state) => (
                         <SelectItem key={state} value={state}>
                           {state}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <Label htmlFor="city">City</Label>
                     <Input
                       id="city"
                       value={personalDetails.city}
                       onChange={(e) => setPersonalDetails({...personalDetails, city: e.target.value})}
                     />
                   </div>
                   <div>
                     <Label htmlFor="zipCode">ZIP Code</Label>
                     <Input
                       id="zipCode"
                       value={personalDetails.zipCode}
                       onChange={(e) => setPersonalDetails({...personalDetails, zipCode: e.target.value})}
                     />
                   </div>
                 </div>
                 <div>
                   <Label htmlFor="address">Address</Label>
                   <Textarea
                     id="address"
                     value={personalDetails.address}
                     onChange={(e) => setPersonalDetails({...personalDetails, address: e.target.value})}
                     rows={2}
                   />
                 </div>
              </CardContent>
            </Card>

            {/* Plan Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Configuration</CardTitle>
                <CardDescription>Configure your server care plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Number of Servers:</Label>
                    <Input id="quantity" value="1" readOnly className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                  {serverCarePlan?.type === 'recurring' && (
  <div>
    <Label htmlFor="tenure">Billing Cycle:</Label>
    <Select value={tenure} onValueChange={setTenure}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="monthly">
          Monthly - ${serverCarePlan.monthlyPrice}/server
        </SelectItem>
        <SelectItem value="yearly">
          Yearly - ${serverCarePlan.yearlyPrice}/server (Save 15%)
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
)}

                </div>
              </CardContent>
            </Card>

            {/* Dynamic Custom Fields from Service */}
            {selectedService?.custom_fields && selectedService.custom_fields.length > 0 && (
              <div className="space-y-6">
                {Array.from({ length: quantity }, (_, serverIndex) => (
                  <Card key={serverIndex}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Server className="h-5 w-5 mr-2" />
                        Service Requirements - Server {serverIndex + 1}
                      </CardTitle>
                      <CardDescription>Provide the required details for server {serverIndex + 1}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedService.custom_fields.map((field, idx) => {
                        const id = `cf-${serverIndex}-${idx}`;
                        const serverFieldValues = getServerFieldValues(serverIndex);
                        const common = {
                          id,
                          value: serverFieldValues[field.field_name] || '',
                          onChange: (e: any) => updateServerFieldValues(serverIndex, field.field_name, e.target?.value ?? ''),
                        } as const;
                        return (
                          <div key={`${serverIndex}-${field.field_name}`} className="space-y-1">
                            <Label htmlFor={id}>
                              {field.field_name} {field.is_mandatory ? '*' : ''}
                            </Label>
                            {field.field_type === 'select' ? (
                              <Select
                                value={serverFieldValues[field.field_name] || ''}
                                onValueChange={(val) => updateServerFieldValues(serverIndex, field.field_name, val)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${field.field_name}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {(field.field_select || []).map((opt, i) => (
                                    <SelectItem key={`${field.field_name}-${i}`} value={opt.options}>
                                      {opt.options}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type={field.field_type === 'password' ? 'password' : 'text'}
                                inputMode={field.field_type === 'digit' ? 'numeric' : undefined}
                                pattern={field.field_type === 'digit' ? '[0-9]*' : undefined}
                                placeholder={field.field_name}
                                className={customErrors[serverIndex]?.[field.field_name] ? 'border-red-500' : undefined}
                                {...(common as any)}
                              />
                            )}
                            {customErrors[serverIndex]?.[field.field_name] && (
                              <p className="text-sm text-red-600 mt-1">{customErrors[serverIndex][field.field_name]}</p>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'paypal' | 'stripe')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal">PayPal</Label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe">Stripe</Label>
                  </div>
                </RadioGroup>

                {/* {paymentMethod === 'stripe' && (
                  <p className="text-xs text-gray-500 mt-3">
                    Stripe will be handled automatically using Stripe.js (no manual ID entry).
                  </p>
                )} */}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Coupon Code and Service Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Coupon Code
                </CardTitle>
                <CardDescription>Apply a coupon code for additional savings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                      />
                      {couponError && (
                        <p className="text-sm text-red-600 mt-1">{couponError}</p>
                      )}
                    </div>
                    <Button onClick={applyCoupon} disabled={!couponCode.trim()}>
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div>
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Coupon "{appliedCoupon.code}" applied
                      </span>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        {appliedCoupon.type === 'percentage' 
                          ? `${appliedCoupon.discount}% discount` 
                          : `$${appliedCoupon.discount} off`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon}>
                      Remove
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Service Plan</CardTitle>
                <CardDescription>Professional  service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{serverCarePlan.name}</h3>
                    <div className="text-right">
                      {/* <span className="text-sm text-gray-500 block">
                        {tenure === 'yearly' ? 'Yearly' : 'Monthly'}
                      </span> */}
                      <span className="text-xl font-bold text-purple-600">
                        ${serverCarePlan.type === 'onetime' ? (serverCarePlan.onetimePrice ?? 0) : (tenure === 'yearly' ? (serverCarePlan.yearlyPrice ?? 0) : (serverCarePlan.monthlyPrice ?? 0))}
                        <span className="text-sm text-gray-500">/{serverCarePlan.type === 'onetime' ? 'one-time' : (tenure === 'yearly' ? 'year' : 'month')}</span>
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {serverCarePlan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Calculation */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Servers ({quantity})</span>
                      <span>{quantity} × ${serverCarePlan.type === 'onetime' ? (serverCarePlan.onetimePrice ?? 0) : (tenure === 'yearly' ? (serverCarePlan.yearlyPrice ?? 0) : (serverCarePlan.monthlyPrice ?? 0))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${(serverCarePlan.type === 'onetime' ? (serverCarePlan.onetimePrice ?? 0) : (tenure === 'yearly' ? (serverCarePlan.yearlyPrice ?? 0) : (serverCarePlan.monthlyPrice ?? 0))) * quantity}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-${calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    {tenure === 'yearly' && serverCarePlan.type !== 'onetime' && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Yearly Discount (15%)</span>
                        <span>-${((serverCarePlan.monthlyPrice * 12 - serverCarePlan.yearlyPrice) * quantity).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-purple-600">${calculateTotalPrice().toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {serverCarePlan.type === 'onetime' ? 'One-time payment' : (tenure === 'yearly' ? 'Billed annually' : 'Billed monthly')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order Summary and Submit */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <span className="ml-2 font-medium">{quantity} server(s)</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Billing:</span>
                  <span className="ml-2 font-medium capitalize"> {serverCarePlan.type === 'onetime' ? 'one-time' : (tenure === 'yearly' ? 'yearly' : 'monthly')}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="ml-2 font-medium">{paymentMethod || 'Not selected'}</span>
              
                </div>
              </div>
              <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-lg font-semibold">Total Amount:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-purple-600">${calculateTotalPrice().toFixed(2)}</span>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600">
                      Savings: ${calculateDiscount().toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>

      <PayPalPaymentDialog
        open={showPayPalDialog}
        onOpenChange={setShowPayPalDialog}
        paymentData={{
          customer: {
            phone_number: personalDetails.phone,
            company_name: personalDetails.company,
            city: personalDetails.city,
            zip_code: personalDetails.zipCode,
            address: personalDetails.address,
            state: personalDetails.state,
            country: personalDetails.country,
            country_code: personalDetails.countryCode
          },
          provider: 'paypal',
          payment_type: serverCarePlan.type === 'onetime' ? 'onetime' : 'recurring',
          recurring_type: serverCarePlan.type === 'onetime' ? undefined : (tenure === 'yearly' ? 'yearly' : 'monthly'),
          service_id: selectedService?.id?.toString() || '1',
          quantity: quantity.toString(),
          custom_details: Array.from({ length: quantity }, (_, serverIndex) => 
            (selectedService?.custom_fields || []).map((cf) => {
              const serverFieldValues = getServerFieldValues(serverIndex);
              return {
                field_id: String(cf.id ?? ''),
                field_name: cf.field_name,
                field_value: serverFieldValues[cf.field_name] || ''
              };
            })
          )
        }}
        onSuccess={() => {
          // Payment session created successfully
          console.log('PayPal payment session created');
          toast({ title: 'PayPal', description: 'Payment session created successfully', className: 'bg-green-600 text-white border-green-600' });
        }}
        onError={(error) => {
          console.error('Payment error:', error);
          const message = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to create PayPal subscription';
          toast({ title: 'Payment Error', description: message, variant: 'destructive' });
        }}
      />
      <StripePaymentDialog
        open={showStripeDialog}
        onOpenChange={setShowStripeDialog}
        payload={{
          customer: {
            phone_number: personalDetails.phone,
            company_name: personalDetails.company,
            city: personalDetails.city,
            zip_code: personalDetails.zipCode,
            address: personalDetails.address,
            state: personalDetails.state,
            country: personalDetails.country,
            country_code: personalDetails.countryCode
          },
          provider: 'stripe',
          payment_type: serverCarePlan.type === 'onetime' ? 'onetime' : 'recurring',
          recurring_type: serverCarePlan.type === 'onetime' ? undefined : (tenure === 'yearly' ? 'yearly' : 'monthly'),
          service_id: selectedService?.id?.toString() || '1',
          quantity: quantity.toString(),
          custom_details: Array.from({ length: quantity }, (_, serverIndex) => 
            (selectedService?.custom_fields || []).map((cf) => {
              const serverFieldValues = getServerFieldValues(serverIndex);
              return {
                field_id: String(cf.id ?? ''),
                field_name: cf.field_name,
                field_value: serverFieldValues[cf.field_name] || ''
              };
            })
          )
        }}
      />
    </ThemeProvider>
  );
};

export default OrderServerCarePage;
