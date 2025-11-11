import { NextApiRequest, NextApiResponse } from 'next';
import { PaymentLinkResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentLinkResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      walletAddress, 
      amount, 
      currency, 
      description, 
      orderId,
      customerEmail,
      customerName 
    } = req.body;

    if (!walletAddress || !amount || !currency || !orderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address, amount, currency, and order ID are required' 
      });
    }

    // PayGate.to checkout URL
    const checkoutUrl = process.env.PAYGATE_CHECKOUT_URL || 'https://checkout.paygate.to';
    const endpoint = `${checkoutUrl}/process-payment.php`;

    const params = new URLSearchParams({
      wallet: walletAddress,
      amount: amount.toString(),
      currency: currency,
      order_id: orderId,
      ...(description && { description }),
      ...(customerEmail && { customer_email: customerEmail }),
      ...(customerName && { customer_name: customerName })
    });

    const paymentUrl = `${endpoint}?${params.toString()}`;

    return res.status(200).json({
      success: true,
      payment_url: paymentUrl
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create payment link'
    });
  }
} 