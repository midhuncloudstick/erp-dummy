import { api } from './EventServices';

export interface PayPalSubscriptionRequest {
  customer: {
    phone_number?: string;
    company_name?: string;
    city: string;
    zip_code?: string;
    address?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  provider: 'paypal' | 'stripe';
  payment_type: 'onetime' | 'recurring';
  recurring_type?: 'monthly' | 'yearly'; // Required when payment_type is 'recurring'
  service_id: string;
  quantity: string;
  payment_method_id?: string;
  // Optional legacy payload; no longer needed for server care flow
  server_details?: Array<{
    ip_address: string;
    hostname: string;
    root_password: string;
    control_panel: string;
  }>;
  // New: dynamic values captured from service custom fields - now nested arrays
  custom_details?: Array<Array<{
    field_id: string;
    field_name: string;
    field_value: string;
  }>>;
}

export interface PayPalSubscriptionResponse {
  approval_url: string;
  success: boolean;
}

export interface StripeSubscriptionResponse {
  success: boolean;
  message?: string;
  client_secret?: string;
  checkout_url?: string;
}

class PaymentService {
  // Helper method to get user ID from localStorage
  private getUserId(): number {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
      throw new Error('User not found in localStorage');
    } catch (error) {
      console.error('Error getting user ID from localStorage:', error);
      throw new Error('User authentication required');
    }
  }

  async createPayPalSubscription(data: PayPalSubscriptionRequest): Promise<PayPalSubscriptionResponse> {
    try {
      const userId = this.getUserId();
      const response = await api.postEvents(`/customers/${userId}/service`, data);
      const raw = response.data as any;
      const approvalUrl = raw?.approval_url || raw?.response?.approval_url || raw?.checkout_url;
      const success = typeof raw?.success === 'boolean' ? raw.success : Boolean(approvalUrl);
      return { success, approval_url: approvalUrl } as PayPalSubscriptionResponse;
    } catch (error: any) {
      console.error('Error creating PayPal subscription:', error);
      // Extract meaningful error message from response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create PayPal subscription';
      throw new Error(errorMessage);
    }
  }

  async createStripeSubscription(data: Omit<PayPalSubscriptionRequest, 'provider'> & { provider: 'stripe' }): Promise<StripeSubscriptionResponse> {
    try {
      const userId = this.getUserId();
      const response = await api.postEvents(`/customers/${userId}/service`, data);
      const raw = response.data as any;
      const message = raw?.message || raw?.response?.message;
      const clientSecret = raw?.client_secret || raw?.response?.client_secret;
      const checkoutUrl = raw?.checkout_url || raw?.response?.checkout_url;
      const redirectUrl = raw?.redirectUrl || raw?.response?.redirectUrl;
      const success = typeof raw?.success === 'boolean' ? raw.success : Boolean(message || clientSecret || checkoutUrl || redirectUrl);
      return { success, message, client_secret: clientSecret, checkout_url: checkoutUrl } as StripeSubscriptionResponse;
    } catch (error: any) {
      console.error('Error creating Stripe subscription:', error);
      // Extract meaningful error message from response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create Stripe subscription';
      throw new Error(errorMessage);
    }
  }

  async verifySubscription(subscription_id: string, provider: 'paypal' | 'stripe'): Promise<any> {
    try {
      const userId = this.getUserId();

      // console.log('PaymentService: verifySubscription called with:', subscription_id, provider);
      // POST request to /subscription with subscription_id and provider in payload
      const payload = { 
        subscription_id: subscription_id,
        provider: provider
      };
      // console.log('PaymentService: Making POST request to /subscription with payload:', payload);
      
      const response = await api.postEvents(`/customers/${userId}/subscription`, payload);
      const raw = response.data as any;
      const message = raw?.message || raw?.response?.message || raw?.response?.data || raw?.data;
      const success = typeof raw?.success === 'boolean' ? raw.success : Boolean(message);
      return { success, message };
    } catch (error) {
      // console.error('Error verifying subscription:', error);
      throw error;
    }
  }

  // Helper method to extract subscription ID from Stripe response message
  extractStripeSubscriptionId(message: string): string | null {
    try {
      // Be flexible on casing and phrasing, e.g. "Subscription ID:" or "subscription id:" or "subscription id:"
      const match = message.match(/subscription\s*id:\s*([^\s]+)/i);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting Stripe subscription ID:', error);
      return null;
    }
  }

  // 🔹 Verify PayPal one-time payment
  async verifyOnetime(order_id: string): Promise<any> {
    try {
      const userId = this.getUserId();
      // console.log('PaymentService: verifyOnetime called with:', order_id);
      // POST request to /paypal/onetime with order_id in payload
      const payload = { order_id: order_id };
      // console.log('PaymentService: Making POST request to /paypal/onetime with payload:', payload);
      
      const response = await api.postEvents(`/customers/${userId}/paypal/onetime`, payload);
      // console.log('PaymentService: verifyOnetime response:', response);
      return response.data;
    } catch (error) {
      // console.error('Error verifying PayPal one-time payment:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
