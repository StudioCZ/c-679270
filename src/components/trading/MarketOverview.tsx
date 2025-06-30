import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";

const MarketOverview = () => {
  const { lastPrice, priceChange, priceChangePercent, volume, high24h, low24h } = useBinanceWebSocket("BTCUSDT");

  const marketData = [
    {
      title: "BTC Price",
      value: `$${lastPrice?.toLocaleString() || "43,250.00"}`,
      change: priceChange || 125,
      changePercent: priceChangePercent || 2.85,
      icon: DollarSign,
    },
    {
      title: "24h Volume",
      value: `${(volume || 28450).toLocaleString()} BTC`,
      change: 1250,
      changePercent: 4.6,
      icon: Activity,
    },
    {
      title: "24h High",
      value: `$${high24h?.toLocaleString() || "43,890.00"}`,
      change: 0,
      changePercent: 0,
      icon: TrendingUp,
    },
    {
      title: "24h Low",
      value: `$${low24h?.toLocaleString() || "42,150.00"}`,
      change: 0,
      changePercent: 0,
      icon: TrendingDown,
    },
  ];

  const marketSentiment = {
    fearGreedIndex: 65,
    sentiment: "Greed",
    dominance: 42.3,
    volatility: "Medium",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
      {/* Market Data Cards */}
      {marketData.map((item, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              {item.title}
              <item.icon className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            {item.change !== 0 && (
              <div className={`text-sm flex items-center space-x-1 ${
                item.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>{item.change >= 0 ? '↗' : '↘'}</span>
                <span>+${Math.abs(item.change).toFixed(2)}</span>
                <span>({item.changePercent.toFixed(2)}%)</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Market Sentiment */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Fear & Greed Index</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold">{marketSentiment.fearGreedIndex}</span>
              <Badge 
                variant="outline" 
                className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30"
              >
                {marketSentiment.sentiment}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">BTC Dominance</span>
            <span className="font-semibold">{marketSentiment.dominance}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Volatility</span>
            <Badge variant="secondary" className="text-xs">
              {marketSentiment.volatility}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOverview;