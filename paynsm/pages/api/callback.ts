import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // PayGate.to callback data
    const callbackData = req.body;
    
    console.log('PayGate.to Callback received:', callbackData);
    
    // Here you can process the payment notification
    // Example data structure (you may need to adjust based on PayGate.to actual response):
    // {
    //   transaction_id: 'xxx',
    //   amount: '100.00',
    //   currency: 'USD',
    //   status: 'completed',
    //   order_id: 'order_123',
    //   wallet_address: 'encrypted_wallet_address'
    // }

    // Validate the callback data
    if (callbackData.status === 'completed') {
      console.log('Payment completed successfully:', {
        transactionId: callbackData.transaction_id,
        amount: callbackData.amount,
        currency: callbackData.currency,
        orderId: callbackData.order_id
      });
      
      // Here you can:
      // 1. Update your database with payment status
      // 2. Send confirmation email to customer
      // 3. Trigger fulfillment process
      // 4. Update inventory
      
      // Example: Update payment status in your database
      // await updatePaymentStatus(callbackData.order_id, 'completed');
    } else if (callbackData.status === 'failed') {
      console.log('Payment failed:', {
        orderId: callbackData.order_id,
        reason: callbackData.reason || 'Unknown error'
      });
      
      // Handle failed payment
      // await updatePaymentStatus(callbackData.order_id, 'failed');
    }

    // Always respond with 200 OK to acknowledge receipt
    return res.status(200).json({ 
      success: true, 
      message: 'Callback processed successfully' 
    });

  } catch (error) {
    console.error('Error processing callback:', error);
    
    // Still return 200 to prevent PayGate.to from retrying
    return res.status(200).json({ 
      success: false, 
      error: 'Callback processing failed' 
    });
  }
} 