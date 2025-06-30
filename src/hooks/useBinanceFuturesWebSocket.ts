import { useState, useEffect, useRef } from 'react';
import { WS_BASE_URL, createFuturesWebSocketUrl, BTCUSDT_STREAMS } from '@/services/binanceFutures';

interface FuturesTickerData {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  openPrice: number;
  count: number;
  markPrice?: number;
  fundingRate?: number;
  nextFundingTime?: number;
}

interface KlineData {
  symbol: string;
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trades: number;
  interval: string;
}

// Check if we have valid API credentials (for testnet, only API key is needed)
const hasValidCredentials = (): boolean => {
  const apiKey = import.meta.env.VITE_BINANCE_API_KEY;
  const isTestnet = import.meta.env.VITE_BINANCE_TESTNET === 'true';
  
  if (!apiKey || 
      apiKey === 'your_binance_api_key_here' || 
      apiKey === 'your_testnet_api_key_here' ||
      apiKey === 'demo_mode') {
    return false;
  }
  
  // For testnet, we only need API key
  if (isTestnet) {
    return true;
  }
  
  // For production, we need both API key and secret
  const apiSecret = import.meta.env.VITE_BINANCE_API_SECRET;
  return !!(apiSecret && 
           apiSecret !== 'your_binance_api_secret_here' && 
           apiSecret !== 'your_testnet_secret_key_here' &&
           apiSecret !== 'demo_mode');
};

// Validate WebSocket connection prerequisites
const validateWebSocketSetup = (): { isValid: boolean; message?: string } => {
  const apiKey = import.meta.env.VITE_BINANCE_API_KEY;
  const isTestnet = import.meta.env.VITE_BINANCE_TESTNET === 'true';
  
  if (!apiKey) {
    return {
      isValid: false,
      message: 'Missing Binance API key for WebSocket connection. Please check your .env file.'
    };
  }
  
  if (apiKey === 'your_binance_api_key_here' || 
      apiKey === 'your_testnet_api_key_here' ||
      apiKey === 'demo_mode') {
    return {
      isValid: false,
      message: `Please replace placeholder API credentials with your actual Binance API key. Get your API key from: ${isTestnet ? 'https://testnet.binancefuture.com/' : 'https://www.binance.com/en/my/settings/api-management'}`
    };
  }
  
  return { isValid: true };
};

// Mock data state for realistic price simulation (slower updates)
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
  private trend: number = 1; // 1 for up, -1 for down
  private volatility: number = 0.0001; // Reduced volatility for slower changes
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
    // Change trend less frequently (every 2-3 minutes on average)
    if (Math.random() < 0.005) {
      this.trend *= -1;
      this.volatility = 0.00005 + Math.random() * 0.00015; // 0.005% to 0.02% volatility
    }
  }

  getNextPrice(): number {
    const now = Date.now();
    const timeDiff = now - this.lastUpdate;
    
    // Only update if enough time has passed (minimum 30 seconds)
    if (timeDiff < 30000) {
      return this.currentPrice;
    }
    
    this.lastUpdate = now;
    this.resetTrend();
    
    // Generate very small realistic price movement
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    const trendFactor = this.trend * 0.2; // Reduced trend bias
    const priceChange = this.currentPrice * this.volatility * (randomFactor + trendFactor);
    
    this.currentPrice += priceChange;
    
    // Keep price within reasonable bounds
    this.currentPrice = Math.max(this.low24h * 0.9995, Math.min(this.high24h * 1.0005, this.currentPrice));
    
    // Very rarely update 24h high/low
    if (Math.random() < 0.01) {
      if (this.currentPrice > this.high24h) {
        this.high24h = this.currentPrice;
      }
      if (this.currentPrice < this.low24h) {
        this.low24h = this.currentPrice;
      }
    }
    
    return this.currentPrice;
  }

  getTickerData(): FuturesTickerData {
    const price = this.getNextPrice();
    const priceChange = price - this.openPrice;
    const priceChangePercent = (priceChange / this.openPrice) * 100;
    
    // Very slowly increment volume and count
    this.volume += Math.random() * 0.5;
    this.count += Math.floor(Math.random() * 2);
    
    // Very slightly vary funding rate
    this.fundingRate += (Math.random() - 0.5) * 0.000005;
    this.fundingRate = Math.max(-0.001, Math.min(0.001, this.fundingRate));

    return {
      symbol: 'BTCUSDT',
      lastPrice: price,
      priceChange: priceChange,
      priceChangePercent: priceChangePercent,
      volume: this.volume,
      high24h: this.high24h,
      low24h: this.low24h,
      openPrice: this.openPrice,
      count: this.count,
      markPrice: price + (Math.random() - 0.5) * 1, // Mark price very close to spot price
      fundingRate: this.fundingRate,
      nextFundingTime: Date.now() + 3600000,
    };
  }

  getKlineData(): KlineData {
    const price = this.currentPrice;
    const open = price - (Math.random() - 0.5) * 10;
    const high = Math.max(open, price) + Math.random() * 5;
    const low = Math.min(open, price) - Math.random() * 5;

    return {
      symbol: 'BTCUSDT',
      openTime: Date.now() - 3600000,
      closeTime: Date.now(),
      open: open,
      high: high,
      low: low,
      close: price,
      volume: Math.random() * 25 + 15,
      trades: Math.floor(Math.random() * 250) + 150,
      interval: '1h',
    };
  }
}

