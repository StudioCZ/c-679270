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

export const useBinanceFuturesWebSocket = (symbol: string, streams: string[] = []) => {
  const [tickerData, setTickerData] = useState<FuturesTickerData | null>(null);
  const [klineData, setKlineData] = useState<KlineData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isTestnet = import.meta.env.VITE_BINANCE_TESTNET === 'true';

    const connectWebSocket = () => {
      try {
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
        console.log(`📡 WebSocket Base URL: ${WS_BASE_URL}`);
        
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
              // Send ping frame
              ws.send(JSON.stringify({ method: 'ping' }));
            }
          }, 20000);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Handle pong response
            if (message.result === null && message.id) {
              console.log('🏓 Received pong from Binance WebSocket');
              return;
            }
            
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
            
            // Handle single stream data (not wrapped in stream object)
            else if (data && data.e) {
              const eventType = data.e;
              
              if (eventType === '24hrTicker') {
                console.log('📊 Direct ticker data received:', {
                  symbol: data.s,
                  price: data.c,
                  change: data.P
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
              
              else if (eventType === 'kline') {
                const kline = data.k;
                console.log('📈 Direct kline data received:', {
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
          } else if (event.code === 1002) {
            console.error('❌ WebSocket protocol error. Check if the WebSocket URL is correct.');
            console.error(`Current URL: ${wsUrl}`);
          } else if (event.code === 1011) {
            console.error('❌ Server error. Binance WebSocket server encountered an error.');
          }
          
          // Only attempt to reconnect if it wasn't a manual close
          if (event.code !== 1000 && reconnectAttempts.current < 10) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            console.log(`🔄 Reconnecting to Futures WebSocket in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
            reconnectAttempts.current++;
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
          } else if (reconnectAttempts.current >= 10) {
            setConnectionError('Max reconnection attempts reached. Please check your network connection.');
          }
        };

        ws.onerror = (error) => {
          console.error(`❌ Futures WebSocket error [${environment}]:`, error);
          setIsConnected(false);
          
          // Provide helpful error message
          let errorMessage = 'WebSocket connection failed. This usually indicates:\n';
          errorMessage += '1. Network or firewall issues\n' +
            '2. Invalid WebSocket URL\n' +
            '3. Server-side issues\n' +
            '4. Rate limiting\n\n' +
            'Please check your network connection and try again.';
          
          setConnectionError(errorMessage);
        };
      } catch (error) {
        console.error('❌ Error creating Futures WebSocket:', error);
        setIsConnected(false);
        setConnectionError('Failed to create Futures WebSocket connection. Please check your network connection.');
        
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