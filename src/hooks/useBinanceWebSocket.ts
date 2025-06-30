import { useState, useEffect, useRef } from 'react';

interface TickerData {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  openPrice: number;
  count: number;
}

export const useBinanceWebSocket = (symbol: string) => {
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`;
        console.log('Connecting to Binance WebSocket:', wsUrl);
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttempts.current = 0;
          console.log('✅ Binance WebSocket connected successfully');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📊 Real-time data received:', {
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
          } catch (error) {
            console.error('❌ Error parsing WebSocket data:', error);
            setConnectionError('Failed to parse real-time data');
          }
        };

        ws.onclose = (event) => {
          setIsConnected(false);
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          
          // Only attempt to reconnect if it wasn't a manual close
          if (event.code !== 1000 && reconnectAttempts.current < 10) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
            reconnectAttempts.current++;
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
          } else if (reconnectAttempts.current >= 10) {
            setConnectionError('Max reconnection attempts reached');
          }
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
          setConnectionError('WebSocket connection failed');
        };
      } catch (error) {
        console.error('❌ Error creating WebSocket:', error);
        setIsConnected(false);
        setConnectionError('Failed to create WebSocket connection');
        
        // Try to reconnect after delay
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
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [symbol]);

  return {
    lastPrice: tickerData?.lastPrice,
    priceChange: tickerData?.priceChange,
    priceChangePercent: tickerData?.priceChangePercent,
    volume: tickerData?.volume,
    high24h: tickerData?.high24h,
    low24h: tickerData?.low24h,
    openPrice: tickerData?.openPrice,
    count: tickerData?.count,
    isConnected,
    connectionError,
  };
};