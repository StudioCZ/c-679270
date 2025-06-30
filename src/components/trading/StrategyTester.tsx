import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart3, TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";

const StrategyTester = () => {
  const [selectedStrategy, setSelectedStrategy] = useState("smc-elliott");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [backtestPeriod, setBacktestPeriod] = useState("30d");
  const [isRunning, setIsRunning] = useState(false);

  const strategies = [
    { value: "smc-elliott", label: "SMC + Elliott Wave" },
    { value: "rsi-macd", label: "RSI + MACD Divergence" },
    { value: "breakout", label: "Break of Structure" },
    { value: "combined", label: "All Strategies Combined" },
  ];

  const backtestResults = {
    totalTrades: 156,
    winningTrades: 112,
    losingTrades: 44,
    winRate: 71.8,
    avgRiskReward: 2.3,
    totalReturn: 24.5,
    maxDrawdown: 8.2,
    sharpeRatio: 1.85,
    profitFactor: 2.1,
    avgWin: 2.8,
    avgLoss: -1.2,
  };

  const monthlyReturns = [
    { month: "Jan", return: 3.2 },
    { month: "Feb", return: -1.5 },
    { month: "Mar", return: 5.8 },
    { month: "Apr", return: 2.1 },
    { month: "May", return: 4.3 },
    { month: "Jun", return: -0.8 },
  ];

  const runBacktest = () => {
    setIsRunning(true);
    // Simulate backtest running
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Backtest Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Strategy Backtest Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Strategy</label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={backtestPeriod} onValueChange={setBacktestPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={runBacktest} 
            disabled={isRunning}
            className="w-full md:w-auto"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Backtest...
              </>
            ) : (
              "Run Backtest"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Backtest Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Trades</div>
                <div className="text-2xl font-bold">{backtestResults.totalTrades}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Win Rate</div>
                <div className="text-2xl font-bold text-green-400">
                  {backtestResults.winRate}%
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Winning Trades</span>
                <span className="font-semibold text-green-400">{backtestResults.winningTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Losing Trades</span>
                <span className="font-semibold text-red-400">{backtestResults.losingTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Risk:Reward</span>
                <span className="font-semibold">1:{backtestResults.avgRiskReward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Return</span>
                <span className="font-semibold text-green-400">+{backtestResults.totalReturn}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Max Drawdown</span>
                <span className="font-semibold text-red-400">-{backtestResults.maxDrawdown}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                <span className="font-semibold">{backtestResults.sharpeRatio}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profit Factor</span>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  {backtestResults.profitFactor}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average Win</span>
                  <span className="font-semibold text-green-400">+{backtestResults.avgWin}%</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average Loss</span>
                  <span className="font-semibold text-red-400">{backtestResults.avgLoss}%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-sm font-medium">Monthly Returns</div>
              {monthlyReturns.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{month.month}</span>
                  <span className={`font-semibold ${
                    month.return >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {month.return >= 0 ? '+' : ''}{month.return}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Strategy</th>
                  <th className="text-right py-2">Win Rate</th>
                  <th className="text-right py-2">Avg R:R</th>
                  <th className="text-right py-2">Total Return</th>
                  <th className="text-right py-2">Max DD</th>
                  <th className="text-right py-2">Sharpe</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2">SMC + Elliott Wave</td>
                  <td className="text-right text-green-400">71.8%</td>
                  <td className="text-right">1:2.3</td>
                  <td className="text-right text-green-400">+24.5%</td>
                  <td className="text-right text-red-400">-8.2%</td>
                  <td className="text-right">1.85</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">RSI + MACD</td>
                  <td className="text-right text-green-400">68.2%</td>
                  <td className="text-right">1:2.1</td>
                  <td className="text-right text-green-400">+19.3%</td>
                  <td className="text-right text-red-400">-12.1%</td>
                  <td className="text-right">1.62</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Break of Structure</td>
                  <td className="text-right text-green-400">65.4%</td>
                  <td className="text-right">1:1.8</td>
                  <td className="text-right text-green-400">+15.7%</td>
                  <td className="text-right text-red-400">-9.8%</td>
                  <td className="text-right">1.43</td>
                </tr>
                <tr>
                  <td className="py-2">Combined</td>
                  <td className="text-right text-green-400">74.1%</td>
                  <td className="text-right">1:2.5</td>
                  <td className="text-right text-green-400">+28.9%</td>
                  <td className="text-right text-red-400">-7.1%</td>
                  <td className="text-right">2.03</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyTester;