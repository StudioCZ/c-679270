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
    queryKey: ['binance-klines', symbol, timeframe],
    queryFn: async () => {
      const interval = timeframeMap[timeframe] || '1h';
      const url = `/binance-api/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`;
      
      console.log('🔄 Fetching real Binance data:', { symbol, interval, url });
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate the data structure
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid data format received from Binance API');
        }
        
        console.log('✅ Real Binance data fetched successfully:', {
          symbol,
          interval,
          dataPoints: data.length,
          latestPrice: data[data.length - 1][4]
        });
        
        return data;
      } catch (error) {
        console.error('❌ Error fetching real Binance data:', error);
        throw error; // Re-throw to let React Query handle retries
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 5, // Retry failed requests up to 5 times
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    throwOnError: false, // Don't throw errors to prevent app crashes
  });
};