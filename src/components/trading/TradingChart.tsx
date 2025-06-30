import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { Card } from "@/components/ui/card";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { useBinanceKlines } from "@/hooks/useBinanceKlines";

interface TradingChartProps {
  timeframe: string;
}

const TradingChart = ({ timeframe }: TradingChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  // Fetch historical data
  const { data: historicalData, isLoading } = useBinanceKlines("BTCUSDT", timeframe);
  
  // WebSocket for real-time updates
  const { lastPrice, priceChange, priceChangePercent } = useBinanceWebSocket("BTCUSDT");

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
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
        color: 'rgba(171, 71, 188, 0.3)',
        text: 'BTC/USDT',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    // Create volume series
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

    // Handle resize
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

  // Update chart with historical data
  useEffect(() => {
    if (!isChartReady || !historicalData || !candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    try {
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

      // Add some example signals
      addExampleSignals();
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [historicalData, isChartReady]);

  const addExampleSignals = () => {
    if (!candlestickSeriesRef.current) return;

    try {
      // Add buy signal marker
      candlestickSeriesRef.current.setMarkers([
        {
          time: Math.floor(Date.now() / 1000) - 3600,
          position: 'belowBar',
          color: '#10b981',
          shape: 'arrowUp',
          text: 'BUY Signal\nSMC + Elliott Wave',
          size: 1,
        },
        {
          time: Math.floor(Date.now() / 1000) - 7200,
          position: 'aboveBar',
          color: '#ef4444',
          shape: 'arrowDown',
          text: 'SELL Signal\nBreak of Structure',
          size: 1,
        },
      ]);
    } catch (error) {
      console.error('Error adding signal markers:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card rounded-lg">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-card rounded-lg overflow-hidden">
      <div ref={chartContainerRef} className="w-full h-full" />
      
      {/* Price Info Overlay */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
        <div className="flex items-center space-x-4">
          <div>
            <div className="text-2xl font-bold font-mono">
              ${lastPrice?.toLocaleString() || "43,250.00"}
            </div>
            <div className={`text-sm flex items-center space-x-1 ${
              (priceChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{(priceChange || 0) >= 0 ? '↗' : '↘'}</span>
              <span>${Math.abs(priceChange || 125).toFixed(2)}</span>
              <span>({(priceChangePercent || 2.85).toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Indicators */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2 text-green-400 text-xs backdrop-blur-sm">
          <div className="font-semibold">Active BUY Signal</div>
          <div>Confidence: 85%</div>
        </div>
      </div>

      {/* Timeframe indicator */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1 border">
        <span className="text-xs font-medium text-muted-foreground">
          Timeframe: {timeframe.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default TradingChart;