import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import FuturesChart from "@/components/trading/FuturesChart";
import FuturesSignalPanel from "@/components/trading/FuturesSignalPanel";
import StrategyTester from "@/components/trading/StrategyTester";
import SettingsPanel from "@/components/trading/SettingsPanel";
import FuturesMarketOverview from "@/components/trading/FuturesMarketOverview";
import { TrendingUp, TrendingDown, Activity, Settings, BarChart3, Bell, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const TradingDashboard = () => {
  const [activeTimeframe, setActiveTimeframe] = useState("1h");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [isTestnet, setIsTestnet] = useState(import.meta.env.VITE_BINANCE_TESTNET === 'true');
  const { theme, setTheme } = useTheme();

  const handleTimeframeChange = (timeframe: string) => {
    setActiveTimeframe(timeframe);
    toast.info(`Switched to ${timeframe} timeframe`);
  };

  const handleAlertsToggle = (enabled: boolean) => {
    setAlertsEnabled(enabled);
    toast.success(enabled ? "Alerts enabled" : "Alerts disabled");
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  const handleTestnetToggle = (enabled: boolean) => {
    setIsTestnet(enabled);
    toast.info(enabled ? "Switched to Testnet mode" : "Switched to Production mode");
    // Note: In a real implementation, this would require a page reload to change the API endpoints
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Testnet Banner */}
      {isTestnet && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 text-yellow-400 text-center py-2 text-sm font-medium">
          ⚠️ TESTNET MODE - No real funds at risk
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-orange-500" />
                <h1 className="text-xl font-bold">BTC Futures Signal Pro</h1>
              </div>
              <Badge variant="outline" className="text-xs animate-pulse bg-orange-500/20 text-orange-400 border-orange-500/30">
                Perpetual
              </Badge>
              <Badge variant="outline" className="text-xs">
                Live Futures Data
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="testnet" className="text-sm">Testnet</Label>
                <Switch
                  id="testnet"
                  checked={isTestnet}
                  onCheckedChange={handleTestnetToggle}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <Switch
                  checked={alertsEnabled}
                  onCheckedChange={handleAlertsToggle}
                  id="alerts"
                />
                <Label htmlFor="alerts" className="text-sm">Alerts</Label>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleThemeToggle}
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Futures Market Overview */}
          <div className="lg:col-span-4">
            <FuturesMarketOverview />
          </div>

          {/* Main Chart Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>BTCUSDT Perpetual</span>
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      Binance Futures
                    </Badge>
                    {isTestnet && (
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Testnet
                      </Badge>
                    )}
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    {["1m", "15m", "1h", "4h", "1d"].map((tf) => (
                      <Button
                        key={tf}
                        variant={activeTimeframe === tf ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTimeframeChange(tf)}
                        className="transition-all duration-200"
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[520px]">
                <FuturesChart timeframe={activeTimeframe} />
              </CardContent>
            </Card>
          </div>

          {/* Futures Signal Panel */}
          <div className="lg:col-span-1">
            <FuturesSignalPanel />
          </div>

          {/* Tabs for Additional Features */}
          <div className="lg:col-span-4">
            <Tabs defaultValue="signals" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signals" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Active Futures Signals</span>
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
                  {/* Futures Signal History Cards */}
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Recent Futures Signal</span>
                        <div className="flex items-center space-x-1">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            LONG
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                            10x
                          </Badge>
                        </div>
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
                        <span className="font-mono text-green-400">$44,375</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Leverage:</span>
                        <span className="font-semibold text-orange-400">10x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-semibold text-primary">88%</span>
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        High OI + Funding Rate + Volume Confirmation
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Previous Signal</span>
                        <div className="flex items-center space-x-1">
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            SHORT
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                            8x
                          </Badge>
                        </div>
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
                        <span className="font-mono text-green-400">$42,800</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Leverage:</span>
                        <span className="font-semibold text-orange-400">8x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-semibold text-primary">82%</span>
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        Extreme Funding + Resistance Break
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Futures Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Win Rate:</span>
                        <span className="font-semibold text-green-400">78%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg R:R:</span>
                        <span className="font-semibold">1:2.8</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Leverage:</span>
                        <span className="font-semibold text-orange-400">7.2x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Signals:</span>
                        <span className="font-semibold">203</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">This Week:</span>
                        <span className="font-semibold text-primary">18</span>
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