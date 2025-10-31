
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Tag, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  category: string;
}

// Mock services data
const mockServices: Service[] = [
  { id: '1', name: 'Server Management', category: 'Infrastructure' },
  { id: '2', name: 'Website Development', category: 'Development' },
  { id: '3', name: 'Mobile App Development', category: 'Development' },
  { id: '4', name: 'Database Management', category: 'Infrastructure' },
  { id: '5', name: 'Cloud Migration', category: 'Infrastructure' },
  { id: '6', name: 'Security Audit', category: 'Security' },
  { id: '7', name: 'SEO Optimization', category: 'Marketing' },
  { id: '8', name: 'Content Management', category: 'Content' }
];

const CreateCouponPage = () => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: '',
    discountValue: '',
    expirationDate: '',
    maxUsage: '',
    isActive: true
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectAllServices, setSelectAllServices] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSelectAllServices = (checked: boolean) => {
    setSelectAllServices(checked);
    if (checked) {
      setSelectedServices(mockServices.map(service => service.id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.description || !formData.discountType || !formData.discountValue) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (selectedServices.length === 0 && !selectAllServices) {
      toast({
        title: "Error",
        description: "Please select at least one service or select all services.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save the coupon to your backend
    console.log('Creating coupon:', {
      ...formData,
      applicableServices: selectAllServices ? ['All Services'] : selectedServices
    });

    toast({
      title: "Success",
      description: "Coupon created successfully!",
    });

    navigate('/coupons');
  };

  const groupedServices = mockServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/coupons')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Coupons
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Coupon</h1>
              <p className="text-gray-600 mt-1">Create a new discount coupon for your services</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Coupon Details
              </CardTitle>
              <CardDescription>
                Enter the basic information for your coupon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., SAVE20, NEWCLIENT"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select value={formData.discountType} onValueChange={(value) => handleInputChange('discountType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the coupon"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange('discountValue', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsage">Max Usage (Optional)</Label>
                  <Input
                    id="maxUsage"
                    type="number"
                    placeholder="100"
                    value={formData.maxUsage}
                    onChange={(e) => handleInputChange('maxUsage', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applicable Services</CardTitle>
              <CardDescription>
                Select which services this coupon can be applied to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-services"
                  checked={selectAllServices}
                  onCheckedChange={handleSelectAllServices}
                />
                <Label htmlFor="all-services" className="font-medium">
                  Apply to All Services
                </Label>
              </div>

              {!selectAllServices && (
                <div className="space-y-4">
                  {Object.entries(groupedServices).map(([category, services]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-gray-900">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`service-${service.id}`}
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={() => handleServiceToggle(service.id)}
                            />
                            <Label htmlFor={`service-${service.id}`} className="text-sm">
                              {service.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/coupons')}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCouponPage;
