# BTC Futures Trading Signal Generator

A professional web application for generating real-time BTC/USDT perpetual futures trading signals using Binance USDT-Margined Futures API.

## 🚨 IMPORTANT: API Setup Required

**This application requires valid Binance API credentials to function. Follow the setup instructions below before running the application.**

## Features

### 🚀 Real-Time Futures Data
- Live BTCUSDT perpetual contract data from Binance Futures API
- Real-time WebSocket streams for price, funding rate, and market data
- Mark price, funding rate, and open interest tracking
- Support for both production and testnet environments

### 📊 Advanced Signal Generation
- Smart Money Concepts (SMC) analysis
- Elliott Wave pattern recognition
- RSI divergence detection
- MACD crossover signals
- Break of structure identification
- Funding rate analysis for futures-specific signals
- Open interest confirmation

### 📈 Professional Trading Interface
- Interactive futures chart with real-time updates
- Multiple timeframes (1m, 15m, 1h, 4h, 1d)
- Live market overview with futures-specific metrics
- Signal panel with confidence scoring and risk management
- Strategy backtesting with performance metrics

### ⚡ Futures-Specific Features
- Leverage recommendations (1x-25x)
- Funding rate monitoring and alerts
- Mark price vs index price tracking
- Open interest analysis
- Position size calculations
- Risk management with liquidation price awareness

## 🔧 Setup Instructions (REQUIRED)

### Step 1: Get Binance API Credentials

