'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, AreaSeries } from 'lightweight-charts';

import { Trade } from '@/types';

interface PriceChartProps {
  data: { time: number; value: number }[];
  trades?: Trade[];
}

export function PriceChart({ data, trades }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const priceLinesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#666',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 480,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        vertLine: {
          color: '#f97316',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#f97316',
          width: 1,
          style: 2,
        },
      },
    });

    console.log('STUB: chart created', chart);
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#f97316',
      topColor: 'rgba(249, 115, 22, 0.2)',
      bottomColor: 'rgba(249, 115, 22, 0)',
      lineWidth: 2,
    });
    console.log('STUB: areaSeries created', areaSeries);

    areaSeries.setData(data as any);
    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    // Set data
    seriesRef.current.setData(data as any);

    // Clear old price lines
    priceLinesRef.current.forEach(line => seriesRef.current.removePriceLine(line));
    priceLinesRef.current = [];

    // Set markers and price lines
    if (trades && trades.length > 0) {
      const markers = trades
        .filter(t => t.status === 0)
        .map(trade => {
          const entryTime = trade.entryTime || 0;
          
          let nearestPoint = data[0];
          let minDiff = Math.abs(data[0].time - entryTime);
          
          for (let i = 1; i < data.length; i++) {
            const diff = Math.abs(data[i].time - entryTime);
            if (diff < minDiff) {
              minDiff = diff;
              nearestPoint = data[i];
            }
          }

          if (!nearestPoint) return null;

          const priceLine = seriesRef.current.createPriceLine({
            price: Number(trade.entryPrice) / 1e8,
            color: trade.direction ? '#00c076' : '#ff4d4d',
            lineWidth: 2,
            lineStyle: 1, 
            axisLabelVisible: true,
            title: trade.direction ? 'BUY ENTRY' : 'SELL ENTRY',
          });
          priceLinesRef.current.push(priceLine);

          return {
            time: nearestPoint.time as any,
            position: trade.direction ? 'belowBar' : 'aboveBar' as any,
            color: trade.direction ? '#00c076' : '#ff4d4d',
            shape: trade.direction ? 'arrowUp' : 'arrowDown' as any,
            text: trade.direction ? `BUY @ ${(Number(trade.entryPrice)/1e8).toFixed(2)}` : `SELL @ ${(Number(trade.entryPrice)/1e8).toFixed(2)}`,
          };
        })
        .filter(Boolean) as any[];

      if (seriesRef.current.setMarkers) {
        seriesRef.current.setMarkers(markers);
      }
    } else if (seriesRef.current.setMarkers) {
      seriesRef.current.setMarkers([]);
    }
  }, [data, trades]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}
