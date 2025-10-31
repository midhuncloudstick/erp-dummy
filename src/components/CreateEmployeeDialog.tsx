import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, User } from 'lucide-react';
import { toast } from 'sonner';
import { employeeService } from '@/services/employeeService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { roleService } from '@/services/roleService';
import { departmentService } from '@/services/departmentService';
import type { Role, Department } from '@/types/role';

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export default function CreateEmployeeDialog({ open, onOpenChange, onCreated }: CreateEmployeeDialogProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    roleId: 1,
    departmentId: 1,
    companyId: 1,
    email: '',
    phoneNumber: '',
    address: '',
    isActive: true,
    joinDate: '',
    salary: '',
    employmentType: 'permanent' as 'permanent' | 'intern',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!open) return;
    const loadData = async () => {
      try {
        const [rolesRes, deptRes] = await Promise.all([
          roleService.listRoles(true),
          departmentService.listDepartments(true),
        ]);
        const normalize = (res: any) => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.message?.data)) return res.message.data;
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.data?.data)) return res.data.data;
          return [];
        };
        const r = normalize(rolesRes);
        const d = normalize(deptRes);
        setRoles(r as Role[]);
        setDepartments(d as Department[]);
        if (r.length) setFormData((p) => ({ ...p, roleId: r[0].id }));
        if (d.length) setFormData((p) => ({ ...p, departmentId: d[0].id }));
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Failed to load roles/departments');
      }
    };
    loadData();
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePicture(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.salary || !formData.employmentType) {
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
      const body = new FormData();
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
        salary: String(formData.salary),
        employment_type: formData.employmentType,
      };
      body.append('data', JSON.stringify(employeeData));
      if (profilePicture) body.append('profile_picture', profilePicture);

      const response = await employeeService.createEmployee(body);
      if (response.success) {
        toast.success('Employee created successfully!');
        onOpenChange(false);
        onCreated?.();
        setFormData({
          fullName: '', roleId: 1, departmentId: 1, companyId: 1,
          email: '', phoneNumber: '', address: '', isActive: true, joinDate: '', salary: '', employmentType: 'permanent'
        });
        setProfilePicture(null);
      } else {
        toast.error(response.message || 'Failed to create employee');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload Profile Picture</span>
                </div>
              </Label>
              <Input id="profilePic" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>Role *</Label>
              <Select value={String(formData.roleId)} onValueChange={(val) => setFormData(p => ({ ...p, roleId: Number(val) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department *</Label>
              <Select value={String(formData.departmentId)} onValueChange={(val) => setFormData(p => ({ ...p, departmentId: Number(val) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+1-555-0123" />
            </div>
            <div>
              <Label htmlFor="joinDate">Join Date</Label>
              <Input id="joinDate" name="joinDate" type="date" value={formData.joinDate} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="salary">Salary *</Label>
              <Input id="salary" name="salary" type="number" value={formData.salary} onChange={handleInputChange} placeholder="Enter salary" required />
            </div>
            <div>
              <Label>Employment Type *</Label>
              <Select value={formData.employmentType} onValueChange={(val) => setFormData(p => ({ ...p, employmentType: val as 'permanent' | 'intern' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">permanent</SelectItem>
                  <SelectItem value="intern">intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" type="text" value={formData.address} onChange={handleInputChange} placeholder="Full address" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
