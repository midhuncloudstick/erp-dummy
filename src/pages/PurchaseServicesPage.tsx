import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchServices } from '@/store/slices/serviceSlice';
import { logout } from '@/store/slices/authSlice';
import { Service } from '@/types/service';
import { toast } from 'sonner';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ClientSidebar } from '../components/ClientSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import ClientHeader from '../components/ClientHeader';
const faqs = [
  {
    question: "What services do you offer?",
    answer: "We offer a comprehensive range of IT services including server management, web development, hosting solutions, and custom software development to meet all your technology needs."
  },
  {
    question: "Do you offer 24/7 support?",
    answer: "Yes, we provide round-the-clock support for all our managed services to ensure your systems are always running smoothly."
  },
  {
    question: "What if I have multiple servers or complex requirements?",
    answer: "We offer custom pricing for larger deployments and complex projects. Contact our sales team to discuss your specific requirements and get a tailored quote."
  },
  {
    question: "How long does it take to resolve issues?",
    answer: "Most issues are resolved within 4-6 hours. Critical issues are prioritized and typically resolved within 1-2 hours."
  },
  {
    question: "Can you handle projects without existing infrastructure?",
    answer: "Yes, our team can work with various configurations and can help you build your technology infrastructure from the ground up."
  }
];

const PurchaseServicesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { services, loading, error } = useAppSelector((state) => state.services);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchServices({ page: 1, limit: 100 })); // Fetch all services
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const categories = ['All', ...Array.from(new Set(services.map(service => service.category.category)))];
  
  const filteredServices = selectedCategory === 'All' 
    ? services.filter(service => service.status === 'active')
    : services.filter(service => service.category.category === selectedCategory && service.status === 'active');

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleGetStarted = (service: Service) => {
    try {
      localStorage.setItem('selectedServiceId', String(service.id));
    } catch {}
    navigate('/order-server-care', { state: { serviceId: service.id } });
  };

  const formatPrice = (service: Service) => {
    if (service.type === 'onetime' && service.one_time_cost) {
      return `${parseFloat(service.one_time_cost).toLocaleString()}`;
    } else if (service.type === 'recurring') {
      if (service.monthly_cost) {
        return `${parseFloat(service.monthly_cost).toLocaleString()}`;
      } else if (service.yearly_cost) {
        return `${parseFloat(service.yearly_cost).toLocaleString()}`;
      }
    }
    return 'Price not set';
  };

  const getBillingType = (service: Service) => {
    if (service.type === 'onetime') {
      return 'one-time';
    } else if (service.type === 'recurring') {
      if (service.monthly_cost) {
        return 'month';
      } else if (service.yearly_cost) {
        return 'year';
      }
    }
    return 'recurring';
  };

  // Get user data for sidebar and header
  const { user, userType } = useAppSelector((state) => state.auth);
  
  const dashboardUser = {
    id: user?.id?.toString() || '1',
    email: user?.email || 'user@example.com',
    name: user?.full_name || 'User',
    full_name: user?.full_name || 'User',
    type: (userType === 'admin' ? 'admin' : 'client') as 'admin' | 'client',
    projects: []
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <ClientSidebar user={dashboardUser} />
            
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <ClientHeader user={dashboardUser} title="Purchase Services" onLogout={handleLogout} />
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Available Services</h2>
                    <p className="text-gray-600 dark:text-gray-300">Choose from our comprehensive range of IT services</p>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Categories Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                      <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-gray-900 dark:text-white">Categories</CardTitle>
                          <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="Search categories..."
                              value={categorySearchTerm}
                              onChange={(e) => setCategorySearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {filteredCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === category
                                  ? 'bg-purple-600 text-white font-medium'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                          {filteredCategories.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">
                              No categories found
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Services Grid */}
                    <div className="flex-1">
                      {loading ? (
                        <div className="flex justify-center items-center py-16">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                          <span className="ml-2 text-gray-600">Loading services...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                          {filteredServices.map((service) => (
                            <Card key={service.id} className={`relative bg-white dark:bg-gray-800 border dark:border-gray-700 transition-all duration-300 hover:shadow-lg`}>
                              <CardHeader className="text-center pb-4">
                                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-4">{service.name}</CardTitle>
                                <div className="mb-4">
                                  <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{formatPrice(service)}</span>
                                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                                    per {getBillingType(service)}
                                  </span>
                                </div>
                              </CardHeader>
                              
                              <CardContent>
                                <ul className="space-y-3 mb-6">
                                  {service.features.map((feature, index) => (
                                    <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                                
                                <Button 
                                  onClick={() => handleGetStarted(service)}
                                  className={`w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-3`}
                                >
                                  Get Started
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* FAQ Section */}
                      <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-2xl text-gray-900 dark:text-white text-center">Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {faqs.map((faq, index) => (
                              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => toggleFAQ(index)}
                                  className="w-full px-6 py-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex justify-between items-center"
                                >
                                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                                  {expandedFAQ === index ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                  )}
                                </button>
                                {expandedFAQ === index && (
                                  <div className="px-6 py-4 bg-white dark:bg-gray-800">
                                    <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
};

export default PurchaseServicesPage;
