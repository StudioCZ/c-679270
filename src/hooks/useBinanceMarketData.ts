import { useQuery } from '@tanstack/react-query';

interface MarketStats {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export const useBinanceMarketData = (symbol: string) => {
  return useQuery({
    queryKey: ['binance-market-data', symbol],
    queryFn: async (): Promise<MarketStats> => {
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
      
      console.log('🔄 Fetching real Binance market data:', { symbol, url });
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Real Binance market data fetched:', {
          symbol: data.symbol,
          price: data.lastPrice,
          change: data.priceChangePercent,
          volume: data.volume
        });
        
        return data;
      } catch (error) {
        console.error('❌ Error fetching real Binance market data:', error);
        throw error;
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
  });
};