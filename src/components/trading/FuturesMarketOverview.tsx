import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign, Wifi, WifiOff, Target, Shield } from "lucide-react";
import { useBinanceFuturesWebSocket } from "@/hooks/useBinanceFuturesWebSocket";
import { useBinanceFuturesTicker, useBinanceFuturesOpenInterest, useBinanceFuturesPremiumIndex } from "@/hooks/useBinanceFuturesData";

const FuturesMarketOverview = () => {
  const { 
    lastPrice, 
    priceChange, 
    priceChangePercent, 
    volume, 
    high24h, 
    low24h,
    markPrice,
    fundingRate,
    nextFundingTime,
    isConnected,
    connectionError 
  } = useBinanceFuturesWebSocket("BTCUSDT");
  
  const { data: tickerData, isLoading: tickerLoading } = useBinanceFuturesTicker("BTCUSDT");
  const { data: openInterestData } = useBinanceFuturesOpenInterest("BTCUSDT");
  const { data: premiumData } = useBinanceFuturesPremiumIndex("BTCUSDT");

  // Use real-time data if available, otherwise fall back to REST API data
  const currentPrice = lastPrice || (tickerData ? parseFloat(tickerData.lastPrice) : null);
  const currentChange = priceChange || (tickerData ? parseFloat(tickerData.priceChange) : null);
  const currentChangePercent = priceChangePercent || (tickerData ? parseFloat(tickerData.priceChangePercent) : null);
  const currentVolume = volume || (tickerData ? parseFloat(tickerData.volume) : null);
  const currentHigh = high24h || (tickerData ? parseFloat(tickerData.highPrice) : null);
  const currentLow = low24h || (tickerData ? parseFloat(tickerData.lowPrice) : null);
  const currentMarkPrice = markPrice || (premiumData ? parseFloat(premiumData.markPrice) : null);
  const currentFundingRate = fundingRate || (premiumData ? parseFloat(premiumData.lastFundingRate) : null);

  const marketDataCards = [
    {
      title: "BTC Perpetual Price",
      value: currentPrice ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading...",
      change: currentChange || 0,
      changePercent: currentChangePercent || 0,
      icon: DollarSign,
      isLoading: !currentPrice,
    },
    {
      title: "Mark Price",
      value: currentMarkPrice ? `$${currentMarkPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading...",
      change: 0,
      changePercent: 0,
      icon: Target,
      isLoading: !currentMarkPrice,
    },
    {
      title: "24h Volume",
      value: currentVolume ? `${currentVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC` : "Loading...",
      change: 0,
      changePercent: 0,
      icon: Activity,
      isLoading: !currentVolume,
    },
    {
      title: "Open Interest",
      value: openInterestData ? `${parseFloat(openInterestData.openInterest).toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC` : "Loading...",
      change: 0,
      changePercent: 0,
      icon: Shield,
      isLoading: !openInterestData,
    },
    {
      title: "24h High",
      value: currentHigh ? `$${currentHigh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading...",
      change: 0,
      changePercent: 0,
      icon: TrendingUp,
      isLoading: !currentHigh,
    },
    {
      title: "24h Low",
      value: currentLow ? `$${currentLow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading...",
      change: 0,
      changePercent: 0,
      icon: TrendingDown,
      isLoading: !currentLow,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className="flex items-center space-x-1"
          >
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isConnected ? "Live Futures Data" : "Reconnecting..."}</span>
          </Badge>
          <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
            BTCUSDT Perpetual
          </Badge>
          <span className="text-xs text-muted-foreground">
            Source: Binance Futures API
          </span>
        </div>
        
        {connectionError && (
          <Badge variant="destructive" className="text-xs">
            {connectionError}
          </Badge>
        )}
      </div>

      {/* Market Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {marketDataCards.map((item, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                {item.title}
                <item.icon className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.isLoading ? (
                <div className="space-y-2">
                  <div className="h-8 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold font-mono">{item.value}</div>
                  {item.change !== 0 && (
                    <div className={`text-sm flex items-center space-x-1 ${
                      item.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <span>{item.change >= 0 ? '↗' : '↘'}</span>
                      <span>{item.change >= 0 ? '+' : ''}${Math.abs(item.change).toFixed(2)}</span>
                      <span>({item.changePercent.toFixed(2)}%)</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Futures-specific Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Funding Rate */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Funding Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className={`text-2xl font-bold font-mono ${
              currentFundingRate && currentFundingRate >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {currentFundingRate ? `${(currentFundingRate * 100).toFixed(4)}%` : 'Loading...'}
            </div>
            {nextFundingTime && (
              <div className="text-xs text-muted-foreground">
                Next: {new Date(nextFundingTime).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Difference */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Index Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentPrice && currentMarkPrice ? (
              <>
                <div className={`text-2xl font-bold font-mono ${
                  currentPrice >= currentMarkPrice ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${Math.abs(currentPrice - currentMarkPrice).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {((currentPrice - currentMarkPrice) / currentMarkPrice * 100).toFixed(4)}%
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold font-mono text-muted-foreground">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">WebSocket</span>
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Source</span>
              <Badge variant="outline" className="text-xs">
                Binance Futures
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Update</span>
              <span className="text-xs font-medium">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FuturesMarketOverview;