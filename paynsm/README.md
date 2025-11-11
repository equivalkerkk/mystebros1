# SM Services - Payment Gateway

Bu uygulama, ödeme sistemi oluşturan Next.js uygulamasıdır. Vercel'de çalışacak şekilde optimize edilmiştir.

## Özellikler

- ✅ Anında ödeme linkı oluşturma
- ✅ KYC gerektirmez
- ✅ Kayıt gerektirmez
- ✅ Yüksek riskli işletmeler için uygun
- ✅ Visa, MasterCard, Apple Pay, Google Pay desteği
- ✅ USDC (Polygon) anında ödemeler
- ✅ Vercel'de kolay deployment

## Kurulum

### 1. Projeyi klonlayın
```bash
git clone <repository-url>
cd sm-services
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Environment variables'ları ayarlayın
Vercel dashboard'da aşağıdaki environment variables'ları ekleyin:

```
PAYGATE_API_URL=https://api.paygate.to
PAYGATE_CHECKOUT_URL=https://checkout.paygate.to
USDC_WALLET_ADDRESS=your_usdc_polygon_wallet_address
CALLBACK_URL=https://your-vercel-app.vercel.app/api/callback
```

### 4. Lokal geliştirme
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacak.

## Vercel'e Deployment

### Otomatik Deployment (Önerilen)
1. GitHub/GitLab/Bitbucket'ta repository oluşturun
2. Kodları push edin
3. [Vercel](https://vercel.com) hesabınızda "New Project" tıklayın
4. Repository'yi seçin ve import edin
5. Environment variables'ları ekleyin
6. Deploy'a tıklayın

### Manuel Deployment
```bash
# Vercel CLI'yi global olarak yükleyin
npm i -g vercel

# Projeyi deploy edin
vercel

# Production'a deploy edin
vercel --prod
```

## Environment Variables

| Variable | Açıklama | Gerekli |
|----------|----------|---------|
| `PAYGATE_API_URL` | Payment Gateway API URL'si | Evet |
| `PAYGATE_CHECKOUT_URL` | Payment Gateway Checkout URL'si | Evet |
| `USDC_WALLET_ADDRESS` | USDC (Polygon) cüzdan adresiniz | Evet |
| `CALLBACK_URL` | Callback URL (Vercel domain'iniz) | Evet |
| `NEXT_PUBLIC_USDC_WALLET_ADDRESS` | Frontend'de kullanılacak wallet adresi | Opsiyonel |

## API Endpoints

### POST /api/create-wallet
Şifreli cüzdan oluşturur.

```json
{
  "callbackUrl": "https://your-app.vercel.app/api/callback",
  "walletAddress": "your_usdc_wallet_address"
}
```

### POST /api/create-payment
Ödeme linkı oluşturur.

```json
{
  "walletAddress": "encrypted_wallet_address",
  "amount": 100,
  "currency": "USD",
  "description": "Test payment",
  "orderId": "order_123"
}
```

### POST /api/callback
Payment gateway'den gelen callback'leri işler.

## Minimum Sipariş Değerleri

Minimum sipariş değerleri için dokümantasyonu inceleyin.

## Desteklenen Para Birimleri

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)

## Güvenlik

- Tüm API çağrıları server-side yapılır
- Sensitive bilgiler environment variables'da saklanır
- Callback'ler validate edilir
- HTTPS zorunlu

## Sorun Giderme

### Yaygın Hatalar

1. **"Wallet address required"**: Environment variables'da `USDC_WALLET_ADDRESS` tanımlanmamış
2. **"Invalid response from payment gateway"**: API timeout veya geçersiz response
3. **"Callback processing failed"**: Callback URL'si yanlış ayarlanmış

### Loglama

Production'da logları görmek için:
```bash
vercel logs
```

## Lisans

MIT

## Destek

Sorularınız için issue açabilirsiniz.

## PayGate.to Hakkında

PayGate.to, yüksek riskli işletmeler için tasarlanmış bir ödeme gateway'idir. Daha fazla bilgi için [PayGate.to](https://paygate.to) ziyaret edin.

## Affiliate Program

PayGate.to affiliate programına katılarak her satıştan komisyon kazanabilirsiniz. Detaylar için [buraya](https://paygate.to/affiliate-white-label/) bakın. 