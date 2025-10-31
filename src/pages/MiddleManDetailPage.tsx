
import { useState } from 'react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { middlemanService } from '@/services/middlemanService';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, Phone, MapPin, User, FileText } from 'lucide-react';

const MiddleManDetailPage = () => {
  const navigate = useNavigate();
  const { middleManId } = useParams();

  // Mock middle man data
  const [middleMan] = useState({
    id: 1,
    name: 'Robert Johnson',
    phoneNumber: '+1-555-0001',
    email: 'robert@example.com',
    address: '123 Business Ave, New York, NY'
  });

  // Mock lead history
  const [leadHistory] = useState([
    {
      id: 'L001',
      companyName: 'TechCorp Solutions',
      contactPerson: 'John Smith',
      product: 'CRM System',
      status: 'active',
      createdDate: '2024-01-10'
    },
    {
      id: 'L002',
      companyName: 'Green Energy Ltd',
      contactPerson: 'Sarah Johnson',
      product: 'Website Development',
      status: 'converted',
      createdDate: '2024-01-05'
    },
    {
      id: 'L003',
      companyName: 'Retail Plus',
      contactPerson: 'Mike Davis',
      product: 'E-commerce Platform',
      status: 'pending',
      createdDate: '2023-12-28'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      case 'disqualified':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/middleman')}
                className="text-white hover:bg-white/10 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Middle Men
              </Button>
              <img 
                src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" 
                alt="CloudHouse Technologies" 
                className="h-8 w-auto mr-3"
              />
              <h1 className="text-xl font-semibold text-white">Middle Man Details</h1>
            </div>
            <Button
              onClick={() => navigate(`/middleman/edit/${middleManId}`)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Middle Man
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Middle Man Information */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <User className="h-5 w-5 mr-2 text-orange-600" />
                  {middleMan.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm">{middleMan.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm">{middleMan.phoneNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm">{middleMan.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead History */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <FileText className="h-5 w-5 mr-2 text-orange-600" />
                  Lead History ({leadHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadHistory.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium text-blue-600">
                            {lead.id}
                          </TableCell>
                          <TableCell>{lead.companyName}</TableCell>
                          <TableCell>{lead.contactPerson}</TableCell>
                          <TableCell>{lead.product}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(lead.createdDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MiddleManDetailPage;
