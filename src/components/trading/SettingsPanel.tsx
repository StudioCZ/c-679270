import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Shield, TrendingUp, Volume2 } from "lucide-react";

const SettingsPanel = () => {
  const [strategies, setStrategies] = useState({
    smc: true,
    elliottWave: true,
    rsiDivergence: true,
    macdCross: true,
    breakOfStructure: true,
    volumeConfirmation: false,
  });

  const [riskSettings, setRiskSettings] = useState({
    stopLossPercent: 2.5,
    takeProfitRatio: 2.0,
    maxRiskPerTrade: 1.0,
    maxDailyLoss: 5.0,
  });

  const [alertSettings, setAlertSettings] = useState({
    soundAlerts: true,
    pushNotifications: true,
    emailAlerts: false,
    telegramAlerts: false,
    minConfidence: 70,
  });

  const [displaySettings, setDisplaySettings] = useState({
    theme: "dark",
    chartStyle: "candlestick",
    showVolume: true,
    showIndicators: true,
    autoRefresh: true,
    refreshInterval: 5,
  });

  return (
    <div className="space-y-6">
      {/* Strategy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Strategy Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smc">Smart Money Concepts</Label>
                  <div className="text-xs text-muted-foreground">
                    Order blocks, liquidity zones
                  </div>
                </div>
                <Switch
                  id="smc"
                  checked={strategies.smc}
                  onCheckedChange={(checked) => 
                    setStrategies(prev => ({ ...prev, smc: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="elliott">Elliott Wave Theory</Label>
                  <div className="text-xs text-muted-foreground">
                    Wave pattern recognition
                  </div>
                </div>
                <Switch
                  id="elliott"
                  checked={strategies.elliottWave}
                  onCheckedChange={(checked) => 
                    setStrategies(prev => ({ ...prev, elliottWave: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rsi">RSI Divergence</Label>
                  <div className="text-xs text-muted-foreground">
                    Hidden & regular divergence
                  </div>
                </div>
                <Switch
                  id="rsi"
                  checked={strategies.rsiDivergence}
                  onCheckedChange={(checked) => 
                    setStrategies(prev => ({ ...prev, rsiDivergence: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="macd">MACD Cross</Label>
                  <div className="text-xs text-muted-foreground">
                    Signal line crossovers
                  </div>
                </div>
                <Switch
                  id="macd"
                  checked={strategies.macdCross}
                  onCheckedChange={(checked) => 
                    setStrategies(prev => ({ ...prev, macdCross: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bos">Break of Structure</Label>
                  <div className="text-xs text-muted-foreground">
                    Market structure breaks
                  </div>
                </div>
                <Switch
                  id="bos"
                  checked={strategies.breakOfStructure}
                  onCheckedChange={(checked) => 
                    setStrategies(prev => ({ ...prev, breakOfStructure: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="volume">Volume Confirmation</Label>
                  <div className="text-xs text-muted-foreground">
                    Volume-based validation
                  </div>
                </div>
                <Switch
                  id="volume"
                  checked={strategies.volumeConfirmation}
                  onCheckedChange={(checked) => 
                    setStrategies(prev => ({ ...prev, volumeConfirmation: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Risk Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Stop Loss Percentage</Label>
                <div className="px-3">
                  <Slider
                    value={[riskSettings.stopLossPercent]}
                    onValueChange={(value) => 
                      setRiskSettings(prev => ({ ...prev, stopLossPercent: value[0] }))
                    }
                    max={10}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.5%</span>
                    <span className="font-medium">{riskSettings.stopLossPercent}%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Take Profit Ratio</Label>
                <div className="px-3">
                  <Slider
                    value={[riskSettings.takeProfitRatio]}
                    onValueChange={(value) => 
                      setRiskSettings(prev => ({ ...prev, takeProfitRatio: value[0] }))
                    }
                    max={5}
                    min={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1:1</span>
                    <span className="font-medium">1:{riskSettings.takeProfitRatio}</span>
                    <span>1:5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Max Risk Per Trade</Label>
                <div className="px-3">
                  <Slider
                    value={[riskSettings.maxRiskPerTrade]}
                    onValueChange={(value) => 
                      setRiskSettings(prev => ({ ...prev, maxRiskPerTrade: value[0] }))
                    }
                    max={5}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.1%</span>
                    <span className="font-medium">{riskSettings.maxRiskPerTrade}%</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Daily Loss</Label>
                <div className="px-3">
                  <Slider
                    value={[riskSettings.maxDailyLoss]}
                    onValueChange={(value) => 
                      setRiskSettings(prev => ({ ...prev, maxDailyLoss: value[0] }))
                    }
                    max={20}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1%</span>
                    <span className="font-medium">{riskSettings.maxDailyLoss}%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alert Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sound Alerts</Label>
                <Switch
                  id="sound"
                  checked={alertSettings.soundAlerts}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, soundAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push">Push Notifications</Label>
                <Switch
                  id="push"
                  checked={alertSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email Alerts</Label>
                <Switch
                  id="email"
                  checked={alertSettings.emailAlerts}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, emailAlerts: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Minimum Confidence Level</Label>
                <div className="px-3">
                  <Slider
                    value={[alertSettings.minConfidence]}
                    onValueChange={(value) => 
                      setAlertSettings(prev => ({ ...prev, minConfidence: value[0] }))
                    }
                    max={95}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>50%</span>
                    <span className="font-medium">{alertSettings.minConfidence}%</span>
                    <span>95%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram-webhook">Telegram Webhook URL</Label>
                <Input
                  id="telegram-webhook"
                  placeholder="https://api.telegram.org/bot..."
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Display Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Chart Style</Label>
                <Select value={displaySettings.chartStyle} onValueChange={(value) => 
                  setDisplaySettings(prev => ({ ...prev, chartStyle: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candlestick">Candlestick</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="heikin-ashi">Heikin Ashi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-volume">Show Volume</Label>
                <Switch
                  id="show-volume"
                  checked={displaySettings.showVolume}
                  onCheckedChange={(checked) => 
                    setDisplaySettings(prev => ({ ...prev, showVolume: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-indicators">Show Indicators</Label>
                <Switch
                  id="show-indicators"
                  checked={displaySettings.showIndicators}
                  onCheckedChange={(checked) => 
                    setDisplaySettings(prev => ({ ...prev, showIndicators: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <Switch
                  id="auto-refresh"
                  checked={displaySettings.autoRefresh}
                  onCheckedChange={(checked) => 
                    setDisplaySettings(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Refresh Interval (seconds)</Label>
                <Select value={displaySettings.refreshInterval.toString()} onValueChange={(value) => 
                  setDisplaySettings(prev => ({ ...prev, refreshInterval: parseInt(value) }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 second</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Settings</Button>
      </div>
    </div>
  );
};

export default SettingsPanel;