
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Trash2, Tag, Percent, DollarSign } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableServices: string[];
  expirationDate: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
}

// Mock coupon data
const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'NEWCLIENT20',
    description: '20% off for new clients',
    discountType: 'percentage',
    discountValue: 20,
    applicableServices: ['Server Management', 'Website Development'],
    expirationDate: '2024-12-31',
    isActive: true,
    usageCount: 15,
    maxUsage: 100
  },
  {
    id: '2',
    code: 'SAVE50',
    description: '$50 off any service',
    discountType: 'fixed',
    discountValue: 50,
    applicableServices: ['All Services'],
    expirationDate: '2024-06-30',
    isActive: true,
    usageCount: 8,
    maxUsage: 50
  },
  {
    id: '3',
    code: 'EXPIRED10',
    description: '10% off - expired',
    discountType: 'percentage',
    discountValue: 10,
    applicableServices: ['Server Management'],
    expirationDate: '2024-01-15',
    isActive: false,
    usageCount: 25,
    maxUsage: 100
  }
];

const CouponsPage = () => {
  const [coupons] = useState<Coupon[]>(mockCoupons);
  const navigate = useNavigate();

  const getDiscountDisplay = (coupon: Coupon) => {
    return coupon.discountType === 'percentage' 
      ? `${coupon.discountValue}%` 
      : `$${coupon.discountValue}`;
  };

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
                <p className="text-gray-600 mt-1">Manage discount coupons for your services</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/coupons/create')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Coupon
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              All Coupons
            </CardTitle>
            <CardDescription>
              View and manage all discount coupons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Applicable Services</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">
                      {coupon.code}
                    </TableCell>
                    <TableCell>{coupon.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {coupon.discountType === 'percentage' ? (
                          <Percent className="h-4 w-4 mr-1 text-green-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 mr-1 text-blue-600" />
                        )}
                        {getDiscountDisplay(coupon)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {coupon.applicableServices.slice(0, 2).map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {coupon.applicableServices.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{coupon.applicableServices.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {coupon.usageCount}
                        {coupon.maxUsage && ` / ${coupon.maxUsage}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${isExpired(coupon.expirationDate) ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(coupon.expirationDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={coupon.isActive && !isExpired(coupon.expirationDate) ? "default" : "secondary"}
                        className={
                          coupon.isActive && !isExpired(coupon.expirationDate)
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {coupon.isActive && !isExpired(coupon.expirationDate) ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/coupons/edit/${coupon.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CouponsPage;
