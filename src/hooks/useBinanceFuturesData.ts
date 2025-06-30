import { useQuery } from '@tanstack/react-query';
import { binanceFuturesAPI } from '@/services/binanceFutures';

// Hook for futures klines data
export const useBinanceFuturesKlines = (symbol: string, interval: string, limit: number = 500) => {
  return useQuery({
    queryKey: ['binance-futures-klines', symbol, interval, limit],
    queryFn: () => binanceFuturesAPI.getKlines(symbol, interval, limit),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
  });
};

// Hook for current price
export const useBinanceFuturesPrice = (symbol: string) => {
  return useQuery({
    queryKey: ['binance-futures-price', symbol],
    queryFn: () => binanceFuturesAPI.getPrice(symbol),
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
    retry: 3,
  });
};

// Hook for futures 24hr ticker
export const useBinanceFuturesTicker = (symbol: string) => {
  return useQuery({
    queryKey: ['binance-futures-ticker', symbol],
    queryFn: () => binanceFuturesAPI.get24hrTicker(symbol),
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 3,
  });
};

// Hook for futures order book
export const useBinanceFuturesOrderBook = (symbol: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['binance-futures-orderbook', symbol, limit],
    queryFn: () => binanceFuturesAPI.getDepth(symbol, limit),
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
    retry: 3,
  });
};

// Hook for premium index and funding rate
export const useBinanceFuturesPremiumIndex = (symbol: string) => {
  return useQuery({
    queryKey: ['binance-futures-premium', symbol],
    queryFn: () => binanceFuturesAPI.getPremiumIndex(symbol),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
  });
};

// Hook for open interest
export const useBinanceFuturesOpenInterest = (symbol: string) => {
  return useQuery({
    queryKey: ['binance-futures-oi', symbol],
    queryFn: () => binanceFuturesAPI.getOpenInterest(symbol),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
  });
};

// Hook for exchange info
export const useBinanceFuturesExchangeInfo = () => {
  return useQuery({
    queryKey: ['binance-futures-exchange-info'],
    queryFn: () => binanceFuturesAPI.getExchangeInfo(),
    staleTime: 300000, // 5 minutes - exchange info doesn't change often
    retry: 3,
  });
};

// Hook for all tickers
export const useBinanceFuturesAllTickers = () => {
  return useQuery({
    queryKey: ['binance-futures-all-tickers'],
    queryFn: () => binanceFuturesAPI.getAllTickers(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
  });
};

// Hook for recent trades
export const useBinanceFuturesRecentTrades = (symbol: string, limit: number = 100) => {
  return useQuery({
    queryKey: ['binance-futures-recent-trades', symbol, limit],
    queryFn: () => binanceFuturesAPI.getRecentTrades(symbol, limit),
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 3,
  });
};

// Hook for aggregate trades
export const useBinanceFuturesAggTrades = (symbol: string, limit: number = 100) => {
  return useQuery({
    queryKey: ['binance-futures-agg-trades', symbol, limit],
    queryFn: () => binanceFuturesAPI.getAggTrades(symbol, limit),
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 3,
  });
};

// Hook for funding rate history
export const useBinanceFuturesFundingHistory = (symbol: string, limit: number = 100) => {
  return useQuery({
    queryKey: ['binance-futures-funding-history', symbol, limit],
    queryFn: () => binanceFuturesAPI.getFundingRateHistory(symbol, limit),
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 180000, // Consider data stale after 3 minutes
    retry: 3,
  });
};

// Hook for open interest statistics
export const useBinanceFuturesOpenInterestStats = (symbol: string, period: string = '5m', limit: number = 30) => {
  return useQuery({
    queryKey: ['binance-futures-oi-stats', symbol, period, limit],
    queryFn: () => binanceFuturesAPI.getOpenInterestStats(symbol, period, limit),
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 180000, // Consider data stale after 3 minutes
    retry: 3,
  });
};

// Hook for top trader long/short ratio
export const useBinanceFuturesTopTraderRatio = (symbol: string, period: string = '5m', limit: number = 30) => {
  return useQuery({
    queryKey: ['binance-futures-top-trader-ratio', symbol, period, limit],
    queryFn: () => binanceFuturesAPI.getTopTraderRatio(symbol, period, limit),
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 180000, // Consider data stale after 3 minutes
    retry: 3,
  });
};

// Hook for global long/short ratio
export const useBinanceFuturesGlobalRatio = (symbol: string, period: string = '5m', limit: number = 30) => {
  return useQuery({
    queryKey: ['binance-futures-global-ratio', symbol, period, limit],
    queryFn: () => binanceFuturesAPI.getGlobalLongShortRatio(symbol, period, limit),
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 180000, // Consider data stale after 3 minutes
    retry: 3,
  });
};