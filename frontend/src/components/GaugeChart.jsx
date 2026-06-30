import React from 'react';

export default function GaugeChart({ value, alertLevel }) {
  // Cap values for visual safety
  const displayVal = Math.round(value);
  const maxVal = 2000;
  const percentage = Math.min(100, Math.max(0, (value / maxVal) * 100));
  
  // Calculate needle angle
  // 0 pfu = -90deg (or 180deg), 2000 pfu = 90deg (or 0deg)
  // Let's map 0-100% to -90deg to +90deg (or 180 to 360 deg)
  const angle = -90 + (percentage / 100) * 180;
  
  // Status Badge Class helper
  const getBadgeClass = () => {
    switch (alertLevel) {
      case 'HIGH': return 'status-high';
      case 'WARNING': return 'status-warning';
      default: return 'status-normal';
    }
  };

  return (
    <div className="gauge-container">
      <svg className="gauge-svg" viewBox="0 0 200 120">
        <defs>
          {/* Gauge Color Gradient */}
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />   {/* Green */}
            <stop offset="50%" stopColor="#f59e0b" />  {/* Yellow */}
            <stop offset="100%" stopColor="#ef4444" /> {/* Red */}
          </linearGradient>
        </defs>
        
        {/* Background Track */}
        <path 
          className="gauge-bg-path" 
          d="M 20 100 A 80 80 0 0 1 180 100" 
        />
        
        {/* Filled Path (uses gradient) */}
        <path 
          className="gauge-fill-path" 
          d="M 20 100 A 80 80 0 0 1 180 100"
          stroke="url(#gaugeGrad)"
        />
        
        {/* Scale markers */}
        <text x="18" y="115" fill="#64748b" fontSize="7" textAnchor="middle" fontWeight="bold">0</text>
        <text x="40" y="60" fill="#64748b" fontSize="7" textAnchor="middle" fontWeight="bold">500</text>
        <text x="100" y="32" fill="#64748b" fontSize="7" textAnchor="middle" fontWeight="bold">1000</text>
        <text x="160" y="60" fill="#64748b" fontSize="7" textAnchor="middle" fontWeight="bold">1500</text>
        <text x="182" y="115" fill="#64748b" fontSize="7" textAnchor="middle" fontWeight="bold">2000+</text>
        
        {/* Needle */}
        <g transform={`translate(100, 100) rotate(${angle})`}>
          <path 
            className="gauge-needle"
            d="M -3 0 L -1 -75 L 1 -75 L 3 0 Z" 
            fill="#f8fafc"
          />
          {/* Glowing dot inside the needle */}
          <circle cx="0" cy="-65" r="1.5" fill="#3b82f6" />
        </g>
        
        {/* Center Node */}
        <circle className="gauge-center-node" cx="100" cy="100" r="10" />
        <circle cx="100" cy="100" r="5" fill="#3b82f6" />
      </svg>
      
      {/* Text Readout */}
      <div className="gauge-value-display">
        <div className="gauge-value-number" style={{ color: alertLevel === 'HIGH' ? '#ef4444' : alertLevel === 'WARNING' ? '#f59e0b' : '#f8fafc' }}>
          {displayVal.toLocaleString()}
        </div>
        <div className="gauge-value-unit">pfu</div>
      </div>
      
      <div className={`gauge-status-badge ${getBadgeClass()}`}>
        <span style={{ marginRight: '6px', display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
        {alertLevel}
      </div>
    </div>
  );
}
