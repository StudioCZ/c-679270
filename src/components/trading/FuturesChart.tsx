import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBinanceFuturesWebSocket } from "@/hooks/useBinanceFuturesWebSocket";
import { useBinanceFuturesKlines } from "@/hooks/useBinanceFuturesData";
import { Wifi, WifiOff, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface FuturesChartProps {
  timeframe: string;
}

const FuturesChart = ({ timeframe }: FuturesChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  // Fetch real historical futures data
  const { data: historicalData, isLoading, error, isError } = useBinanceFuturesKlines("BTCUSDT", timeframe);
  
  // Real-time WebSocket data from Binance Futures
  const { 
    lastPrice, 
    priceChange, 
    priceChangePercent, 
    markPrice,
    fundingRate,
    nextFundingTime,
    isConnected, 
    connectionError 
  } = useBinanceFuturesWebSocket("BTCUSDT");

  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('🎯 Initializing Futures chart with real Binance data');

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485563',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: '#485563',
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        visible: true,
        fontSize: 24,
        horzAlign: 'left',
        vertAlign: 'top',
        color: 'rgba(59, 130, 246, 0.1)',
        text: 'BTCUSDT Perpetual - Binance Futures',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    setIsChartReady(true);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Update chart with real Binance Futures historical data
  useEffect(() => {
    if (!isChartReady || !historicalData || !candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    try {
      console.log('📊 Updating Futures chart with real Binance data:', {
        dataPoints: historicalData.length,
        timeframe,
        latestPrice: historicalData[historicalData.length - 1]?.[4]
      });

      const candleData = historicalData.map((kline: any) => ({
        time: Math.floor(kline[0] / 1000),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
      }));

      const volumeData = historicalData.map((kline: any) => ({
        time: Math.floor(kline[0] / 1000),
        value: parseFloat(kline[5]),
        color: parseFloat(kline[4]) >= parseFloat(kline[1]) ? '#10b981' : '#ef4444',
      }));

      candlestickSeriesRef.current.setData(candleData);
      volumeSeriesRef.current.setData(volumeData);

      console.log('✅ Futures chart updated successfully with real data');
    } catch (error) {
      console.error('❌ Error updating Futures chart with real data:', error);
    }
  }, [historicalData, isChartReady, timeframe]);

  // Update chart with real-time price updates
  useEffect(() => {
    if (!isChartReady || !candlestickSeriesRef.current || !lastPrice) return;

    try {
      const currentTime = Math.floor(Date.now() / 1000);
      candlestickSeriesRef.current.update({
        time: currentTime,
        close: lastPrice,
      });
    } catch (error) {
      console.error('❌ Error updating real-time Futures price:', error);
    }
  }, [lastPrice, isChartReady]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-center">
            <p className="text-lg font-semibold">Loading Real Futures Data</p>
            <p className="text-sm text-muted-foreground">Fetching {timeframe} perpetual contract data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card rounded-lg">
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div>
            <p className="text-lg font-semibold text-red-500">Failed to Load Futures Data</p>
            <p className="text-sm text-muted-foreground">
              Unable to fetch data from Binance Futures API. Please check your connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-card rounded-lg overflow-hidden">
      <div ref={chartContainerRef} className="w-full h-full" />
      
      {/* Real-time Futures Price Info Overlay */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
              PERPETUAL
            </Badge>
            <Badge variant="outline" className="text-xs">
              {timeframe.toUpperCase()}
            </Badge>
          </div>
          
          <div className="text-2xl font-bold font-mono">
            ${lastPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "Loading..."}
          </div>
          
          <div className={`text-sm flex items-center space-x-1 ${
            (priceChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {(priceChange || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{priceChange ? `$${Math.abs(priceChange).toFixed(2)}` : 'Loading...'}</span>
            <span>({priceChangePercent ? `${priceChangePercent.toFixed(2)}%` : 'Loading...'})</span>
          </div>

          {markPrice && (
            <div className="text-xs text-muted-foreground">
              Mark: ${markPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {/* Futures-specific Info */}
      <div className="absolute top-4 right-4 space-y-2">
        <Badge 
          variant={isConnected ? "default" : "destructive"} 
          className="flex items-center space-x-1"
        >
          {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isConnected ? "Live Futures" : "Offline"}</span>
        </Badge>
        
        {fundingRate !== undefined && (
          <Badge 
            variant="outline" 
            className={`text-xs ${fundingRate >= 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            Funding: {(fundingRate * 100).toFixed(4)}%
          </Badge>
        )}
        
        {connectionError && (
          <Badge variant="destructive" className="text-xs">
            Connection Error
          </Badge>
        )}
      </div>

      {/* Funding Rate Info */}
      {fundingRate !== undefined && nextFundingTime && (
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 border">
          <div className="text-xs space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Funding Rate:</span>
              <span className={`font-medium ${fundingRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(fundingRate * 100).toFixed(4)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Next Funding:</span>
              <span className="font-medium">
                {new Date(nextFundingTime).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Data Source indicator */}
      <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 border">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
            Binance Futures API
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">
            {historicalData?.length || 0} candles
          </span>
        </div>
      </div>
    </div>
  );
};

export default FuturesChart;