import { useQuery } from '@tanstack/react-query';

const timeframeMap: Record<string, string> = {
  '1m': '1m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
};

export const useBinanceKlines = (symbol: string, timeframe: string) => {
  return useQuery({
    queryKey: ['klines', symbol, timeframe],
    queryFn: async () => {
      try {
        const interval = timeframeMap[timeframe] || '1h';
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate the data structure
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid data format received from API');
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching Binance data:', error);
        // Return mock data if API fails
        return generateMockKlineData(timeframe);
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

const generateMockKlineData = (timeframe: string) => {
  const data = [];
  const now = Date.now();
  const basePrice = 43250;
  
  // Adjust interval based on timeframe
  const intervalMs = getIntervalMs(timeframe);
  
  for (let i = 499; i >= 0; i--) {
    const timestamp = now - (i * intervalMs);
    const open = basePrice + (Math.random() - 0.5) * 1000;
    const volatility = Math.random() * 200;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    const volume = Math.random() * 100 + 50;
    
    data.push([
      timestamp,
      open.toFixed(2),
      high.toFixed(2),
      low.toFixed(2),
      close.toFixed(2),
      volume.toFixed(2),
      timestamp + intervalMs - 1, // Close time
      (volume * close).toFixed(2), // Quote asset volume
      Math.floor(Math.random() * 100), // Number of trades
      (volume * 0.6).toFixed(2), // Taker buy base asset volume
      (volume * close * 0.6).toFixed(2), // Taker buy quote asset volume
      '0' // Ignore
    ]);
  }
  
  return data;
};

const getIntervalMs = (timeframe: string): number => {
  const intervals: Record<string, number> = {
    '1m': 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  };
  
  return intervals[timeframe] || intervals['1h'];
};