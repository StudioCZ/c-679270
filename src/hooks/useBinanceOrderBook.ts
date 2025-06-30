import { useQuery } from '@tanstack/react-query';

interface OrderBookEntry {
  price: string;
  quantity: string;
}

interface OrderBook {
  lastUpdateId: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export const useBinanceOrderBook = (symbol: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['binance-orderbook', symbol, limit],
    queryFn: async (): Promise<OrderBook> => {
      const url = `/binance-api/api/v3/depth?symbol=${symbol}&limit=${limit}`;
      
      console.log('🔄 Fetching real Binance order book:', { symbol, limit, url });
      
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
        
        console.log('✅ Real Binance order book fetched:', {
          symbol,
          bids: data.bids.length,
          asks: data.asks.length,
          spread: (parseFloat(data.asks[0][0]) - parseFloat(data.bids[0][0])).toFixed(2)
        });
        
        return data;
      } catch (error) {
        console.error('❌ Error fetching real Binance order book:', error);
        throw error;
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
  });
};