# BTC Futures Trading Signal Generator

A professional web application for generating real-time BTC/USDT perpetual futures trading signals using Binance USDT-Margined Futures API.

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

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
# Binance Futures API Configuration
VITE_BINANCE_API_KEY=your_binance_api_key_here
VITE_BINANCE_API_SECRET=your_binance_api_secret_here

# Environment Configuration (set to true for testnet)
VITE_BINANCE_TESTNET=false
```

### 2. API Key Setup

1. Create a Binance account at [binance.com](https://binance.com)
2. Go to API Management in your account settings
3. Create a new API key with futures trading permissions
4. **Important**: Enable "Enable Futures" permission
5. Add your API key and secret to the `.env` file

**For Testnet (Recommended for Development):**
1. Visit [testnet.binancefuture.com](https://testnet.binancefuture.com)
2. Create a testnet account
3. Generate testnet API keys
4. Set `VITE_BINANCE_TESTNET=true` in your `.env` file

### 3. Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Security Considerations

- **Never commit API keys to version control**
- Use testnet for development and testing
- Implement proper IP restrictions on your API keys
- Use read-only permissions for market data features
- Only enable trading permissions when necessary

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