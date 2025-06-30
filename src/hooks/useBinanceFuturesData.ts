import { useQuery } from '@tanstack/react-query';
import { binanceFuturesAPI } from '@/services/binanceFutures';

// Hook for futures klines data
export const useBinanceFuturesKlines = (symbol: string, interval: string, limit: number = 500) => {
  return useQuery({
    queryKey: ['binance-futures-klines', symbol, interval, limit],
    queryFn: () => binanceFuturesAPI.getKlines(symbol, interval, limit),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });
};

// Hook for futures 24hr ticker
export const useBinanceFuturesTicker = (symbol: string) => {
  return useQuery({
    queryKey: ['binance-futures-ticker', symbol],
    queryFn: () => binanceFuturesAPI.get24hrTicker(symbol),
    refetchInterval: 10000,
    staleTime: 5000,
    retry: 3,
  });
};

// Hook for futures order book
export const useBinanceFuturesOrderBook = (symbol: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['binance-futures-orderbook', symbol, limit],
    queryFn: () => binanceFuturesAPI.getDepth(symbol, limit),
    refetchInterval: 5000,
    staleTime: 2000,
    retry: 3,
  });
};

// Hook for premium index and funding rate
export const useBinanceFuturesPremiumIndex = (symbol: string) => {
  return useQuery({
    queryKey: ['binance-futures-premium', symbol],
    queryFn: () => binanceFuturesAPI.getPremiumIndex(symbol),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
  });
};

// Hook for open interest
export const useBinanceFuturesOpenInterest = (symbol: string) => {
  return useQuery({
    queryKey: ['binance-futures-oi', symbol],
    queryFn: () => binanceFuturesAPI.getOpenInterest(symbol),
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 3,
  });
};

// Hook for exchange info
export const useBinanceFuturesExchangeInfo = () => {
  return useQuery({
    queryKey: ['binance-futures-exchange-info'],
    queryFn: () => binanceFuturesAPI.getExchangeInfo(),
    staleTime: 300000, // 5 minutes
    retry: 3,
  });
};

// Hook for account information (requires API credentials)
export const useBinanceFuturesAccount = () => {
  return useQuery({
    queryKey: ['binance-futures-account'],
    queryFn: () => binanceFuturesAPI.getAccount(),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 2,
    enabled: !!(import.meta.env.VITE_BINANCE_API_KEY && import.meta.env.VITE_BINANCE_API_SECRET),
  });
};

// Hook for position risk (requires API credentials)
export const useBinanceFuturesPositions = (symbol?: string) => {
  return useQuery({
    queryKey: ['binance-futures-positions', symbol],
    queryFn: () => binanceFuturesAPI.getPositionRisk(symbol),
    refetchInterval: 15000,
    staleTime: 10000,
    retry: 2,
    enabled: !!(import.meta.env.VITE_BINANCE_API_KEY && import.meta.env.VITE_BINANCE_API_SECRET),
  });
};

// Hook for leverage brackets
export const useBinanceFuturesLeverageBrackets = (symbol?: string) => {
  return useQuery({
    queryKey: ['binance-futures-leverage-brackets', symbol],
    queryFn: () => binanceFuturesAPI.getLeverageBrackets(symbol),
    staleTime: 300000, // 5 minutes
    retry: 2,
    enabled: !!(import.meta.env.VITE_BINANCE_API_KEY && import.meta.env.VITE_BINANCE_API_SECRET),
  });
};