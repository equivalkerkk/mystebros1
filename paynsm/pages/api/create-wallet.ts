import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { PayGateWalletResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PayGateWalletResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { callbackUrl, walletAddress, affiliateAddress } = req.body;

    if (!callbackUrl || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Callback URL and wallet address are required' 
      });
    }

    // PayGate.to wallet creation API endpoint
    const apiUrl = process.env.PAYGATE_API_URL || 'https://api.paygate.to';
    const endpoint = `${apiUrl}/control/wallet.php`;

    const params = new URLSearchParams({
      callback: callbackUrl,
      wallet: walletAddress,
      ...(affiliateAddress && { affiliate: affiliateAddress })
    });

    const response = await axios.get(`${endpoint}?${params.toString()}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'PayGate-Vercel-App/1.0',
        'Accept': 'application/json'
      }
    });

    // PayGate.to returns the encrypted wallet address as text
    const encryptedWallet = response.data;

    if (encryptedWallet && typeof encryptedWallet === 'string') {
      return res.status(200).json({
        success: true,
        wallet_address: encryptedWallet.trim()
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Invalid response from PayGate.to API'
      });
    }

  } catch (error) {
    console.error('Error creating PayGate wallet:', error);
    
    if (axios.isAxiosError(error)) {
      return res.status(500).json({
        success: false,
        error: `API Error: ${error.response?.status} - ${error.response?.statusText}`
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create PayGate wallet'
    });
  }
} 