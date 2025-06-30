# BTC Futures Trading Signal Generator

A professional web application for generating real-time BTC/USDT perpetual futures trading signals using Binance USDT-Margined Futures **Public API**.

## 🚀 Features

### 📊 Real-Time Futures Data
- Live BTCUSDT perpetual contract data from Binance Futures Public API
- Real-time WebSocket streams for price, funding rate, and market data
- Mark price, funding rate, and open interest tracking
- **No API keys required** - uses only public endpoints

### 📈 Advanced Signal Generation
- Smart Money Concepts (SMC) analysis
- Elliott Wave pattern recognition
- RSI divergence detection
- MACD crossover signals
- Break of structure identification
- Funding rate analysis for futures-specific signals
- Open interest confirmation

### 🎯 Professional Trading Interface
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

## 🔧 Quick Start

### No Setup Required!
This application uses **only public Binance API endpoints** - no API keys or authentication needed.

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

That's it! The application will automatically connect to Binance's public futures API and start displaying real-time data.

## 📡 API Integration

### Binance USDT-Margined Futures Public API

**Production URLs:**
- REST API: `https://fapi.binance.com`
- WebSocket: `wss://fstream.binance.com`

**Testnet URLs:**
- REST API: `https://testnet.binancefuture.com`
- WebSocket: `wss://fstream.binance.com`

### Public Endpoints Used

**Market Data (No Authentication Required):**
- `/fapi/v1/klines` - Candlestick data
- `/fapi/v1/ticker/price` - Current price
- `/fapi/v1/depth` - Order book
- `/fapi/v1/ticker/24hr` - 24hr statistics
- `/fapi/v1/premiumIndex` - Funding rate and mark price
- `/fapi/v1/openInterest` - Open interest data
- `/fapi/v1/exchangeInfo` - Exchange information
- `/fapi/v1/trades` - Recent trades
- `/fapi/v1/aggTrades` - Aggregate trades
- `/fapi/v1/fundingRate` - Funding rate history

**WebSocket Streams:**
- `btcusdt@ticker` - 24hr ticker statistics
- `btcusdt@kline_1m` - 1-minute kline/candlestick streams
- `btcusdt@markPrice@1s` - Mark price stream
- `btcusdt@depth@100ms` - Order book updates
- `btcusdt@aggTrade` - Aggregate trade streams

## 🌐 Environment Configuration

### Optional: Switch Between Production and Testnet

Create a `.env` file in the root directory to configure the environment:

```env
# Use testnet endpoints (optional)
VITE_BINANCE_TESTNET=false

# Set to true to use testnet endpoints
# VITE_BINANCE_TESTNET=true
```

**Default:** Production endpoints are used if no `.env` file is present.

## 🔍 Features Overview

### Real-Time Market Data
- **Live Price Updates**: Real-time BTCUSDT price from WebSocket
- **24h Statistics**: Volume, high, low, price change
- **Funding Rate**: Current funding rate and next funding time
- **Mark Price**: Futures mark price vs spot price
- **Open Interest**: Current open interest data
- **Order Book**: Live bid/ask data

### Advanced Analytics
- **Price Charts**: Interactive candlestick charts with multiple timeframes
- **Technical Indicators**: RSI, Moving Averages, Volatility
- **Market Sentiment**: Long/short ratios and trader positioning
- **Funding Analysis**: Historical funding rates and trends
- **Volume Analysis**: Trading volume and liquidity metrics

### Signal Generation
- **Multi-Timeframe Analysis**: Signals across different timeframes
- **Confluence Trading**: Multiple indicator confirmation
- **Risk Management**: Automated stop-loss and take-profit levels
- **Confidence Scoring**: Signal strength based on multiple factors
- **Futures-Specific**: Funding rate and open interest analysis

## 🛠 Technical Architecture

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
- **Rate limiting compliance**

### API Integration
- **Public endpoints only** - no authentication required
- **Automatic retry logic** for failed requests
- **Error handling** with user-friendly messages
- **Caching** for optimal performance

## 📊 Data Sources

All data comes directly from Binance's official Futures API:

- **Price Data**: Real-time and historical price information
- **Volume Data**: Trading volume and liquidity metrics
- **Funding Rates**: Current and historical funding rates
- **Open Interest**: Futures contract open interest
- **Order Book**: Live market depth data
- **Trade Data**: Recent and aggregate trade information

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
# Optional: Use testnet endpoints
VITE_BINANCE_TESTNET=false
```

## 📈 Usage

1. **Start the Application**: Run `npm run dev`
2. **View Real-Time Data**: The dashboard automatically loads live market data
3. **Analyze Charts**: Use the interactive charts to analyze price movements
4. **Monitor Signals**: Watch the signal panel for trading opportunities
5. **Track Funding**: Monitor funding rates and open interest
6. **Backtest Strategies**: Use the strategy tester to evaluate performance

## 🔒 Security & Compliance

- **No API Keys Required**: Uses only public endpoints
- **Rate Limiting**: Respects Binance API rate limits
- **Error Handling**: Graceful handling of API errors
- **Data Validation**: All incoming data is validated
- **CORS Compliance**: Proper cross-origin request handling

## ⚠️ Risk Disclaimer

This application is for **educational and informational purposes only**. It is not financial advice. Trading futures involves substantial risk of loss and is not suitable for all investors.

**Important Notes:**
- Futures trading involves substantial risk
- Leverage amplifies both profits and losses
- Never risk more than you can afford to lose
- Signals are for educational purposes only
- Past performance does not guarantee future results
- Always do your own research
- Consider consulting with a financial advisor

## 🆘 Support

For issues related to:
- **Binance API**: Check [Binance API Documentation](https://binance-docs.github.io/apidocs/futures/en/)
- **Application bugs**: Create an issue in this repository
- **Trading questions**: Consult with a financial advisor

## 📝 License

This project is for educational purposes. Please ensure compliance with Binance's Terms of Service when using their API.