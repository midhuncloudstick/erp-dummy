import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Save, X, Eye, EyeOff } from 'lucide-react';
import { fetchCustomerProfile, updateCustomerProfile } from '@/store/slices/customerSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { SidebarProvider } from '@/components/ui/sidebar';
import ClientHeader from '../components/ClientHeader';
import { ClientSidebar } from '../components/ClientSidebar';
import { toast } from 'sonner';
import { logout, updateUser } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { authService } from '@/services/authService';





interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  country_code: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  // const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useAppDispatch();
  const reducerDispatch = useDispatch()
  const customerProfileData = useAppSelector((state) => state.customers.selectedCustomer);
  const userInfo = useAppSelector((state) => state.auth.user)

  console.log("userInfo", userInfo)

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;
  console.log("userId", userId);

  const displayValue = (value: string) => value?.trim() !== "" ? value : "Not Specified";

  const getCustomerProfile = async (userId: string) => {
    return await dispatch(fetchCustomerProfile(parseInt(userId)));
  };



  useEffect(() => {
    getCustomerProfile(userId);
  }, []);

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
    if (customerProfileData) {
      const newProfile: UserProfile = {
        id: customerProfileData.id?.toString() || "",
        name: customerProfileData.full_name ?? "",
        email: customerProfileData.email ?? "",
        phone: customerProfileData.phone_number ?? "",
        company: customerProfileData.company_name ?? "",
        address: customerProfileData.address ?? "",
        city: customerProfileData.city ?? "",
        state: customerProfileData.state ?? "",
        zipCode: customerProfileData.zip_code ?? "",
        country: customerProfileData.country ?? "",
        country_code: customerProfileData.country_code ?? "",
      };
      console.log("newprofile", newProfile);
      setProfile(newProfile);

      if (!isEditing) {
        setEditedProfile(newProfile);
      }
    }
  }, [customerProfileData]);

  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    country_code: ''
  });
  console.log("profileData", profile);

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  console.log("editingPayload", editedProfile)

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });


  const handleUpdateProfile = async () => {
    const id = userId;

    const payload = {
      full_name: editedProfile.name,
      email: editedProfile.email,
      phone_number: editedProfile.phone,
      company: editedProfile.company,
      address: editedProfile.address,
      city: editedProfile.city,
      state: editedProfile.state,
      zip_code: editedProfile.zipCode,
      country: editedProfile.country,
      country_code: editedProfile.country_code,
    };

    try {
      await dispatch(updateCustomerProfile({ id, payload })).unwrap();
      const res = await getCustomerProfile(id);
      reducerDispatch(updateUser(res))
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.log("Error in updation", error);
      toast.error(error?.data?.error || error.message || "Something went wrong");
    }
  };

  const handlePasswordUpdate = async () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const userType = user?.userType || 'customer';
      await authService.updatePassword(
        userId,
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword,
        userType
      );
      
      toast.success("Password updated successfully!");
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
    } catch (error: any) {
      console.log("Error updating password", error);
      // Extract error message from response
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.data?.error || 
                          error?.message || 
                          "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePasswordInputChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };


  const dashboardUser = {
    id: userInfo.id?.toString(),
    email: userInfo.email,
    name: userInfo.full_name,
    full_name: userInfo.full_name,
    type: 'client' as 'admin' | 'client',
    projects: []
  };

  const handleLogout = async () => {
    dispatch(logout());
    navigate('/');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  // const handleSave = () => {
  //   setProfile(editedProfile);
  //   setIsEditing(false);

  //   // Update localStorage
  //   const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  //   const updatedUser = { ...currentUser, name: editedProfile.name, email: editedProfile.email };
  //   localStorage.setItem('currentUser', JSON.stringify(updatedUser));

  //   toast({
  //     title: "Profile Updated",
  //     description: "Your profile has been successfully updated.",
  //   });
  // };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex gap-0">
        {/* Sidebar and Header are positioned to sit on top of everything else */}
        <div className="">
          <ClientSidebar user={dashboardUser} />
        </div>

        {/* Main Content Area: Offset to avoid fixed sidebar and header */}
        <div className="w-full"> {/* Add padding-left to match sidebar width */}
          <ClientHeader user={dashboardUser} title="My profile" onLogout={handleLogout} />

          <main className="p-8">
            <Card className="max-w-4xl w-full mx-auto border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Profile Information</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Manage your personal information and account details
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 dark:text-white">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button onClick={handleUpdateProfile} className="bg-green-600 hover:bg-green-700 dark:text-white">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      value={isEditing ? editedProfile.name || "" : displayValue(profile.name)}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editedProfile.email || "" : displayValue(profile.email)}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="countryCode" className="text-gray-700 dark:text-gray-300">Country Code</Label>
                    <Input
                      id="countryCode"
                      value={isEditing ? editedProfile.country_code || "" : displayValue(profile.country_code)}
                      onChange={(e) => handleInputChange('country_code', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                    <Input
                      id="phone"
                      value={isEditing ? editedProfile.phone || "" : displayValue(profile.phone)}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  
                    <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">Company</Label>
                  <Input
                    id="company"
                    value={isEditing ? editedProfile.company || "" : displayValue(profile.company)}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={!isEditing}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>


                </div>
              

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Address</Label>
                  <Input
                    id="address"
                    value={isEditing ? editedProfile.address || "" : displayValue(profile.address)}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">City</Label>
                    <Input
                      id="city"
                      value={isEditing ? editedProfile.city || "" : displayValue(profile.city)}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-gray-700 dark:text-gray-300">State</Label>
                    <Input
                      id="state"
                      value={isEditing ? editedProfile.state || "" : displayValue(profile.state)}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-gray-700 dark:text-gray-300">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={isEditing ? editedProfile.zipCode || "" : displayValue(profile.zipCode)}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">Country</Label>
                  {isEditing ? (
                    <Select
                      onValueChange={(value) => {
                        const selected = countryOptions.find(c => c.name === value);
                        setEditedProfile(prev => ({
                          ...prev,
                          country: value,
                          country_code: selected ? selected.code : ''
                        }));
                      }}
                      value={editedProfile.country}
                    >
                      <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map(c => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="country"
                      value={displayValue(profile.country)}
                      disabled
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Password Update Card */}
            <Card className="max-w-4xl w-full mx-auto border mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Update Password</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Change your account password for security
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handlePasswordUpdate} 
                    disabled={isUpdatingPassword}
                    className="bg-blue-600 hover:bg-blue-700 dark:text-white"
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfilePage;