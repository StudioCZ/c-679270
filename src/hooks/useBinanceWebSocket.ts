import { useState, useEffect, useRef } from 'react';

interface TickerData {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
}

export const useBinanceWebSocket = (symbol: string) => {
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setTickerData({
              symbol: data.s,
              lastPrice: parseFloat(data.c),
              priceChange: parseFloat(data.P),
              priceChangePercent: parseFloat(data.P),
              volume: parseFloat(data.v),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
            });
          } catch (error) {
            console.error('Error parsing WebSocket data:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected');
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        // Fallback to mock data if WebSocket fails
        setTickerData({
          symbol: 'BTCUSDT',
          lastPrice: 43250.00,
          priceChange: 125.50,
          priceChangePercent: 2.85,
          volume: 28450.25,
          high24h: 43890.00,
          low24h: 42150.00,
        });
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
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
    isConnected,
  };
};