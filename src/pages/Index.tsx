
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import LoginForm from '../components/LoginForm';
import { ThemeProvider } from '../contexts/ThemeContext';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If user is already logged in, redirect based on userType
    if (user && userType && !loading) {
      console.log('User already logged in, redirecting:', { userType, user });
      
      // Check if user came from purchase-services page
      const fromPurchaseServices = location.state?.fromPurchaseServices;
      
      if (fromPurchaseServices) {
        console.log('Redirecting to order-server-care after login from purchase services');
        navigate('/order-server-care');
      } else {
        // Redirect based on user type
        if (userType === 'admin') {
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('Redirecting to client dashboard');
          navigate('/dashboard');
        }
      }
    }
  }, [user, userType, loading, navigate, location.state]);

  // Don't render login form if user is already logged in and we're redirecting
  if (user && userType) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <LoginForm />
      </div>
    </ThemeProvider>
  );
};

export default Index;
