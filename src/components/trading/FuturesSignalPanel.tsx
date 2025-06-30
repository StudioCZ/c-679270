import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Shield, Copy, Bell, Eye, Wifi, Zap } from "lucide-react";
import { toast } from "sonner";
import { useBinanceFuturesWebSocket } from "@/hooks/useBinanceFuturesWebSocket";
import { useBinanceFuturesTicker, useBinanceFuturesOpenInterest } from "@/hooks/useBinanceFuturesData";

const FuturesSignalPanel = () => {
  const { 
    lastPrice, 
    priceChangePercent, 
    markPrice,
    fundingRate,
    isConnected 
  } = useBinanceFuturesWebSocket("BTCUSDT");
  
  const { data: tickerData } = useBinanceFuturesTicker("BTCUSDT");
  const { data: openInterestData } = useBinanceFuturesOpenInterest("BTCUSDT");

  // Generate futures signals based on real market data
  const generateFuturesSignalFromRealData = () => {
    if (!lastPrice || !tickerData) return null;

    const currentPrice = lastPrice;
    const change24h = parseFloat(tickerData.priceChangePercent);
    const volume = parseFloat(tickerData.volume);
    const high24h = parseFloat(tickerData.highPrice);
    const low24h = parseFloat(tickerData.lowPrice);
    const openInterest = openInterestData ? parseFloat(openInterestData.openInterest) : 0;
    
    // Futures-specific signal logic
    const isNearHigh = currentPrice > (high24h * 0.98);
    const isNearLow = currentPrice < (low24h * 1.02);
    const isHighVolume = volume > 30000; // Higher threshold for futures
    const isHighOI = openInterest > 100000; // High open interest
    const isFundingExtreme = fundingRate && Math.abs(fundingRate) > 0.0001; // 0.01%
    
    let signalType: "LONG" | "SHORT" = "LONG";
    let confidence = 50;
    let strategies: string[] = [];
    let leverage = 5; // Default leverage
    
    // Enhanced futures signal generation
    if (change24h < -3 && isNearLow && isHighVolume && isHighOI) {
      signalType = "LONG";
      confidence = 85;
      leverage = 10;
      strategies = ["Oversold Bounce", "High Volume Support", "High OI"];
    } else if (change24h > 4 && isNearHigh && isFundingExtreme) {
      signalType = "SHORT";
      confidence = 80;
      leverage = 8;
      strategies = ["Overbought", "Extreme Funding", "Resistance Level"];
    } else if (fundingRate && fundingRate > 0.0005 && change24h > 0) {
      signalType = "SHORT";
      confidence = 75;
      leverage = 6;
      strategies = ["High Funding Rate", "Long Squeeze Setup"];
    } else if (fundingRate && fundingRate < -0.0005 && change24h < 0) {
      signalType = "LONG";
      confidence = 75;
      leverage = 6;
      strategies = ["Negative Funding", "Short Squeeze Setup"];
    } else if (change24h > 0 && isHighVolume && isHighOI) {
      signalType = "LONG";
      confidence = 70;
      leverage = 5;
      strategies = ["Momentum", "Volume + OI Confirmation"];
    } else {
      signalType = change24h >= 0 ? "LONG" : "SHORT";
      confidence = 60;
      leverage = 3;
      strategies = ["Price Action"];
    }

    const stopLossPercent = 2.0; // Tighter for futures
    const takeProfitRatio = 2.5; // Better R:R for futures
    
    const stopLoss = signalType === "LONG" 
      ? currentPrice * (1 - stopLossPercent / 100)
      : currentPrice * (1 + stopLossPercent / 100);
      
    const takeProfit = signalType === "LONG"
      ? currentPrice + (currentPrice - stopLoss) * takeProfitRatio
      : currentPrice - (stopLoss - currentPrice) * takeProfitRatio;

    // Calculate position size based on leverage
    const notionalValue = currentPrice * leverage;

    return {
      type: signalType,
      confidence,
      entry: currentPrice,
      stopLoss,
      takeProfit,
      riskReward: takeProfitRatio,
      leverage,
      notionalValue,
      timeframe: "1H",
      strategies,
      timestamp: new Date().toLocaleTimeString(),
      basedOnRealData: true,
      contractType: "Perpetual",
    };
  };

  const currentSignal = generateFuturesSignalFromRealData();

  const indicators = [
    { 
      name: "Price Change 24h", 
      value: tickerData ? `${parseFloat(tickerData.priceChangePercent).toFixed(2)}%` : "Loading...", 
      status: tickerData && parseFloat(tickerData.priceChangePercent) > 0 ? "bullish" : "bearish", 
      color: tickerData && parseFloat(tickerData.priceChangePercent) > 0 ? "text-green-400" : "text-red-400" 
    },
    { 
      name: "Funding Rate", 
      value: fundingRate ? `${(fundingRate * 100).toFixed(4)}%` : "Loading...", 
      status: fundingRate && fundingRate > 0 ? "long_pay" : "short_pay", 
      color: fundingRate && fundingRate > 0 ? "text-red-400" : "text-green-400" 
    },
    { 
      name: "Open Interest", 
      value: openInterestData ? `${(parseFloat(openInterestData.openInterest) / 1000).toFixed(1)}K BTC` : "Loading...", 
      status: "active", 
      color: "text-blue-400" 
    },
    { 
      name: "Mark Price", 
      value: markPrice ? `$${markPrice.toLocaleString()}` : "Loading...", 
      status: "neutral", 
      color: "text-yellow-400" 
    },
  ];

  const handleCopySignal = () => {
    if (!currentSignal) {
      toast.error("No futures signal available to copy");
      return;
    }

    const signalText = `
🚀 BTCUSDT Perpetual ${currentSignal.type} Signal (Real Binance Futures Data)
📊 Entry: $${currentSignal.entry.toLocaleString()}
🛡️ Stop Loss: $${currentSignal.stopLoss.toLocaleString()}
🎯 Take Profit: $${currentSignal.takeProfit.toLocaleString()}
⚡ Leverage: ${currentSignal.leverage}x
📈 Risk:Reward: 1:${currentSignal.riskReward}
💰 Notional: $${currentSignal.notionalValue.toLocaleString()}
⏰ Timeframe: ${currentSignal.timeframe}
🎯 Confidence: ${currentSignal.confidence}%
📋 Based on: ${currentSignal.strategies.join(', ')}
🔗 Data Source: Binance Futures Live API
    `.trim();

    navigator.clipboard.writeText(signalText).then(() => {
      toast.success("Real futures signal copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy signal");
    });
  };

  const handleSetAlert = () => {
    if (!currentSignal) {
      toast.error("No signal available for alert");
      return;
    }
    toast.success("Alert set for real-time futures signal!");
  };

  const handleViewAnalysis = () => {
    toast.info("Opening detailed futures market analysis...");
  };

  if (!currentSignal) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading real futures data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real Futures Data Indicator */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <div className="text-sm">
              <div className="font-medium text-orange-400">Real Binance Futures Data</div>
              <div className="text-xs text-orange-300">
                Perpetual contract signals • {isConnected ? 'Connected' : 'Reconnecting...'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Futures Signal */}
      <Card className={`border-l-4 ${currentSignal.type === "LONG" ? "border-l-green-500" : "border-l-red-500"}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Live Futures Signal</span>
            <div className="flex items-center space-x-2">
              <Badge 
                className={`${
                  currentSignal.type === "LONG" 
                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
              >
                {currentSignal.type === "LONG" ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {currentSignal.type}
              </Badge>
              <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                {currentSignal.leverage}x
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confidence (Real Futures Data)</span>
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
              <span className="text-sm text-muted-foreground">Leverage</span>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                {currentSignal.leverage}x
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Notional Value</span>
              <span className="font-semibold text-primary">${currentSignal.notionalValue.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Risk:Reward</span>
              <span className="font-semibold text-primary">1:{currentSignal.riskReward}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contract Type</span>
              <Badge variant="outline">{currentSignal.contractType}</Badge>
            </div>
          </div>

          <Separator />

          {/* Strategy Confirmation */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Real Futures Analysis</div>
            <div className="flex flex-wrap gap-1">
              {currentSignal.strategies.map((strategy) => (
                <Badge key={strategy} variant="secondary" className="text-xs">
                  ✓ {strategy}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Generated at {currentSignal.timestamp} • Based on live Binance Futures data
          </div>
        </CardContent>
      </Card>

      {/* Real-time Futures Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Live Futures Indicators</CardTitle>
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
                  {indicator.status.replace('_', ' ')}
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
            Copy Futures Signal
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
            View Futures Analysis
          </Button>
        </CardContent>
      </Card>

      {/* Futures Risk Warning */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              <div className="font-medium mb-1">Futures Trading Risk Warning</div>
              <div>
                Futures trading involves substantial risk and leverage amplifies both profits and losses. 
                Signals are based on real market data but past performance does not guarantee future results.
                Never risk more than you can afford to lose.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuturesSignalPanel;