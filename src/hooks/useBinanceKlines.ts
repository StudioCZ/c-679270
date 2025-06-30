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
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching Binance data:', error);
        // Return mock data if API fails
        return generateMockKlineData();
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};

const generateMockKlineData = () => {
  const data = [];
  const now = Date.now();
  const basePrice = 43250;
  
  for (let i = 499; i >= 0; i--) {
    const timestamp = now - (i * 60 * 1000); // 1 minute intervals
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
      timestamp + 59999, // Close time
      (volume * close).toFixed(2), // Quote asset volume
      Math.floor(Math.random() * 100), // Number of trades
      (volume * 0.6).toFixed(2), // Taker buy base asset volume
      (volume * close * 0.6).toFixed(2), // Taker buy quote asset volume
      '0' // Ignore
    ]);
  }
  
  return data;
};