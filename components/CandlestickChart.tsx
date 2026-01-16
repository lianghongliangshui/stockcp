import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Cell
} from 'recharts';
import { StockDataPoint } from '../types';
import { processChartData } from '../utils/indicators';
import { COLOR_DOWN, COLOR_UP, COLOR_MA5, COLOR_MA10, COLOR_MA20 } from '../constants';

interface CandlestickChartProps {
  data: StockDataPoint[];
}

const CustomCandleShape = (props: any) => {
  const { x, y, width, height, open, close, high, low } = props;
  const isUp = close >= open;
  const color = isUp ? COLOR_UP : COLOR_DOWN;

  // X center of the candle
  const xCenter = x + width / 2;
  
  // Y coordinates need to be mapped from the axis scale.
  // props.y is the top of the bar (min(open, close) in screen coords?)
  // Recharts passes 'y' as the top coordinate and 'height' as the length.
  // However, for a candlestick, we need specific high/low pixel coords.
  // We can calculate pixel positions if we had the scale, but simpler:
  // Recharts 'Bar' with range data [min, max] automatically handles the rectangle.
  // But drawing the wicks (high/low) requires more.
  
  // Recharts `Bar` can take `[min, max]` as dataKey, but visual customization is limited.
  // A cleaner way in Recharts for Candles is using the `shape` prop which receives formatted `y` and `height` 
  // BUT `y` corresponds to the value passed in dataKey.
  
  // To keep it robust, we rely on the passed `yAxis` scale function if available, 
  // but Recharts custom shapes inside Bar get `y` (top) and `height` (difference).
  // This is insufficient for High/Low wicks unless we pass them or access the payload.
  
  const { payload, yAxis } = props;
  
  // Use yAxis scale to calculate positions if yAxis is available in context (it usually is passed to shape)
  // Actually, Recharts passes the scale as `yAxis.scale`.
  
  if (!yAxis || !yAxis.scale) return null;
  
  const scale = yAxis.scale;
  const yOpen = scale(open);
  const yClose = scale(close);
  const yHigh = scale(high);
  const yLow = scale(low);

  const candleBodyTop = Math.min(yOpen, yClose);
  const candleBodyBottom = Math.max(yOpen, yClose);
  const bodyHeight = Math.max(1, candleBodyBottom - candleBodyTop); // Ensure at least 1px

  return (
    <g stroke={color} fill={color} strokeWidth={1}>
      {/* Wick */}
      <line x1={xCenter} y1={yHigh} x2={xCenter} y2={yLow} />
      {/* Body */}
      {isUp ? (
          // Hollow body for Up (optional style), usually solid Red in China or hollow Red. 
          // Let's do Solid Red for simplicity and clarity on dark bg.
          <rect x={x} y={candleBodyTop} width={width} height={bodyHeight} fill={color} stroke="none" />
      ) : (
          // Solid Green for Down
          <rect x={x} y={candleBodyTop} width={width} height={bodyHeight} fill={color} stroke="none" />
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = data.close >= data.open;
    const colorClass = isUp ? 'text-red-500' : 'text-green-500';

    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-lg text-sm">
        <p className="text-slate-400 mb-1">{data.date}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-slate-500">Open:</span>
          <span className={colorClass}>{data.open.toFixed(2)}</span>
          
          <span className="text-slate-500">Close:</span>
          <span className={colorClass}>{data.close.toFixed(2)}</span>
          
          <span className="text-slate-500">High:</span>
          <span className={colorClass}>{data.high.toFixed(2)}</span>
          
          <span className="text-slate-500">Low:</span>
          <span className={colorClass}>{data.low.toFixed(2)}</span>
          
          <span className="text-slate-500">Vol:</span>
          <span className="text-slate-200">{(data.volume / 10000).toFixed(2)}万</span>
          
          <span className="text-slate-500">Chg:</span>
          <span className={colorClass}>{data.pctChange.toFixed(2)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const chartData = processChartData(data);

  // Calculate domain for Y axis to focus on the price action
  const minLow = Math.min(...data.map(d => d.low));
  const maxHigh = Math.max(...data.map(d => d.high));
  const padding = (maxHigh - minLow) * 0.1;

  return (
    <div className="w-full h-[500px] bg-slate-900 rounded-xl border border-slate-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={{ stroke: '#475569' }}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            domain={[minLow - padding, maxHigh + padding]} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => val.toFixed(2)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff', strokeOpacity: 0.2 }} />
          
          {/* Moving Averages */}
          <Line type="monotone" dataKey="ma5" stroke={COLOR_MA5} dot={false} strokeWidth={1} name="MA5" />
          <Line type="monotone" dataKey="ma10" stroke={COLOR_MA10} dot={false} strokeWidth={1} name="MA10" />
          <Line type="monotone" dataKey="ma20" stroke={COLOR_MA20} dot={false} strokeWidth={1} name="MA20" />

          {/* 
            We use a Bar chart to render the Candles.
            Since we use a custom shape, the 'dataKey' for the Bar just needs to give us a valid range
            so the shape renderer receives the correct Y scale.
            We pass 'high' as dataKey to ensure the bar covers the vertical space somewhat, 
            but the custom shape handles the real logic.
           */}
          <Bar 
            dataKey="close" 
            shape={<CustomCandleShape />} 
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isUp ? COLOR_UP : COLOR_DOWN} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};