export const useBinanceFuturesWebSocket = (symbol: string, streams: string[] = []) => {
  const [tickerData, setTickerData] = useState<FuturesTickerData | null>(null);
  const [klineData, setKlineData] = useState<KlineData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const mockDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isTestnet = import.meta.env.VITE_BINANCE_TESTNET === 'true';
    
    // Check if we have valid credentials
    if (!hasValidCredentials()) {
      console.log('🎭 Demo mode: Using slower mock WebSocket data simulation');
      console.log('📝 To use real Binance data:');
      if (isTestnet) {
        console.log('1. Get FREE testnet API key from: https://testnet.binancefuture.com/');
        console.log('2. Update VITE_BINANCE_API_KEY in your .env file');
        console.log('3. Note: Testnet typically only provides public API keys');
      } else {
        console.log('1. Get API keys from: https://www.binance.com/en/my/settings/api-management');
        console.log('2. Update both VITE_BINANCE_API_KEY and VITE_BINANCE_API_SECRET in your .env file');
      }
      console.log('4. Restart the development server');
      
      setIsConnected(true);
      setConnectionError('Demo Mode - Using mock data. Update .env file with real API keys to connect to Binance.');
      
      // Get singleton instance for consistent data
      const mockSimulator = MockDataSimulator.getInstance();
      
      // Generate initial mock data
      const initialTickerData = mockSimulator.getTickerData();
      const initialKlineData = mockSimulator.getKlineData();
      setTickerData(initialTickerData);
      setKlineData(initialKlineData);
      
      // Update mock data much less frequently (every 30 seconds)
      mockDataIntervalRef.current = setInterval(() => {
        const newTickerData = mockSimulator.getTickerData();
        const newKlineData = mockSimulator.getKlineData();
        setTickerData(newTickerData);
        setKlineData(newKlineData);
      }, 30000); // Update every 30 seconds instead of 5 seconds
      
      return () => {
        if (mockDataIntervalRef.current) {
          clearInterval(mockDataIntervalRef.current);
        }
      };
    }

    const connectWebSocket = () => {
      try {
        // Validate setup before attempting connection
        const validation = validateWebSocketSetup();
        if (!validation.isValid) {
          setConnectionError(validation.message || 'Invalid WebSocket setup');
          return;
        }

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Default streams if none provided
        const defaultStreams = [
          BTCUSDT_STREAMS.ticker,
          BTCUSDT_STREAMS.markPrice,
          BTCUSDT_STREAMS.kline_1h,
        ];
        
        const streamList = streams.length > 0 ? streams : defaultStreams;
        const wsUrl = createFuturesWebSocketUrl(streamList);
        
        const environment = isTestnet ? 'TESTNET' : 'PRODUCTION';
        console.log(`🔄 Connecting to Binance Futures WebSocket [${environment}]:`, wsUrl);
        console.log(`📡 WebSocket URL: ${WS_BASE_URL}`);
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttempts.current = 0;
          console.log(`✅ Binance Futures WebSocket connected successfully [${environment}]`);
          
          // Set up ping interval to keep connection alive (every 20 seconds as per Binance docs)
          pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.ping();
            }
          }, 20000);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.stream && message.data) {
              const { stream, data } = message;
              
              // Handle ticker data
              if (stream.includes('@ticker')) {
                console.log('📊 Futures ticker data received:', {
                  symbol: data.s,
                  price: data.c,
                  change: data.P,
                  volume: data.v
                });
                
                setTickerData({
                  symbol: data.s,
                  lastPrice: parseFloat(data.c),
                  priceChange: parseFloat(data.p),
                  priceChangePercent: parseFloat(data.P),
                  volume: parseFloat(data.v),
                  high24h: parseFloat(data.h),
                  low24h: parseFloat(data.l),
                  openPrice: parseFloat(data.o),
                  count: parseInt(data.n),
                });
              }
              
              // Handle mark price data
              else if (stream.includes('@markPrice')) {
                console.log('💰 Mark price data received:', {
                  symbol: data.s,
                  markPrice: data.p,
                  fundingRate: data.r
                });
                
                setTickerData(prev => prev ? {
                  ...prev,
                  markPrice: parseFloat(data.p),
                  fundingRate: parseFloat(data.r),
                  nextFundingTime: parseInt(data.T),
                } : null);
              }
              
              // Handle kline data
              else if (stream.includes('@kline')) {
                const kline = data.k;
                console.log('📈 Futures kline data received:', {
                  symbol: kline.s,
                  interval: kline.i,
                  close: kline.c
                });
                
                setKlineData({
                  symbol: kline.s,
                  openTime: kline.t,
                  closeTime: kline.T,
                  open: parseFloat(kline.o),
                  high: parseFloat(kline.h),
                  low: parseFloat(kline.l),
                  close: parseFloat(kline.c),
                  volume: parseFloat(kline.v),
                  trades: kline.n,
                  interval: kline.i,
                });
              }
            }
          } catch (error) {
            console.error('❌ Error parsing Futures WebSocket data:', error);
            setConnectionError('Failed to parse real-time futures data');
          }
        };

        // Handle pong frames (response to ping)
        ws.onpong = () => {
          console.log('🏓 Received pong from Binance WebSocket');
        };

        ws.onclose = (event) => {
          setIsConnected(false);
          console.log(`🔌 Futures WebSocket disconnected [${environment}]:`, event.code, event.reason);
          
          // Clear ping interval
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
          }
          
          // Provide specific error messages for common close codes
          if (event.code === 1006) {
            console.error('❌ WebSocket connection closed abnormally. This often indicates:');
            console.error('1. Network connectivity issues');
            console.error('2. Firewall blocking WebSocket connections');
            console.error('3. Invalid WebSocket URL or endpoint');
            console.error('4. Server-side connection issues');
            if (isTestnet) {
              console.error('5. Testnet WebSocket endpoint may be different or unavailable');
            }
          } else if (event.code === 1002) {
            console.error('❌ WebSocket protocol error. Check if the WebSocket URL is correct.');
            console.error(`Current URL: ${wsUrl}`);
          } else if (event.code === 1011) {
            console.error('❌ Server error. Binance WebSocket server encountered an error.');
          }
          
          if (event.code !== 1000 && reconnectAttempts.current < 10) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            console.log(`🔄 Reconnecting to Futures WebSocket in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
            reconnectAttempts.current++;
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
          } else if (reconnectAttempts.current >= 10) {
            setConnectionError('Max reconnection attempts reached. Please check your API credentials and network connection.');
          }
        };

        ws.onerror = (error) => {
          console.error(`❌ Futures WebSocket error [${environment}]:`, error);
          setIsConnected(false);
          
          // Provide helpful error message
          let errorMessage = 'WebSocket connection failed. This usually indicates:\n';
          if (isTestnet) {
            errorMessage += '1. Testnet WebSocket endpoint may be unavailable\n' +
              '2. Invalid API key for testnet\n' +
              '3. Network or firewall issues\n' +
              '4. Testnet service may be temporarily down\n\n' +
              'Try switching to production mode or check testnet status.';
          } else {
            errorMessage += '1. Invalid API credentials\n' +
              '2. Network or firewall issues\n' +
              '3. API access restrictions\n' +
              '4. Server-side issues\n\n' +
              'Please check your .env file and ensure your API key has proper permissions.';
          }
          
          setConnectionError(errorMessage);
        };
      } catch (error) {
        console.error('❌ Error creating Futures WebSocket:', error);
        setIsConnected(false);
        setConnectionError('Failed to create Futures WebSocket connection. Please check your API credentials.');
        
        if (reconnectAttempts.current < 10) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
        }
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (mockDataIntervalRef.current) {
        clearInterval(mockDataIntervalRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [symbol, streams]);

  return {
    // Ticker data
    lastPrice: tickerData?.lastPrice,
    priceChange: tickerData?.priceChange,
    priceChangePercent: tickerData?.priceChangePercent,
    volume: tickerData?.volume,
    high24h: tickerData?.high24h,
    low24h: tickerData?.low24h,
    openPrice: tickerData?.openPrice,
    count: tickerData?.count,
    
    // Futures-specific data
    markPrice: tickerData?.markPrice,
    fundingRate: tickerData?.fundingRate,
    nextFundingTime: tickerData?.nextFundingTime,
    
    // Kline data
    currentKline: klineData,
    
    // Connection status
    isConnected,
    connectionError,
  };
};