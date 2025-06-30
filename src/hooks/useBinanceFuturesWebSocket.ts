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

// Check if we're in demo mode
const isDemoMode = (): boolean => {
  const apiKey = import.meta.env.VITE_BINANCE_API_KEY;
  const apiSecret = import.meta.env.VITE_BINANCE_API_SECRET;
  
  return !apiKey || 
         !apiSecret || 
         apiKey === 'your_binance_api_key_here' || 
         apiSecret === 'your_binance_api_secret_here' ||
         apiKey === 'demo_mode' ||
         apiSecret === 'demo_mode';
};

// Validate WebSocket connection prerequisites
const validateWebSocketSetup = (): { isValid: boolean; message?: string } => {
  const apiKey = import.meta.env.VITE_BINANCE_API_KEY;
  const apiSecret = import.meta.env.VITE_BINANCE_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    return {
      isValid: false,
      message: 'Missing Binance API credentials for WebSocket connection. Please check your .env file.'
    };
  }
  
  if (apiKey === 'your_binance_api_key_here' || 
      apiSecret === 'your_binance_api_secret_here' ||
      apiKey === 'demo_mode' ||
      apiSecret === 'demo_mode') {
    return {
      isValid: false,
      message: 'Please replace placeholder API credentials with your actual Binance API keys for WebSocket connection.'
    };
  }
  
  return { isValid: true };
};

// Create mock WebSocket data for demo mode
const createMockWebSocketData = (): { tickerData: FuturesTickerData; klineData: KlineData } => {
  const basePrice = 45000 + Math.random() * 2000;
  const priceChange = (Math.random() - 0.5) * 1000;
  
  return {
    tickerData: {
      symbol: 'BTCUSDT',
      lastPrice: basePrice,
      priceChange: priceChange,
      priceChangePercent: (priceChange / (basePrice - priceChange)) * 100,
      volume: Math.random() * 10000,
      high24h: basePrice + Math.random() * 500,
      low24h: basePrice - Math.random() * 500,
      openPrice: basePrice - priceChange,
      count: Math.floor(Math.random() * 10000),
      markPrice: basePrice + (Math.random() - 0.5) * 10,
      fundingRate: (Math.random() - 0.5) * 0.001,
      nextFundingTime: Date.now() + 3600000,
    },
    klineData: {
      symbol: 'BTCUSDT',
      openTime: Date.now() - 3600000,
      closeTime: Date.now(),
      open: basePrice - priceChange,
      high: basePrice + Math.random() * 200,
      low: basePrice - Math.random() * 200,
      close: basePrice,
      volume: Math.random() * 100,
      trades: Math.floor(Math.random() * 1000),
      interval: '1h',
    }
  };
};

export const useBinanceFuturesWebSocket = (symbol: string, streams: string[] = []) => {
  const [tickerData, setTickerData] = useState<FuturesTickerData | null>(null);
  const [klineData, setKlineData] = useState<KlineData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const mockDataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if we're in demo mode
    if (isDemoMode()) {
      console.log('🎭 Demo mode: Using mock WebSocket data');
      setIsConnected(true);
      setConnectionError(null);
      
      // Generate initial mock data
      const mockData = createMockWebSocketData();
      setTickerData(mockData.tickerData);
      setKlineData(mockData.klineData);
      
      // Update mock data periodically
      mockDataIntervalRef.current = setInterval(() => {
        const newMockData = createMockWebSocketData();
        setTickerData(newMockData.tickerData);
        setKlineData(newMockData.klineData);
      }, 2000);
      
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
        
        const environment = import.meta.env.VITE_BINANCE_TESTNET === 'true' ? 'TESTNET' : 'PRODUCTION';
        console.log(`🔄 Connecting to Binance Futures WebSocket [${environment}]:`, wsUrl);
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttempts.current = 0;
          console.log(`✅ Binance Futures WebSocket connected successfully [${environment}]`);
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

        ws.onclose = (event) => {
          setIsConnected(false);
          console.log(`🔌 Futures WebSocket disconnected [${environment}]:`, event.code, event.reason);
          
          // Provide specific error messages for common close codes
          if (event.code === 1006) {
            console.error('❌ WebSocket connection closed abnormally. This often indicates:');
            console.error('1. Network connectivity issues');
            console.error('2. Firewall blocking WebSocket connections');
            console.error('3. API access restrictions');
            console.error('4. Invalid API credentials');
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
          const errorMessage = 'WebSocket connection failed. This usually indicates:\n' +
            '1. Invalid API credentials\n' +
            '2. Network or firewall issues\n' +
            '3. API access restrictions\n' +
            '4. Server-side issues\n\n' +
            'Please check your .env file and ensure your API key has "Enable Futures" permission.';
          
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