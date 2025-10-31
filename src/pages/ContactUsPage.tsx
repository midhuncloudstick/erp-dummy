
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Phone, Mail, MapPin, Send } from 'lucide-react';

const ContactUsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <header className="border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/purchase-services')} className="text-white hover:bg-white/10 mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
              <img src="/lovable-uploads/518f19f5-443d-435c-a6c8-889da6f424d4.png" alt="CloudHouse Technologies" className="h-8 w-auto mr-3" />
              <h1 className="text-xl font-semibold text-white">CloudHouse Technologies</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <span className="text-white/80 hover:text-white cursor-pointer">Home</span>
              <span className="text-white/80 hover:text-white cursor-pointer">Services</span>
              <span className="text-white/80 hover:text-white cursor-pointer">Projects</span>
              <span className="text-white/80 hover:text-white cursor-pointer">About Us</span>
              <span className="text-white/80 hover:text-white cursor-pointer">Careers</span>
              <span className="text-white font-medium">Contact Us</span>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <p className="text-blue-400 mb-4">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Have questions or ready to transform your business with our cloud solutions? We're here to help.
          </p>
        </div>

        {/* Contact Form */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-12">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-white mb-2 block">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="service" className="text-white mb-2 block">Select a Service</Label>
                <Select onValueChange={(value) => handleInputChange('service', value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic-care">Basic Care</SelectItem>
                    <SelectItem value="starter-plus">Starter Plus</SelectItem>
                    <SelectItem value="pro-admin">Pro Admin</SelectItem>
                    <SelectItem value="website-design">Website Design</SelectItem>
                    <SelectItem value="custom-development">Custom Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject" className="text-white mb-2 block">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-white mb-2 block">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your project or inquiry..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-32"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent className="p-6">
              <Phone className="h-8 w-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Call Us</h3>
              <p className="text-white/80">0480-27327360</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent className="p-6">
              <Mail className="h-8 w-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Email Us</h3>
              <p className="text-white/80">info@cloudhoustechnologies.com</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent className="p-6">
              <MapPin className="h-8 w-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Global Offices</h3>
              <p className="text-white/80">See our locations below</p>
            </CardContent>
          </Card>
        </div>

        {/* Office Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">Indian Office</h3>
              <div className="space-y-2">
                <p className="text-blue-400 font-medium">CloudHouse</p>
                <p className="text-white/80 text-sm">
                  Special Economic Zone (SEZ)<br />
                  Infopark Thrissur, Nallakotta Road,<br />
                  Koratty, Kerala, India - 680308
                </p>
                <p className="text-white/80 text-sm">
                  <span className="text-blue-400">Time:</span> 6:30 AM - 6:30 PM (GMT), Monday - Friday
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">U.S Office</h3>
              <div className="space-y-2">
                <p className="text-blue-400 font-medium">CloudHouse LLC</p>
                <p className="text-white/80 text-sm">
                  30 N Gould ST STE R Sheridan,<br />
                  Wyoming 82801,<br />
                  United States
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
