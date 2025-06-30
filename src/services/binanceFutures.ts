// Binance Futures Public API Service
// Uses only public endpoints - no authentication required

// Base URLs for public API endpoints
const PRODUCTION_BASE_URL = 'https://fapi.binance.com';
const TESTNET_BASE_URL = 'https://testnet.binancefuture.com';

// WebSocket URLs for real-time data
const PRODUCTION_WS_URL = 'wss://fstream.binance.com';
const TESTNET_WS_URL = 'wss://fstream.binance.com'; // Same for testnet

// Get current environment setting (defaults to production for public API)
const isTestnet = import.meta.env.VITE_BINANCE_TESTNET === 'true';
const BASE_URL = isTestnet ? TESTNET_BASE_URL : PRODUCTION_BASE_URL;
export const WS_BASE_URL = isTestnet ? TESTNET_WS_URL : PRODUCTION_WS_URL;

// Generic API request function for public endpoints only
const apiRequest = async (
  endpoint: string,
  method: 'GET' = 'GET',
  params: Record<string, any> = {}
): Promise<any> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };

  let url = `${BASE_URL}${endpoint}`;
  
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  const environment = isTestnet ? 'TESTNET' : 'PRODUCTION';
  console.log(`🔄 Binance Futures Public API ${method} ${endpoint} [${environment}]`, { params });

  try {
    const response = await fetch(url, {
      method,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Provide specific error messages for common issues
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Please wait before making more requests.`);
      }
      
      if (response.status >= 500) {
        throw new Error(`Binance server error (${response.status}). Please try again later.`);
      }
      
      throw new Error(`Binance API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Binance Futures Public API response [${environment}]:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Binance Futures Public API error [${environment}]:`, error);
    throw error;
  }
};

// Public Market Data Endpoints (No authentication required)
export const binanceFuturesAPI = {
  // Get klines/candlestick data
  getKlines: (symbol: string, interval: string, limit: number = 500) =>
    apiRequest('/fapi/v1/klines', 'GET', { symbol, interval, limit }),

  // Get current price for a symbol
  getPrice: (symbol: string) =>
    apiRequest('/fapi/v1/ticker/price', 'GET', { symbol }),

  // Get order book depth
  getDepth: (symbol: string, limit: number = 100) =>
    apiRequest('/fapi/v1/depth', 'GET', { symbol, limit }),

  // Get premium index and funding rate
  getPremiumIndex: (symbol: string) =>
    apiRequest('/fapi/v1/premiumIndex', 'GET', { symbol }),

  // Get open interest
  getOpenInterest: (symbol: string) =>
    apiRequest('/fapi/v1/openInterest', 'GET', { symbol }),

  // Get 24hr ticker statistics
  get24hrTicker: (symbol: string) =>
    apiRequest('/fapi/v1/ticker/24hr', 'GET', { symbol }),

  // Get exchange info
  getExchangeInfo: () =>
    apiRequest('/fapi/v1/exchangeInfo', 'GET'),

  // Get all 24hr tickers
  getAllTickers: () =>
    apiRequest('/fapi/v1/ticker/24hr', 'GET'),

  // Get recent trades
  getRecentTrades: (symbol: string, limit: number = 500) =>
    apiRequest('/fapi/v1/trades', 'GET', { symbol, limit }),

  // Get aggregate trades
  getAggTrades: (symbol: string, limit: number = 500) =>
    apiRequest('/fapi/v1/aggTrades', 'GET', { symbol, limit }),

  // Get funding rate history
  getFundingRateHistory: (symbol: string, limit: number = 100) =>
    apiRequest('/fapi/v1/fundingRate', 'GET', { symbol, limit }),

  // Get open interest statistics
  getOpenInterestStats: (symbol: string, period: string = '5m', limit: number = 30) =>
    apiRequest('/fapi/v1/openInterestHist', 'GET', { symbol, period, limit }),

  // Get top trader long/short ratio
  getTopTraderRatio: (symbol: string, period: string = '5m', limit: number = 30) =>
    apiRequest('/fapi/v1/topLongShortPositionRatio', 'GET', { symbol, period, limit }),

  // Get global long/short ratio
  getGlobalLongShortRatio: (symbol: string, period: string = '5m', limit: number = 30) =>
    apiRequest('/fapi/v1/globalLongShortAccountRatio', 'GET', { symbol, period, limit }),
};

// WebSocket stream utilities
export const createFuturesWebSocketUrl = (streams: string[]): string => {
  if (streams.length === 1) {
    // Single stream
    return `${WS_BASE_URL}/ws/${streams[0]}`;
  } else {
    // Combined streams
    const streamString = streams.join('/');
    return `${WS_BASE_URL}/stream?streams=${streamString}`;
  }
};

// Common stream names for BTCUSDT
export const BTCUSDT_STREAMS = {
  kline_1m: 'btcusdt@kline_1m',
  kline_5m: 'btcusdt@kline_5m',
  kline_15m: 'btcusdt@kline_15m',
  kline_1h: 'btcusdt@kline_1h',
  kline_4h: 'btcusdt@kline_4h',
  kline_1d: 'btcusdt@kline_1d',
  ticker: 'btcusdt@ticker',
  miniTicker: 'btcusdt@miniTicker',
  aggTrade: 'btcusdt@aggTrade',
  trade: 'btcusdt@trade',
  depth5: 'btcusdt@depth5@100ms',
  depth10: 'btcusdt@depth10@100ms',
  depth20: 'btcusdt@depth20@100ms',
  depth: 'btcusdt@depth@100ms',
  markPrice: 'btcusdt@markPrice@1s',
  indexPrice: 'btcusdt@indexPrice@1s',
  forceOrder: 'btcusdt@forceOrder',
};

// Utility functions for data processing
export const dataUtils = {
  // Format price with appropriate decimal places
  formatPrice: (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice >= 1000) {
      return numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (numPrice >= 1) {
      return numPrice.toFixed(4);
    } else {
      return numPrice.toFixed(8);
    }
  },

  // Format volume
  formatVolume: (volume: number | string): string => {
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    if (numVolume >= 1000000) {
      return `${(numVolume / 1000000).toFixed(2)}M`;
    } else if (numVolume >= 1000) {
      return `${(numVolume / 1000).toFixed(2)}K`;
    } else {
      return numVolume.toFixed(2);
    }
  },

  // Format percentage
  formatPercentage: (percentage: number | string): string => {
    const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
    const sign = numPercentage >= 0 ? '+' : '';
    return `${sign}${numPercentage.toFixed(2)}%`;
  },

  // Calculate price change color
  getPriceChangeColor: (change: number | string): string => {
    const numChange = typeof change === 'string' ? parseFloat(change) : change;
    if (numChange > 0) return 'text-green-400';
    if (numChange < 0) return 'text-red-400';
    return 'text-gray-400';
  },

  // Convert timestamp to readable time
  formatTime: (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  },

  // Convert timestamp to readable date
  formatDate: (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  },

  // Calculate funding rate in percentage
  formatFundingRate: (rate: number | string): string => {
    const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;
    return `${(numRate * 100).toFixed(4)}%`;
  },

  // Calculate next funding time
  getNextFundingTime: (timestamp: number): string => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff <= 0) return 'Now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },
};

// Market analysis utilities
export const marketAnalysis = {
  // Calculate RSI (simplified)
  calculateRSI: (prices: number[], period: number = 14): number => {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  },

  // Calculate moving average
  calculateMA: (prices: number[], period: number): number => {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  },

  // Calculate volatility
  calculateVolatility: (prices: number[], period: number = 20): number => {
    if (prices.length < period) return 0;
    
    const recentPrices = prices.slice(-period);
    const mean = recentPrices.reduce((acc, price) => acc + price, 0) / period;
    
    const variance = recentPrices.reduce((acc, price) => {
      return acc + Math.pow(price - mean, 2);
    }, 0) / period;
    
    return Math.sqrt(variance);
  },

  // Determine market trend
  getMarketTrend: (prices: number[]): 'bullish' | 'bearish' | 'sideways' => {
    if (prices.length < 10) return 'sideways';
    
    const recent = prices.slice(-10);
    const older = prices.slice(-20, -10);
    
    const recentAvg = recent.reduce((acc, price) => acc + price, 0) / recent.length;
    const olderAvg = older.reduce((acc, price) => acc + price, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.01) return 'bullish';
    if (change < -0.01) return 'bearish';
    return 'sideways';
  },
};

export default binanceFuturesAPI;