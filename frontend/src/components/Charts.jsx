import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const gridColor = "rgba(59, 130, 246, 0.08)";
const tooltipStyle = {
  background: 'rgba(5, 13, 31, 0.95)',
  border: '1px solid rgba(59, 130, 246, 0.25)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '0.85rem'
};

// 1. Historical Electron Flux Chart (Last 7 Days)
export function HistoricalChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading historical data...</div>;
  }

  // Draw data dots only occasionally to avoid cluttering
  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false}
            dy={8}
            interval={Math.ceil(data.length / 7)}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false}
            domain={[0, 'dataMax + 300']}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(label, items) => {
              if (items[0]) {
                return `Date: ${items[0].payload.date} ${items[0].payload.time}`;
              }
              return label;
            }}
            formatter={(value) => [`${Math.round(value)} pfu`, 'Electron Flux']}
          />
          <Area 
            type="monotone" 
            dataKey="flux" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#fluxGrad)" 
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Actual vs Predicted (Last 48 Hours)
export function ComparisonChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading comparison telemetry...</div>;
  }

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            dy={8}
            interval={Math.ceil(data.length / 5)}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            domain={[0, 'dataMax + 300']}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="plainline" 
            iconSize={14}
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
          />
          <Line 
            name="Actual" 
            type="monotone" 
            dataKey="actual" 
            stroke="#10b981" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line 
            name="Predicted" 
            type="monotone" 
            dataKey="predicted" 
            stroke="#ef4444" 
            strokeWidth={2} 
            strokeDasharray="4 4" 
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Prediction Forecast (Next 12 Hours)
export function ForecastChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading forecast engine...</div>;
  }

  // Format data for Recharts range area
  const formattedData = data.map(d => ({
    ...d,
    range: [d.lower_ci, d.upper_ci]
  }));

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            dy={8}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            domain={[0, 'dataMax + 300']}
          />
          <Tooltip 
            contentStyle={tooltipStyle}
            formatter={(value, name, props) => {
              if (name === "Forecast") return [`${value} pfu`, "Forecast"];
              if (name === "Confidence Interval") {
                const lower = props.payload.lower_ci;
                const upper = props.payload.upper_ci;
                return [`${lower} - ${upper} pfu`, "95% CI Range"];
              }
              return [value, name];
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconSize={12}
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
          />
          {/* Shaded Confidence Interval Range Area */}
          <Area 
            name="Confidence Interval"
            type="monotone" 
            dataKey="range" 
            stroke="none" 
            fill="#3b82f6" 
            fillOpacity={0.12} 
          />
          {/* Center Forecast Line */}
          <Line 
            name="Forecast"
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2.5} 
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Chart controls mock bar
export function ChartControls() {
  return (
    <div className="chart-actions">
      <button className="chart-action-btn" title="Zoom In"><ZoomIn size={14} /></button>
      <button className="chart-action-btn" title="Zoom Out"><ZoomOut size={14} /></button>
      <button className="chart-action-btn" title="Reset View"><RotateCcw size={14} /></button>
    </div>
  );
}
