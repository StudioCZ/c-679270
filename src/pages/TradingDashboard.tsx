import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import TradingChart from "@/components/trading/TradingChart";
import SignalPanel from "@/components/trading/SignalPanel";
import StrategyTester from "@/components/trading/StrategyTester";
import SettingsPanel from "@/components/trading/SettingsPanel";
import MarketOverview from "@/components/trading/MarketOverview";
import { TrendingUp, TrendingDown, Activity, Settings, BarChart3, Bell } from "lucide-react";
import { useTheme } from "next-themes";

const TradingDashboard = () => {
  const [activeTimeframe, setActiveTimeframe] = useState("1h");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">BTC Signal Pro</h1>
              </div>
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <Switch
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                  id="alerts"
                />
                <Label htmlFor="alerts" className="text-sm">Alerts</Label>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Market Overview */}
          <div className="lg:col-span-4">
            <MarketOverview />
          </div>

          {/* Main Chart Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>BTC/USDT</span>
                    <Badge variant="secondary">Binance</Badge>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    {["1m", "15m", "1h", "4h", "1d"].map((tf) => (
                      <Button
                        key={tf}
                        variant={activeTimeframe === tf ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTimeframe(tf)}
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[520px]">
                <TradingChart timeframe={activeTimeframe} />
              </CardContent>
            </Card>
          </div>

          {/* Signal Panel */}
          <div className="lg:col-span-1">
            <SignalPanel />
          </div>

          {/* Tabs for Additional Features */}
          <div className="lg:col-span-4">
            <Tabs defaultValue="signals" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signals" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Active Signals</span>
                </TabsTrigger>
                <TabsTrigger value="backtest" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Strategy Tester</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signals" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Signal History Cards */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Recent Signal</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          BUY
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="font-mono">$43,250</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stop Loss:</span>
                        <span className="font-mono text-red-400">$42,800</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Take Profit:</span>
                        <span className="font-mono text-green-400">$44,100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-semibold text-primary">85%</span>
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        SMC + Elliott Wave + RSI Divergence
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Previous Signal</span>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          SELL
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="font-mono">$43,800</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stop Loss:</span>
                        <span className="font-mono text-red-400">$44,200</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Take Profit:</span>
                        <span className="font-mono text-green-400">$43,200</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-semibold text-primary">78%</span>
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        Break of Structure + MACD Cross
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Signal Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Win Rate:</span>
                        <span className="font-semibold text-green-400">72%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg R:R:</span>
                        <span className="font-semibold">1:2.3</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Signals:</span>
                        <span className="font-semibold">156</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">This Week:</span>
                        <span className="font-semibold text-primary">12</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="backtest" className="mt-6">
                <StrategyTester />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <SettingsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;