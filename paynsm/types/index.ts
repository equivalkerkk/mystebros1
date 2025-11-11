export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
}

export interface PayGateWalletResponse {
  success: boolean;
  wallet_address?: string;
  error?: string;
}

export interface PaymentLinkResponse {
  success: boolean;
  payment_url?: string;
  error?: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  amount?: number;
  currency?: string;
  timestamp?: string;
}

export interface PayGateConfig {
  apiUrl: string;
  checkoutUrl: string;
  walletAddress: string;
  callbackUrl: string;
  affiliateAddress?: string;
} 