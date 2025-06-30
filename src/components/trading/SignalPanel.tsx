import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Shield } from "lucide-react";

const SignalPanel = () => {
  const currentSignal = {
    type: "BUY",
    confidence: 85,
    entry: 43250,
    stopLoss: 42800,
    takeProfit: 44100,
    riskReward: 2.3,
    timeframe: "1H",
    strategies: ["SMC", "Elliott Wave", "RSI Divergence"],
    timestamp: new Date().toLocaleTimeString(),
  };

  const indicators = [
    { name: "RSI", value: 35, status: "oversold", color: "text-green-400" },
    { name: "MACD", value: "Bullish Cross", status: "bullish", color: "text-green-400" },
    { name: "EMA 50/200", value: "Golden Cross", status: "bullish", color: "text-green-400" },
    { name: "Volume", value: "High", status: "confirming", color: "text-blue-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Current Signal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Current Signal</span>
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
              <span className="text-muted-foreground">Confidence</span>
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
                <span className="text-sm text-muted-foreground">Entry</span>
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
            <div className="text-sm font-medium">Strategy Confirmation</div>
            <div className="flex flex-wrap gap-1">
              {currentSignal.strategies.map((strategy) => (
                <Badge key={strategy} variant="secondary" className="text-xs">
                  ✓ {strategy}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Generated at {currentSignal.timestamp}
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Technical Indicators</CardTitle>
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
          <Button className="w-full" size="sm">
            Copy Signal
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            Set Alert
          </Button>
          <Button variant="ghost" className="w-full" size="sm">
            View Analysis
          </Button>
        </CardContent>
      </Card>

      {/* Risk Warning */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              <div className="font-medium mb-1">Risk Warning</div>
              <div>
                Trading involves substantial risk. Never risk more than you can afford to lose.
                Past performance does not guarantee future results.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignalPanel;