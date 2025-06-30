// Environment variables for API credentials (used only for client-side headers, secrets handled by proxy)
const API_KEY = import.meta.env.VITE_BINANCE_API_KEY || '';

// Proxy URLs (no direct API URLs needed since we use proxies)
const SIGNED_PROXY_URL = '/binance-futures-signed-api';
const TESTNET_SIGNED_PROXY_URL = '/binance-futures-testnet-signed-api';
const PUBLIC_PROXY_URL = '/binance-futures-api';
const TESTNET_PUBLIC_PROXY_URL = '/binance-futures-testnet-api';

// WebSocket URLs
const PRODUCTION_WS_URL = 'wss://fstream.binance.com';
const TESTNET_WS_URL = 'wss://fstream.binancefuture.com';

// Get current environment setting
const isTestnet = import.meta.env.VITE_BINANCE_TESTNET === 'true';
export const WS_BASE_URL = isTestnet ? TESTNET_WS_URL : PRODUCTION_WS_URL;

// Check if we're in demo mode
const isDemoMode = (): boolean => {
  const apiKey = import.meta.env.VITE_BINANCE_API_KEY;
  const apiSecret = import.meta.env.VITE_BINANCE_API_SECRET;
  
  return !apiKey || 
         !apiSecret || 
         apiKey === 'your_binance_api_key_here' || 
         apiSecret === 'your_binance_api_secret_here' ||
         apiKey === 'your_testnet_api_key_here' ||
         apiSecret === 'your_testnet_secret_key_here' ||
         apiKey === 'demo_mode' ||
         apiSecret === 'demo_mode';
};

// Validate API credentials
const validateCredentials = (): { isValid: boolean; message?: string } => {
  const apiKey = import.meta.env.VITE_BINANCE_API_KEY;
  const apiSecret = import.meta.env.VITE_BINANCE_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    return {
      isValid: false,
      message: 'Missing Binance API credentials. Please check your .env file and ensure you have VITE_BINANCE_API_KEY and VITE_BINANCE_API_SECRET set.'
    };
  }
  
  if (apiKey === 'your_binance_api_key_here' || 
      apiSecret === 'your_binance_api_secret_here' ||
      apiKey === 'your_testnet_api_key_here' ||
      apiSecret === 'your_testnet_secret_key_here' ||
      apiKey === 'demo_mode' ||
      apiSecret === 'demo_mode') {
    return {
      isValid: false,
      message: 'Please replace placeholder API credentials with your actual Binance API keys. Get your API keys from: Testnet: https://testnet.binancefuture.com/ or Production: https://www.binance.com/en/my/settings/api-management'
    };
  }
  
  return { isValid: true };
};

// Mock data simulator for consistent demo data (slower updates)
class MockDataSimulator {
  private static instance: MockDataSimulator;
  private basePrice: number = 43250.00;
  private currentPrice: number = 43250.00;
  private openPrice: number = 43100.00;
  private high24h: number = 43800.00;
  private low24h: number = 42900.00;
  private volume: number = 15234.567;
  private count: number = 125678;
  private fundingRate: number = 0.0001;
  private trend: number = 1;
  private volatility: number = 0.00005; // Much lower volatility
  private lastUpdate: number = Date.now();

  private constructor() {
    // Singleton pattern to ensure consistent data across all components
  }

  public static getInstance(): MockDataSimulator {
    if (!MockDataSimulator.instance) {
      MockDataSimulator.instance = new MockDataSimulator();
    }
    return MockDataSimulator.instance;
  }

  private resetTrend() {
    // Change trend very rarely (every 5-10 minutes on average)
    if (Math.random() < 0.002) {
      this.trend *= -1;
      this.volatility = 0.00002 + Math.random() * 0.00008; // 0.002% to 0.01% volatility
    }
  }

  getNextPrice(): number {
    const now = Date.now();
    const timeDiff = now - this.lastUpdate;
    
    // Only update if enough time has passed (minimum 1 minute)
    if (timeDiff < 60000) {
      return this.currentPrice;
    }
    
    this.lastUpdate = now;
    this.resetTrend();
    
    const randomFactor = (Math.random() - 0.5) * 2;
    const trendFactor = this.trend * 0.1;
    const priceChange = this.currentPrice * this.volatility * (randomFactor + trendFactor);
    
    this.currentPrice += priceChange;
    this.currentPrice = Math.max(this.low24h * 0.999, Math.min(this.high24h * 1.001, this.currentPrice));
    
    // Very rarely update bounds
    if (Math.random() < 0.005) {
      if (this.currentPrice > this.high24h) {
        this.high24h = this.currentPrice;
      }
      if (this.currentPrice < this.low24h) {
        this.low24h = this.currentPrice;
      }
    }
    
    return this.currentPrice;
  }

  getCurrentData() {
    const price = this.getNextPrice();
    const priceChange = price - this.openPrice;
    const priceChangePercent = (priceChange / this.openPrice) * 100;
    
    // Very slowly increment counters
    this.volume += Math.random() * 0.1;
    this.count += Math.floor(Math.random() * 1);
    
    // Very slightly vary funding rate
    this.fundingRate += (Math.random() - 0.5) * 0.000001;
    this.fundingRate = Math.max(-0.001, Math.min(0.001, this.fundingRate));
    
    return {
      price,
      priceChange,
      priceChangePercent,
      volume: this.volume,
      high24h: this.high24h,
      low24h: this.low24h,
      openPrice: this.openPrice,
      count: this.count,
      fundingRate: this.fundingRate,
    };
  }
}

// Create mock data for demo mode using the simulator
const createMockData = (endpoint: string): any => {
  const simulator = MockDataSimulator.getInstance();
  const currentData = simulator.getCurrentData();

  if (endpoint.includes('/fapi/v1/ticker/24hr')) {
    return {
      symbol: 'BTCUSDT',
      priceChange: currentData.priceChange.toFixed(2),
      priceChangePercent: currentData.priceChangePercent.toFixed(2),
      weightedAvgPrice: currentData.price.toFixed(2),
      prevClosePrice: currentData.openPrice.toFixed(2),
      lastPrice: currentData.price.toFixed(2),
      lastQty: '0.001',
      bidPrice: (currentData.price - 0.01).toFixed(2),
      askPrice: (currentData.price + 0.01).toFixed(2),
      openPrice: currentData.openPrice.toFixed(2),
      highPrice: currentData.high24h.toFixed(2),
      lowPrice: currentData.low24h.toFixed(2),
      volume: currentData.volume.toFixed(3),
      quoteVolume: (currentData.volume * currentData.price).toFixed(2),
      openTime: Date.now() - 86400000,
      closeTime: Date.now(),
      firstId: 123456789,
      lastId: 123456790,
      count: currentData.count
    };
  }
  
  if (endpoint.includes('/fapi/v1/klines')) {
    const now = Date.now();
    const mockKlines = [];
    const basePrice = currentData.price;
    
    for (let i = 0; i < 100; i++) {
      const time = now - (i * 3600000);
      const priceVariation = (Math.random() - 0.5) * 50; // Smaller variations
      const candlePrice = basePrice + priceVariation;
      
      mockKlines.unshift([
        time,
        candlePrice.toFixed(2),
        (candlePrice + Math.random() * 25).toFixed(2),
        (candlePrice - Math.random() * 25).toFixed(2),
        (candlePrice + (Math.random() - 0.5) * 10).toFixed(2),
        (Math.random() * 50).toFixed(3),
        time + 3599999,
        (Math.random() * 500000).toFixed(2),
        Math.floor(Math.random() * 500),
        (Math.random() * 25).toFixed(3),
        (Math.random() * 250000).toFixed(2),
        '0'
      ]);
    }
    return mockKlines;
  }
  
  if (endpoint.includes('/fapi/v1/premiumIndex')) {
    return {
      symbol: 'BTCUSDT',
      markPrice: currentData.price.toFixed(2),
      indexPrice: (currentData.price - 0.05).toFixed(2),
      estimatedSettlePrice: (currentData.price - 0.02).toFixed(2),
      lastFundingRate: currentData.fundingRate.toFixed(8),
      nextFundingTime: Date.now() + 3600000,
      interestRate: '0.00010000',
      time: Date.now()
    };
  }
  
  if (endpoint.includes('/fapi/v1/openInterest')) {
    return {
      openInterest: '123456.789',
      symbol: 'BTCUSDT',
      time: Date.now()
    };
  }
  
  if (endpoint.includes('/fapi/v1/depth')) {
    const basePrice = currentData.price;
    const bids = [];
    const asks = [];
    
    for (let i = 0; i < 20; i++) {
      bids.push([
        (basePrice - i * 0.01).toFixed(2),
        (Math.random() * 5).toFixed(3)
      ]);
      asks.push([
        (basePrice + i * 0.01).toFixed(2),
        (Math.random() * 5).toFixed(3)
      ]);
    }
    
    return {
      lastUpdateId: Date.now(),
      bids,
      asks
    };
  }
  
  return {
    message: 'Demo mode - mock data',
    timestamp: Date.now()
  };
};

