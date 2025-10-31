import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { fetchIndustries, createCustomer } from '@/store/slices/customerSlice';
import { RootState, AppDispatch } from '@/store';
import { AdminLayout } from '@/components/AdminLayout';
import { z } from 'zod';

// Schema
const customerSchema = z.object({
  FullName: z.string().min(3, "Minimum 3 characters required"),
  company_name: z.string().min(2, "Company Name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  note: z.string().optional(),
  industry_id: z.number().min(1, "Industry is required"),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const AddCustomerPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { industries, loading, error } = useSelector((state: RootState) => state.customers);


  // console.log("industries",industries)

  const [formData, setFormData] = useState<CustomerFormData>({
    FullName: '',
    company_name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    country_code: '',
    note: '',
    industry_id: 0,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  const countryOptions = [
    { name: 'India', code: '+91' },
    { name: 'United States', code: '+1' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'Canada', code: '+1' },
    { name: 'Australia', code: '+61' },
    { name: 'Germany', code: '+49' },
    { name: 'France', code: '+33' },
    { name: 'Japan', code: '+81' },
    { name: 'China', code: '+86' },
    { name: 'Brazil', code: '+55' },
    { name: 'Russia', code: '+7' },
    { name: 'South Korea', code: '+82' },
    { name: 'Italy', code: '+39' },
    { name: 'Spain', code: '+34' },
    { name: 'Netherlands', code: '+31' },
    { name: 'Sweden', code: '+46' },
    { name: 'Norway', code: '+47' },
    { name: 'Denmark', code: '+45' },
    { name: 'Finland', code: '+358' },
    { name: 'Switzerland', code: '+41' },
    { name: 'Austria', code: '+43' },
    { name: 'Belgium', code: '+32' },
    { name: 'Poland', code: '+48' },
    { name: 'Czech Republic', code: '+420' },
    { name: 'Hungary', code: '+36' },
    { name: 'Portugal', code: '+351' },
    { name: 'Greece', code: '+30' },
    { name: 'Turkey', code: '+90' },
    { name: 'Israel', code: '+972' },
    { name: 'South Africa', code: '+27' },
    { name: 'Egypt', code: '+20' },
    { name: 'Nigeria', code: '+234' },
    { name: 'Kenya', code: '+254' },
    { name: 'Morocco', code: '+212' },
    { name: 'Argentina', code: '+54' },
    { name: 'Chile', code: '+56' },
    { name: 'Mexico', code: '+52' },
    { name: 'Thailand', code: '+66' },
    { name: 'Singapore', code: '+65' },
    { name: 'Malaysia', code: '+60' },
    { name: 'Indonesia', code: '+62' },
    { name: 'Philippines', code: '+63' },
    { name: 'Vietnam', code: '+84' },
    { name: 'New Zealand', code: '+64' },
  ];

  useEffect(() => {
    dispatch(fetchIndustries());
  }, [dispatch]);

  const handleInputChange = (field: keyof CustomerFormData, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'country') {
        const selected = countryOptions.find(c => c.name === value);
        if (selected) newData.country_code = selected.code;
      }
      return newData;
    });
  };

  

const handleCreateCustomer = async () => {
  try {
    await dispatch(createCustomer(formData)).unwrap();

    toast.success("Customer created successfully!!")

    navigate("/customers");
  } catch (error: any) {
    console.log(error)
    toast.error(error.error)
  }
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = customerSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof CustomerFormData;
        newErrors[field] = err.message;
      });
      setFormErrors(newErrors);

     toast.error("Fill the form completedly!!")
      return;
    }

    setFormErrors({});

    handleCreateCustomer();

    
  };

  // const isFormValid = Object.keys(formErrors).length === 0 &&
  //   formData.FullName.trim() &&
  //   formData.company_name.trim() &&
  //   formData.email.trim() &&
  //   formData.industry_id;

  return (
    <AdminLayout title="Customer Creation" subtitle="Manage all your customers and their information in one place"
        actions={
            <Button onClick={() => navigate('/customers')} className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
             Back To Customers
            </Button>
          }>

      <div className="min-h-screen ">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className=" shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-white">
                <User className="h-6 w-6 mr-3 text-purple-600 " />
                Customer Information
              </CardTitle>
              <CardDescription>Enter the details for the new customer to add them to the CRM system.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Full Name */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="FullName">Full Name *</Label>
                    <Input
                      id="FullName"
                      value={formData.FullName}
                      onChange={(e) => handleInputChange('FullName', e.target.value)}
                      className={`w-full ${formErrors.FullName ? "border-red-500" : ""}`}
                      placeholder="Enter full name"
                    />
                    {formErrors.FullName && <p className="text-red-500 text-sm">{formErrors.FullName}</p>}
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className={`w-full ${formErrors.company_name ? "border-red-500" : ""}`}

     placeholder="Enter company name"
                    />
                    {formErrors.company_name && <p className="text-red-500 text-sm">{formErrors.company_name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full ${formErrors.email ? "border-red-500" : ""}`}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className={`w-full ${formErrors.phone_number ? "border-red-500" : ""}`}
                        placeholder="Enter phone number"
                    />
                    {formErrors.phone_number && <p className="text-red-500 text-sm">{formErrors.phone_number}</p>}
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <Label htmlFor="industry_id">Industry *</Label>
                    <Select onValueChange={(v) => handleInputChange('industry_id', parseInt(v, 10))}>
                      <SelectTrigger className={`w-full ${formErrors.industry_id ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries?.map(ind => (
                          <SelectItem key={ind.id} value={ind.id.toString()}>{ind.industry_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.industry_id && <p className="text-red-500 text-sm">{formErrors.industry_id}</p>}
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className={`w-full ${formErrors.address ? "border-red-500" : ""}`}
                       placeholder="Enter complete address"
                    />
                    {formErrors.address && <p className="text-red-500 text-sm">{formErrors.address}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full ${formErrors.city ? "border-red-500" : ""}`}
                      placeholder="Enter city"
                    />
                    {formErrors.city && <p className="text-red-500 text-sm">{formErrors.city}</p>}
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full ${formErrors.state ? "border-red-500" : ""}`}
                      placeholder="Enter state"
                    />
                    {formErrors.state && <p className="text-red-500 text-sm">{formErrors.state}</p>}
                  </div>

                  {/* Zip Code */}
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">Zip Code</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      className={`w-full ${formErrors.zip_code ? "border-red-500" : ""}`}
                          placeholder="Enter zip code"
                    />
                    {formErrors.zip_code && <p className="text-red-500 text-sm">{formErrors.zip_code}</p>}
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select onValueChange={(v) => handleInputChange('country', v)}>
                      <SelectTrigger className={`w-full ${formErrors.country ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map(c => (
                          <SelectItem key={c.name} value={c.name}>{c.name} ({c.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.country && <p className="text-red-500 text-sm">{formErrors.country}</p>}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="note">Notes</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => handleInputChange('note', e.target.value)}
                      rows={4}
                      className={`w-full ${formErrors.note ? "border-red-500" : ""}`}
                      placeholder="Enter any additional notes about the customer"
                    />
                    {formErrors.note && <p className="text-red-500 text-sm">{formErrors.note}</p>}
                  </div>

                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={loading }
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Adding...' : 'Add Customer'}
                  </Button>
                </div>

                {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}

              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AddCustomerPage;
