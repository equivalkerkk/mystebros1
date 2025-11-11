import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FAQ } from './FAQ';
import { Features } from './Features';
import { PaymentButtons } from './PaymentButtons';

const BASE_PRICE_USD = 299.99;
const ORIGINAL_PRICE_USD = 599.99;

export const PricingCard: React.FC = () => {
  const { t, currency, convertPrice, formatPrice } = useLanguage();
  
  const convertedPrice = convertPrice(BASE_PRICE_USD);
  const convertedOriginal = convertPrice(ORIGINAL_PRICE_USD);
  const [whole, decimal] = convertedPrice.split('.');

  return (
    <div className="card">
              <div className="card-header">
                <div className="card-title-wrapper">
                  <div className="card-brand">REKTNOW'S</div>
                  <div className="card-title">
                    Mass Report Panel
                  </div>
                </div>
                <div className="card-subtitle">{t.cardSubtitle}</div>
              </div>

              <div className="price-section">
                <div className="original-price">
                  {currency.symbol}{formatPrice(convertedOriginal)} <span className="discount-badge">55% OFF</span>
                </div>
                <div className="price-badge">
                  <span className="price-currency">{currency.symbol}</span>
                  <span className="price">{whole}</span>
                  <span className="price-decimal">.{decimal || '00'}</span>
                </div>
                <div className="price-desc">{t.priceDesc}</div>
              </div>

              <FAQ />

              <Features />

              <div className="purchase-info-box">
                <div className="purchase-info-icon">→</div>
                <div className="purchase-info-content">
                  <div className="purchase-info-title">Get Started Now</div>
                  <div className="purchase-info-text">{t.purchaseInfo}</div>
                </div>
              </div>

              <PaymentButtons price={convertedPrice} currency={currency} />

              <div className="payment-info">
                <svg className="payment-wallet-icon" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M461.2 128H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h384c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h397.2c28.02 0 50.8-21.53 50.8-48V176c0-26.47-22.78-48-50.8-48zM416 336c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"/>
                </svg>
                <span>{t.paymentInfo}</span>
              </div>

              <div className="refund-guarantee">
                <span className="refund-guarantee-icon">⚡</span>
                <span>{t.refundInfo}</span>
              </div>
    </div>
  );
};