// Create parameters with timestamp (signature will be added by proxy)
const createSignedParams = (params: Record<string, any> = {}): string => {
  const timestamp = Date.now();
  const queryString = new URLSearchParams({
    ...params,
    timestamp: timestamp.toString(),
  }).toString();
  
  return queryString;
};

// Generic API request function
const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  params: Record<string, any> = {},
  signed: boolean = false
): Promise<any> => {
  // Check if we're in demo mode
  if (isDemoMode()) {
    console.log(`🎭 Demo mode: Returning slower mock data for ${endpoint}`);
    console.log('📝 To use real Binance data:');
    console.log('1. Get FREE testnet API keys from: https://testnet.binancefuture.com/');
    console.log('2. Update your .env file with real API credentials');
    console.log('3. Restart the development server');
    return createMockData(endpoint);
  }

  // Validate credentials for real API calls
  const validation = validateCredentials();
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Determine base URL based on signed status and testnet setting
  let baseUrl: string;
  if (signed) {
    baseUrl = isTestnet ? TESTNET_SIGNED_PROXY_URL : SIGNED_PROXY_URL;
    // Don't set API key header for signed requests - proxy will handle it
  } else {
    baseUrl = isTestnet ? TESTNET_PUBLIC_PROXY_URL : PUBLIC_PROXY_URL;
    // Set API key for public requests that might need it
    if (API_KEY) {
      headers['X-MBX-APIKEY'] = API_KEY;
    }
  }

  let url = `${baseUrl}${endpoint}`;
  let body: string | undefined;

  if (signed) {
    // For signed requests, prepare parameters with timestamp
    const signedParams = createSignedParams(params);
    if (method === 'GET' || method === 'DELETE') {
      url += `?${signedParams}`;
    } else {
      body = signedParams;
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
  } else if (Object.keys(params).length > 0) {
    // For public requests, just add query parameters
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  const environment = isTestnet ? 'TESTNET' : 'PRODUCTION';
  console.log(`🔄 Binance Futures API ${method} ${endpoint} [${environment}]`, { params, signed });

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Provide specific error messages for common issues
      if (response.status === 403) {
        console.error('❌ 403 Forbidden - API Access Denied');
        console.error('This usually means:');
        console.error('1. Invalid API key or secret');
        console.error('2. API key does not have "Enable Futures" permission');
        console.error('3. IP address is not whitelisted (if IP restrictions are enabled)');
        console.error('4. Account is restricted or suspended');
        console.error('');
        console.error('Solutions:');
        console.error('- Verify your API credentials in the .env file');
        console.error('- Check that "Enable Futures" is enabled for your API key');
        console.error('- Try using testnet: VITE_BINANCE_TESTNET=true');
        console.error('- Check your Binance account status');
        
        throw new Error(`API Access Denied (403). Please check your API credentials and permissions. Using ${environment} environment.`);
      }
      
      if (response.status === 401) {
        throw new Error(`Unauthorized (401). Please check your API key and signature. Using ${environment} environment.`);
      }
      
      throw new Error(`Binance Futures API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Binance Futures API response [${environment}]:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Binance Futures API error [${environment}]:`, error);
    throw error;
  }
};

// Market Data Endpoints (Public)
export const binanceFuturesAPI = {
  // Get klines/candlestick data
  getKlines: (symbol: string, interval: string, limit: number = 500) =>
    apiRequest('/fapi/v1/klines', 'GET', { symbol, interval, limit }),

  // Get order book depth
  getDepth: (symbol: string, limit: number = 100) =>
    apiRequest('/fapi/v1/depth', 'GET', { symbol, limit }),

  // Get 24hr ticker statistics
  get24hrTicker: (symbol: string) =>
    apiRequest('/fapi/v1/ticker/24hr', 'GET', { symbol }),

  // Get premium index and funding rate
  getPremiumIndex: (symbol: string) =>
    apiRequest('/fapi/v1/premiumIndex', 'GET', { symbol }),

  // Get open interest
  getOpenInterest: (symbol: string) =>
    apiRequest('/fapi/v1/openInterest', 'GET', { symbol }),

  // Get exchange info
  getExchangeInfo: () =>
    apiRequest('/fapi/v1/exchangeInfo', 'GET'),

  // Get leverage brackets
  getLeverageBrackets: (symbol?: string) =>
    apiRequest('/fapi/v1/leverageBracket', 'GET', symbol ? { symbol } : {}, true),

  // Trading Endpoints (Private - Signed)
  
  // Create new order
  createOrder: (orderParams: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT' | 'STOP_MARKET' | 'TAKE_PROFIT_MARKET';
    quantity?: string;
    price?: string;
    timeInForce?: 'GTC' | 'IOC' | 'FOK' | 'GTX';
    stopPrice?: string;
    closePosition?: boolean;
    activationPrice?: string;
    callbackRate?: string;
    workingType?: 'MARK_PRICE' | 'CONTRACT_PRICE';
    priceProtect?: boolean;
    newOrderRespType?: 'ACK' | 'RESULT';
    reduceOnly?: boolean;
  }) =>
    apiRequest('/fapi/v1/order', 'POST', orderParams, true),

  // Cancel order
  cancelOrder: (symbol: string, orderId?: number, origClientOrderId?: string) =>
    apiRequest('/fapi/v1/order', 'DELETE', { 
      symbol, 
      ...(orderId && { orderId }),
      ...(origClientOrderId && { origClientOrderId })
    }, true),

  // Cancel all orders
  cancelAllOrders: (symbol: string) =>
    apiRequest('/fapi/v1/allOpenOrders', 'DELETE', { symbol }, true),

  // Get account information
  getAccount: () =>
    apiRequest('/fapi/v2/account', 'GET', {}, true),

  // Get position risk
  getPositionRisk: (symbol?: string) =>
    apiRequest('/fapi/v2/positionRisk', 'GET', symbol ? { symbol } : {}, true),

  // Get all orders
  getAllOrders: (symbol: string, orderId?: number, startTime?: number, endTime?: number, limit?: number) =>
    apiRequest('/fapi/v1/allOrders', 'GET', {
      symbol,
      ...(orderId && { orderId }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(limit && { limit })
    }, true),

  // Change leverage
  changeLeverage: (symbol: string, leverage: number) =>
    apiRequest('/fapi/v1/leverage', 'POST', { symbol, leverage }, true),

  // Change margin type
  changeMarginType: (symbol: string, marginType: 'ISOLATED' | 'CROSSED') =>
    apiRequest('/fapi/v1/marginType', 'POST', { symbol, marginType }, true),

  // User Data Stream
  
  // Create listen key for user data stream
  createListenKey: () =>
    apiRequest('/fapi/v1/listenKey', 'POST', {}, true),

  // Keep alive listen key
  keepAliveListenKey: (listenKey: string) =>
    apiRequest('/fapi/v1/listenKey', 'PUT', { listenKey }, true),

  // Delete listen key
  deleteListenKey: (listenKey: string) =>
    apiRequest('/fapi/v1/listenKey', 'DELETE', { listenKey }, true),
};

// Risk management utilities
export const riskManagement = {
  // Validate order against exchange rules
  validateOrder: async (symbol: string, quantity: number, price?: number) => {
    try {
      const exchangeInfo = await binanceFuturesAPI.getExchangeInfo();
      const symbolInfo = exchangeInfo.symbols.find((s: any) => s.symbol === symbol);
      
      if (!symbolInfo) {
        throw new Error(`Symbol ${symbol} not found`);
      }

      // Check quantity precision and limits
      const lotSizeFilter = symbolInfo.filters.find((f: any) => f.filterType === 'LOT_SIZE');
      const minNotionalFilter = symbolInfo.filters.find((f: any) => f.filterType === 'MIN_NOTIONAL');
      
      if (lotSizeFilter) {
        const minQty = parseFloat(lotSizeFilter.minQty);
        const maxQty = parseFloat(lotSizeFilter.maxQty);
        const stepSize = parseFloat(lotSizeFilter.stepSize);
        
        if (quantity < minQty || quantity > maxQty) {
          throw new Error(`Quantity must be between ${minQty} and ${maxQty}`);
        }
        
        // Check step size
        const remainder = (quantity - minQty) % stepSize;
        if (remainder !== 0) {
          throw new Error(`Quantity must be a multiple of ${stepSize}`);
        }
      }

      // Check price filters if price is provided
      if (price) {
        const priceFilter = symbolInfo.filters.find((f: any) => f.filterType === 'PRICE_FILTER');
        if (priceFilter) {
          const minPrice = parseFloat(priceFilter.minPrice);
          const maxPrice = parseFloat(priceFilter.maxPrice);
          const tickSize = parseFloat(priceFilter.tickSize);
          
          if (price < minPrice || price > maxPrice) {
            throw new Error(`Price must be between ${minPrice} and ${maxPrice}`);
          }
          
          // Check tick size
          const remainder = (price - minPrice) % tickSize;
          if (remainder !== 0) {
            throw new Error(`Price must be a multiple of ${tickSize}`);
          }
        }
      }

      // Check minimum notional
      if (minNotionalFilter && price) {
        const minNotional = parseFloat(minNotionalFilter.notional);
        const notional = quantity * price;
        if (notional < minNotional) {
          throw new Error(`Order notional must be at least ${minNotional}`);
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Order validation failed:', error);
      throw error;
    }
  },

  // Check if price is within acceptable range of mark price
  validatePriceDeviation: async (symbol: string, orderPrice: number, maxDeviation: number = 0.003) => {
    try {
      const premiumIndex = await binanceFuturesAPI.getPremiumIndex(symbol);
      const markPrice = parseFloat(premiumIndex.markPrice);
      const deviation = Math.abs(orderPrice - markPrice) / markPrice;
      
      if (deviation > maxDeviation) {
        throw new Error(`Price deviation ${(deviation * 100).toFixed(2)}% exceeds maximum ${(maxDeviation * 100).toFixed(2)}%`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Price deviation check failed:', error);
      throw error;
    }
  },
};

// WebSocket stream utilities
export const createFuturesWebSocketUrl = (streams: string[]): string => {
  const streamString = streams.join('/');
  return `${WS_BASE_URL}/stream?streams=${streamString}`;
};

// Common stream names for BTCUSDT
export const BTCUSDT_STREAMS = {
  kline_1m: 'btcusdt@kline_1m',
  kline_15m: 'btcusdt@kline_15m',
  kline_1h: 'btcusdt@kline_1h',
  kline_4h: 'btcusdt@kline_4h',
  kline_1d: 'btcusdt@kline_1d',
  ticker: 'btcusdt@ticker',
  aggTrade: 'btcusdt@aggTrade',
  depth: 'btcusdt@depth@100ms',
  markPrice: 'btcusdt@markPrice@1s',
};

export default binanceFuturesAPI;