**For Development/Testing (Recommended):**
1. Visit [Binance Futures Testnet](https://testnet.binancefuture.com/)
2. Create a testnet account (free, no real money required)
3. Generate API keys in the testnet dashboard
4. Copy your testnet API Key and Secret Key

**For Production Trading:**
1. Create a Binance account at [binance.com](https://binance.com)
2. Complete account verification
3. Go to [API Management](https://www.binance.com/en/my/settings/api-management)
4. Create a new API key with the following settings:
   - ✅ **Enable Futures** (REQUIRED)
   - ✅ Enable Reading (for market data)
   - ✅ Enable Spot & Margin Trading (if needed)
   - ❌ Disable Withdrawals (for security)
5. Set IP restrictions for additional security (optional but recommended)

### Step 2: Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholder values with your actual API credentials:

```env
# For Testnet (Recommended for development)
VITE_BINANCE_API_KEY=your_testnet_api_key_here
VITE_BINANCE_API_SECRET=your_testnet_secret_key_here
VITE_BINANCE_TESTNET=true

# For Production (Real trading)
# VITE_BINANCE_API_KEY=your_production_api_key_here
# VITE_BINANCE_API_SECRET=your_production_secret_key_here
# VITE_BINANCE_TESTNET=false
```

### Step 3: Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔍 Troubleshooting Common Issues

### 403 Forbidden Error
If you see "403 Forbidden" errors:

1. **Check API Key Validity**: Ensure your API key and secret are correct
2. **Enable Futures Permission**: Your API key MUST have "Enable Futures" permission
3. **Check IP Restrictions**: If you set IP restrictions, ensure your current IP is whitelisted
4. **Verify Account Status**: Ensure your Binance account is in good standing
5. **Use Testnet**: Switch to testnet for development: `VITE_BINANCE_TESTNET=true`

### WebSocket Connection Errors
If WebSocket connections fail:

1. **Check Network**: Ensure you have a stable internet connection
2. **Firewall Settings**: Check if your firewall is blocking WebSocket connections
3. **API Credentials**: WebSocket issues often relate to the same problems as REST API errors
4. **Try Testnet**: Switch to testnet to isolate the issue

### Environment Variable Issues
If environment variables aren't loading:

1. **File Location**: Ensure `.env` file is in the project root directory
2. **File Name**: Must be exactly `.env` (not `.env.local` or `.env.example`)
3. **Restart Server**: Restart the development server after changing `.env`
4. **No Quotes**: Don't wrap values in quotes in the `.env` file

## API Integration

### Binance USDT-Margined Futures API

**Production URLs:**
- REST API: `https://fapi.binance.com`
- WebSocket: `wss://fstream.binance.com`

**Testnet URLs:**
- REST API: `https://testnet.binancefuture.com`
- WebSocket: `wss://fstream.binancefuture.com`

### Key Endpoints Used

**Market Data (Public):**
- `/fapi/v1/klines` - Candlestick data
- `/fapi/v1/depth` - Order book
- `/fapi/v1/ticker/24hr` - 24hr statistics
- `/fapi/v1/premiumIndex` - Funding rate and mark price
- `/fapi/v1/openInterest` - Open interest data

**Trading (Private - Requires API Keys):**
- `/fapi/v1/order` - Create/cancel orders
- `/fapi/v2/account` - Account information
- `/fapi/v2/positionRisk` - Position data
- `/fapi/v1/leverage` - Change leverage
- `/fapi/v1/marginType` - Change margin type

**WebSocket Streams:**
- `btcusdt@ticker` - 24hr ticker statistics
- `btcusdt@kline_1h` - Kline/candlestick streams
- `btcusdt@markPrice@1s` - Mark price stream
- `btcusdt@depth@100ms` - Order book updates

## 🔒 Security Best Practices

### API Key Security
- **Never commit API keys to version control**
- **Use testnet for development and testing**
- **Set IP restrictions on production API keys**
- **Use minimum required permissions**
- **Regularly rotate API keys**
- **Monitor API key usage**

### Trading Safety
- **Start with testnet trading**
- **Use small position sizes initially**
- **Set stop-loss orders**
- **Never risk more than you can afford to lose**
- **Understand leverage risks**
- **Monitor funding rates**

## Risk Management Features

### Built-in Safety Measures
- Order validation against exchange rules
- Price deviation checks (max 0.3% from mark price)
- Leverage limits (1x-25x with warnings)
- Position size calculations
- Stop-loss and take-profit automation
- Funding rate monitoring

### Risk Warnings
- Futures trading involves substantial risk
- Leverage amplifies both profits and losses
- Never risk more than you can afford to lose
- Signals are for educational purposes only
- Past performance does not guarantee future results

## Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Shadcn/ui** for UI components
- **Lightweight Charts** for professional trading charts
- **React Query** for data fetching and caching

### Real-Time Data
- **WebSocket connections** for live market data
- **Automatic reconnection** with exponential backoff
- **Data validation** and error handling
- **Fallback to REST API** when WebSocket fails

### Signal Generation
- **Multi-indicator confluence** for higher accuracy
- **Futures-specific analysis** (funding rate, OI)
- **Confidence scoring** based on signal strength
- **Risk-reward optimization** for better trades

## Development

### Project Structure
```
src/
├── components/trading/     # Trading-specific components
├── hooks/                 # Custom React hooks for API integration
├── services/              # Binance Futures API service layer
├── pages/                 # Main application pages
└── lib/                   # Utility functions
```

### Key Files
- `src/services/binanceFutures.ts` - Main API service
- `src/hooks/useBinanceFuturesWebSocket.ts` - WebSocket integration
- `src/components/trading/FuturesChart.tsx` - Trading chart component
- `src/components/trading/FuturesSignalPanel.tsx` - Signal generation

### Testing
- Use testnet environment for safe testing
- All API calls include comprehensive error handling
- WebSocket connections have automatic reconnection
- Order validation prevents invalid trades

## Deployment

### Environment Variables for Production
```env
VITE_BINANCE_API_KEY=your_production_api_key
VITE_BINANCE_API_SECRET=your_production_api_secret
VITE_BINANCE_TESTNET=false
```

### Build for Production
```bash
npm run build
```

## Support

For issues related to:
- **Binance API**: Check [Binance API Documentation](https://binance-docs.github.io/apidocs/futures/en/)
- **Application bugs**: Create an issue in this repository
- **Trading questions**: Consult with a financial advisor

## Disclaimer

This application is for educational and informational purposes only. It is not financial advice. Trading futures involves substantial risk of loss and is not suitable for all investors. The developers are not responsible for any trading losses incurred while using this application.

Always:
- Do your own research
- Start with small amounts
- Use proper risk management
- Consider consulting with a financial advisor
- Test thoroughly on testnet before using real funds