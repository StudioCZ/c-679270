import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign, Wifi, WifiOff } from "lucide-react";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { useBinanceMarketData } from "@/hooks/useBinanceMarketData";

const MarketOverview = () => {
  const { 
    lastPrice, 
    priceChange, 
    priceChangePercent, 
    volume, 
    high24h, 
    low24h, 
    isConnected,
    connectionError 
  } = useBinanceWebSocket("BTCUSDT");
  
  const { data: marketData, isLoading, error } = useBinanceMarketData("BTCUSDT");

  // Use real-time data if available, otherwise fall back to REST API data
  const currentPrice = lastPrice || (marketData ? parseFloat(marketData.lastPrice) : null);
  const currentChange = priceChange || (marketData ? parseFloat(marketData.priceChange) : null);
  const currentChangePercent = priceChangePercent || (marketData ? parseFloat(marketData.priceChangePercent) : null);
  const currentVolume = volume || (marketData ? parseFloat(marketData.volume) : null);
  const currentHigh = high24h || (marketData ? parseFloat(marketData.highPrice) : null);
  const currentLow = low24h || (marketData ? parseFloat(marketData.lowPrice) : null);

  const marketDataCards = [
    {
      title: "BTC Price",
      value: currentPrice ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading...",
      change: currentChange || 0,
      changePercent: currentChangePercent || 0,
      icon: DollarSign,
      isLoading: !currentPrice,
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
            <span>{isConnected ? "Live Data" : "Reconnecting..."}</span>
          </Badge>
          <span className="text-xs text-muted-foreground">
            Source: Binance API
          </span>
        </div>
        
        {connectionError && (
          <Badge variant="destructive" className="text-xs">
            {connectionError}
          </Badge>
        )}
      </div>

      {/* Market Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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

        {/* Real-time Market Sentiment */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Real-time Market Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Source</span>
              <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                Binance Live API
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Update Frequency</span>
              <span className="font-semibold text-xs">Real-time</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Update</span>
              <span className="font-semibold text-xs">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            {marketData && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Trade Count (24h)</span>
                <span className="font-semibold text-xs">
                  {marketData.count.toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4 text-red-500" />
              <div className="text-sm text-red-600 dark:text-red-400">
                <div className="font-medium">API Connection Error</div>
                <div className="text-xs mt-1">
                  Unable to fetch real-time data from Binance. Retrying automatically...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketOverview;