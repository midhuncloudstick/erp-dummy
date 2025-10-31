
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { AdminLayout } from '@/components/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCustomerById, fetchCustomerList, updateCustomer } from '@/store/slices/customerSlice';
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchIndustries } from '@/store/slices/customerSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';


interface EditCustomerForm {
  companyName: string;
  contactPersonName: string;
  phoneNumber: string;
  email: string;
  industry: string;
  industry_id: string;
  // productInterested?: string;
  address: string;
  notes: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  countryCode: string;
}

const EditCustomerPage = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const id = Number(customerId)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCustomerById({ id }))
    dispatch(fetchIndustries());
  }, [dispatch,id])


  const { industries, } = useSelector((state: RootState) => state.customers);
  console.log(industries)

  const customerDetail = useAppSelector((state) => state.customers.selectedCustomer)
  console.log("customerDetails", customerDetail)





  // Mock customer data - in a real app, this would be fetched based on customerId
  // const [customer] = useState({
  //   id: Number(customerId),
  //   companyName: 'Tech Solutions Inc.',
  //   contactPersonName: 'John Smith',
  //   phoneNumber: '+1-555-0123',
  //   email: 'john@techsolutions.com',
  //   industry: 'Technology',
  //   productInterested: 'Project Management System',
  //   address: '123 Tech Street, Silicon Valley, CA',
  //   notes: 'Interested in enterprise solution'
  // });

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

  const form = useForm<EditCustomerForm>({
    defaultValues: {
      companyName: "",
      contactPersonName: "",
      phoneNumber: "",
      email: "",
      industry: "",
      address: "",
      notes: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      countryCode: ""
    }
  });

  useEffect(() => {
    if (customerDetail) {
      form.reset({
        companyName: customerDetail.company_name || "",
        contactPersonName: customerDetail.full_name || "",
        phoneNumber: customerDetail.phone_number || "",
        email: customerDetail.email || "",
        industry: customerDetail.industry?.industry_name ?? "",
        industry_id: customerDetail.industry_id?.toString() || "",
        address: customerDetail.address || "",
        notes: customerDetail.note || "",
        city: customerDetail.city || "",
        state: customerDetail.state || "",
        zipCode: customerDetail.zip_code || "",
      country: customerDetail.country || "",
countryCode: customerDetail.country_code || "",
      });
    }
  }, [customerDetail]);



const handleUpdate = async (data: EditCustomerForm) => {
  const payload = {
    full_name: data.contactPersonName,
    company_name: data.companyName,
    phone_number: data.phoneNumber,
    email: data.email,
    address: data.address,
    note: data.notes,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    country: data.country,
    country_code: data.countryCode,
    password: data.password || "",
    confirm_password: data.confirmPassword || "",
    industry_id: Number(data.industry_id) || 0
  };
   console.log("paylaod before submission",payload)
  try {
    await dispatch(updateCustomer({id, customer:payload})).unwrap();
    toast.success("Customer updated Successfully!!");
    await dispatch(fetchCustomerList())
     navigate("/customers");
  } catch (error: any) {
    console.log("Error in updation",error);
    
    toast.error(error?.data?.error || error.message || "Something went wrong");
  }
};


  const onSubmit = async (data: EditCustomerForm) => {
    if (!customerDetail) return;


    await handleUpdate(data);

    console.log("Updated customer data:", data);
   
  };



  return (
    <AdminLayout
      title="Customer Details"
      subtitle="Manage all your customers information "
      actions={
        <Button onClick={() => navigate('/customers')} className="bg-primary hover:bg-primary/90">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back To Customers
        </Button>
      }

    >


      <div className="min-h-screen">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  <FormField
                    control={form.control}
                    name="contactPersonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact person name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4 w-full'>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
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
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                  </div>


                  <div className='grid grid-cols-2 gap-4 w-full'>
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <FormField
                      control={form.control}
                      name="industry_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {industries?.map((ind) => (
                                <SelectItem key={ind.id} value={ind.id.toString()}>
                                  {ind?.industry_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />





                  </div>




                  {/* <FormField
                  control={form.control}
                  name="productInterested"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Interested</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product interest" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter complete address"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter zip code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select
                            onValueChange={(value) => {
                           
                              const selectedCountry = countryOptions.find(c => c.name === value);
                           
                              field.onChange(value);
                             
                              form.setValue('countryCode', selectedCountry?.code || '');
                            }}
                          
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countryOptions.map((country) => (
                                <SelectItem key={`${country.code}-${country.name}`} value={country.name}>
                                  {country.name} ({country.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional notes"
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
                      onClick={() => navigate('/customers')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 dark:text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>



    </AdminLayout>


  );
};

export default EditCustomerPage;
