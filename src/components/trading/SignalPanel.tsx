import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Shield, Copy, Bell, Eye, Wifi } from "lucide-react";
import { toast } from "sonner";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { useBinanceMarketData } from "@/hooks/useBinanceMarketData";

const SignalPanel = () => {
  const { lastPrice, priceChangePercent, isConnected } = useBinanceWebSocket("BTCUSDT");
  const { data: marketData } = useBinanceMarketData("BTCUSDT");

  // Generate signals based on real market data
  const generateSignalFromRealData = () => {
    if (!lastPrice || !marketData) return null;

    const currentPrice = lastPrice;
    const change24h = parseFloat(marketData.priceChangePercent);
    const volume = parseFloat(marketData.volume);
    const high24h = parseFloat(marketData.highPrice);
    const low24h = parseFloat(marketData.lowPrice);
    
    // Simple signal logic based on real data
    const isNearHigh = currentPrice > (high24h * 0.98);
    const isNearLow = currentPrice < (low24h * 1.02);
    const isHighVolume = volume > 25000; // Above average volume
    
    let signalType: "BUY" | "SELL" = "BUY";
    let confidence = 50;
    let strategies: string[] = [];
    
    // Signal generation logic using real data
    if (change24h < -2 && isNearLow && isHighVolume) {
      signalType = "BUY";
      confidence = 75;
      strategies = ["Oversold Bounce", "High Volume Support"];
    } else if (change24h > 3 && isNearHigh) {
      signalType = "SELL";
      confidence = 70;
      strategies = ["Overbought", "Resistance Level"];
    } else if (change24h > 0 && isHighVolume) {
      signalType = "BUY";
      confidence = 65;
      strategies = ["Momentum", "Volume Confirmation"];
    } else {
      signalType = change24h >= 0 ? "BUY" : "SELL";
      confidence = 55;
      strategies = ["Price Action"];
    }

    const stopLossPercent = 2.5;
    const takeProfitRatio = 2.0;
    
    const stopLoss = signalType === "BUY" 
      ? currentPrice * (1 - stopLossPercent / 100)
      : currentPrice * (1 + stopLossPercent / 100);
      
    const takeProfit = signalType === "BUY"
      ? currentPrice + (currentPrice - stopLoss) * takeProfitRatio
      : currentPrice - (stopLoss - currentPrice) * takeProfitRatio;

    return {
      type: signalType,
      confidence,
      entry: currentPrice,
      stopLoss,
      takeProfit,
      riskReward: takeProfitRatio,
      timeframe: "1H",
      strategies,
      timestamp: new Date().toLocaleTimeString(),
      basedOnRealData: true,
    };
  };

  const currentSignal = generateSignalFromRealData();

  const indicators = [
    { 
      name: "Price Change 24h", 
      value: marketData ? `${parseFloat(marketData.priceChangePercent).toFixed(2)}%` : "Loading...", 
      status: marketData && parseFloat(marketData.priceChangePercent) > 0 ? "bullish" : "bearish", 
      color: marketData && parseFloat(marketData.priceChangePercent) > 0 ? "text-green-400" : "text-red-400" 
    },
    { 
      name: "24h Volume", 
      value: marketData ? `${(parseFloat(marketData.volume) / 1000).toFixed(1)}K BTC` : "Loading...", 
      status: "active", 
      color: "text-blue-400" 
    },
    { 
      name: "Price Position", 
      value: lastPrice && marketData ? 
        `${(((lastPrice - parseFloat(marketData.lowPrice)) / (parseFloat(marketData.highPrice) - parseFloat(marketData.lowPrice))) * 100).toFixed(1)}%` : 
        "Loading...", 
      status: "neutral", 
      color: "text-yellow-400" 
    },
    { 
      name: "Trade Count", 
      value: marketData ? `${(marketData.count / 1000).toFixed(0)}K` : "Loading...", 
      status: "active", 
      color: "text-purple-400" 
    },
  ];

  const handleCopySignal = () => {
    if (!currentSignal) {
      toast.error("No signal available to copy");
      return;
    }

    const signalText = `
🚀 BTC/USDT ${currentSignal.type} Signal (Real Binance Data)
📊 Entry: $${currentSignal.entry.toLocaleString()}
🛡️ Stop Loss: $${currentSignal.stopLoss.toLocaleString()}
🎯 Take Profit: $${currentSignal.takeProfit.toLocaleString()}
📈 Risk:Reward: 1:${currentSignal.riskReward}
⏰ Timeframe: ${currentSignal.timeframe}
🎯 Confidence: ${currentSignal.confidence}%
📋 Based on: ${currentSignal.strategies.join(', ')}
🔗 Data Source: Binance Live API
    `.trim();

    navigator.clipboard.writeText(signalText).then(() => {
      toast.success("Real signal copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy signal");
    });
  };

  const handleSetAlert = () => {
    if (!currentSignal) {
      toast.error("No signal available for alert");
      return;
    }
    toast.success("Alert set for real-time signal!");
  };

  const handleViewAnalysis = () => {
    toast.info("Opening detailed analysis of real market data...");
  };

  if (!currentSignal) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading real market data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real Data Indicator */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-blue-500" />
            <div className="text-sm">
              <div className="font-medium text-blue-400">Real Binance Data</div>
              <div className="text-xs text-blue-300">
                Signals generated from live market data • {isConnected ? 'Connected' : 'Reconnecting...'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Signal */}
      <Card className={`border-l-4 ${currentSignal.type === "BUY" ? "border-l-green-500" : "border-l-red-500"}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Live Signal</span>
            <Badge 
              className={`${
                currentSignal.type === "BUY" 
                  ? "bg-green-500/20 text-green-400 border-green-500/30" 
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {currentSignal.type === "BUY" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {currentSignal.type}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confidence (Real Data)</span>
              <span className="font-semibold text-primary">{currentSignal.confidence}%</span>
            </div>
            <Progress value={currentSignal.confidence} className="h-2" />
          </div>

          <Separator />

          {/* Trade Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-muted-foreground">Entry (Live Price)</span>
              </div>
              <span className="font-mono font-semibold">${currentSignal.entry.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-sm text-muted-foreground">Stop Loss</span>
              </div>
              <span className="font-mono text-red-400">${currentSignal.stopLoss.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-muted-foreground">Take Profit</span>
              </div>
              <span className="font-mono text-green-400">${currentSignal.takeProfit.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Risk:Reward</span>
              <span className="font-semibold text-primary">1:{currentSignal.riskReward}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Timeframe</span>
              <Badge variant="outline">{currentSignal.timeframe}</Badge>
            </div>
          </div>

          <Separator />

          {/* Strategy Confirmation */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Real Market Analysis</div>
            <div className="flex flex-wrap gap-1">
              {currentSignal.strategies.map((strategy) => (
                <Badge key={strategy} variant="secondary" className="text-xs">
                  ✓ {strategy}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Generated at {currentSignal.timestamp} • Based on live Binance data
          </div>
        </CardContent>
      </Card>

      {/* Real-time Technical Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Live Market Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {indicators.map((indicator) => (
            <div key={indicator.name} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{indicator.name}</span>
              <div className="text-right">
                <div className={`text-sm font-medium ${indicator.color}`}>
                  {indicator.value}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {indicator.status}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            className="w-full" 
            size="sm"
            onClick={handleCopySignal}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Live Signal
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={handleSetAlert}
          >
            <Bell className="w-4 h-4 mr-2" />
            Set Real-time Alert
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            size="sm"
            onClick={handleViewAnalysis}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Market Analysis
          </Button>
        </CardContent>
      </Card>

      {/* Risk Warning */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              <div className="font-medium mb-1">Risk Warning</div>
              <div>
                Signals are based on real market data but trading involves substantial risk. 
                Never risk more than you can afford to lose. Past performance does not guarantee future results.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignalPanel;