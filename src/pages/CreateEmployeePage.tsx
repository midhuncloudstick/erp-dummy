
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Upload, User } from 'lucide-react';
import { toast } from 'sonner';
import { employeeService } from '@/services/employeeService';

 const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    roleId: 1, // Default role ID
    departmentId: 1, // Default department ID
    companyId: 1, // Default company ID
    email: '',
    phoneNumber: '',
    address: '',
    isActive: true,
    joinDate: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      // Create a preview URL for display
      const reader = new FileReader();
      reader.onload = (e) => {
        // We'll use this for preview, but send the actual file to API
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for API
      const formDataToSend = new FormData();
      
      // Add the employee data as JSON string
      const joinDateISO = formData.joinDate
        ? new Date(`${formData.joinDate}T08:15:00Z`).toISOString()
        : new Date().toISOString();
      const employeeData = {
        full_name: formData.fullName,
        role_id: Number(formData.roleId),
        department_id: Number(formData.departmentId),
        company_id: Number(formData.companyId),
        email: formData.email,
        phone_number: formData.phoneNumber,
        address: formData.address,
        is_active: formData.isActive,
        join_date: joinDateISO,
      };
      
      formDataToSend.append('data', JSON.stringify(employeeData));
      
      // Add profile picture if selected
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      // Call the API
      const response = await employeeService.createEmployee(formDataToSend);
      
      if (response.success) {
        toast.success('Employee created successfully!');
        navigate('/employees');
      } else {
        toast.error(response.message || 'Failed to create employee');
      }
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast.error(error.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/employees')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Add New Employee</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  {profilePicture ? (
                    <AvatarImage src={URL.createObjectURL(profilePicture)} alt="Profile" />
                  ) : (
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <Label htmlFor="profilePic" className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Upload Profile Picture</span>
                    </div>
                  </Label>
                  <Input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="roleId">Role ID *</Label>
                  <Input
                    id="roleId"
                    name="roleId"
                    type="number"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    placeholder="e.g., 1 for Manager"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="departmentId">Department ID *</Label>
                  <Input
                    id="departmentId"
                    name="departmentId"
                    type="number"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    placeholder="e.g., 1 for Support"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1-555-0123"
                  />
                </div>

                <div>
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input
                    id="joinDate"
                    name="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/employees')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Employee'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateEmployeePage;
