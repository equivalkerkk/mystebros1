/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    PAYGATE_API_URL: process.env.PAYGATE_API_URL || 'https://api.paygate.to',
    PAYGATE_CHECKOUT_URL: process.env.PAYGATE_CHECKOUT_URL || 'https://checkout.paygate.to',
    USDC_WALLET_ADDRESS: process.env.USDC_WALLET_ADDRESS || '0x02DAbee56F9968CCA289B557Adea079212A5f8f1',
    CALLBACK_URL: process.env.CALLBACK_URL || 'http://localhost:3000/api/callback',
    NEXT_PUBLIC_USDC_WALLET_ADDRESS: process.env.NEXT_PUBLIC_USDC_WALLET_ADDRESS || '0x02DAbee56F9968CCA289B557Adea079212A5f8f1'
  }
}

module.exports = nextConfig 