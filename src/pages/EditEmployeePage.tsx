import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Upload, User } from 'lucide-react';
import { toast } from 'sonner';
import { employeeService } from '@/services/employeeService';

 const EditEmployeePage = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    profilePic: '',
    fullName: '',
    roleId: 1,
    departmentId: 1,
    email: '',
    phoneNumber: '',
    address: '',
    joinDate: ''
  });

  useEffect(() => {
    const loadEmployee = async () => {
      if (!employeeId) return;
      try {
        const res = await employeeService.getEmployeeById(Number(employeeId));
        if (res.success && res.response.data) {
          const e = res.response.data;
          setFormData({
            profilePic: e.profile_pic || '',
            fullName: e.full_name || '',
            roleId: e.role_id || 1,
            departmentId: e.department_id || 1,
            email: e.email || '',
            phoneNumber: e.phone_number || '',
            address: e.address || '',
            // convert ISO to yyyy-mm-dd for date input
            joinDate: e.join_date ? new Date(e.join_date).toISOString().slice(0, 10) : ''
          });
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load employee');
      }
    };
    loadEmployee();
  }, [employeeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roleId' || name === 'departmentId' ? Number(value) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

     setIsSubmitting(true);
    try {
      const payload = new FormData();
      const joinDateISO = formData.joinDate ? new Date(`${formData.joinDate}T08:15:00Z`).toISOString() : new Date().toISOString();
    
      const dataObj = {
        full_name: formData.fullName,
        role_id: formData.roleId,
        department_id: formData.departmentId,
        email: formData.email,
        phone_number: formData.phoneNumber,
        address: formData.address,
        is_active: true,
        join_date: joinDateISO,
      };
  
      payload.append('data', JSON.stringify(dataObj));
  
      if (profilePicture) {
        payload.append('profile_picture', profilePicture);
      }  // payload.append('full_name', formData.fullName);
      // payload.append('role_id', String(formData.roleId));
      // payload.append('department_id', String(formData.departmentId));
      // payload.append('email', formData.email);
      // payload.append('phone_number', formData.phoneNumber);
      // payload.append('address', formData.address);
      // payload.append('is_active', 'true'); // is_active is a boolean, so send it as a string
      // payload.append('join_date', joinDateISO);
      // if (profilePicture) payload.append('profile_picture', profilePicture);

      // // TODO: replace adminId retrieval with actual logged-in admin id
      const adminId = 1;
      console.log("Hi Midhun")
      console.log(payload)

      const res = await employeeService.updateEmployee(Number(employeeId), adminId, payload);
      if (res.success) {
        toast.success('Employee updated successfully!');
        navigate('/employees');
      } else {
        toast.error(res.message || 'Failed to update employee');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update employee');
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
            <h1 className="text-xl font-semibold text-gray-900">Edit Employee</h1>
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
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.profilePic || (profilePicture ? URL.createObjectURL(profilePicture) : '')} alt="Profile" />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profilePic" className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Change Profile Picture</span>
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
                  <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="roleId">Role ID *</Label>
                  <Input id="roleId" name="roleId" type="number" value={formData.roleId} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="departmentId">Department ID *</Label>
                  <Input id="departmentId" name="departmentId" type="number" value={formData.departmentId} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input id="joinDate" name="joinDate" type="date" value={formData.joinDate} onChange={handleInputChange} />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" type="text" value={formData.address} onChange={handleInputChange} />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate('/employees')}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Employee'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditEmployeePage;
