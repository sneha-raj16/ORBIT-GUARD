import React from 'react';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

export default function PredictionSummary({ predictions }) {
  if (!predictions) return null;

  const { prediction_45m, prediction_6h, prediction_12h } = predictions;

  const cardConfig = [
    {
      label: '45 Min Prediction',
      data: prediction_45m,
      themeClass: 'blue',
      textColor: '#3b82f6'
    },
    {
      label: '6 Hour Prediction',
      data: prediction_6h,
      themeClass: 'purple',
      textColor: '#a78bfa'
    },
    {
      label: '12 Hour Prediction',
      data: prediction_12h,
      themeClass: 'orange',
      textColor: '#f97316'
    }
  ];

  return (
    <div className="predictions-grid">
      {cardConfig.map((card, idx) => {
        const { label, data, themeClass, textColor } = card;
        if (!data) return null;
        
        const isUp = data.pct_change >= 0;
        const absChange = Math.abs(data.pct_change);

        return (
          <div key={idx} className="prediction-card">
            <div className="prediction-left">
              <span className="prediction-label">{label}</span>
              <span className="prediction-value">{Math.round(data.value).toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>pfu</span></span>
              
              <span className={`prediction-change ${isUp ? 'up' : 'down'}`} style={{ color: isUp ? '#ef4444' : '#10b981' }}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{absChange}% {isUp ? 'increase' : 'decrease'}</span>
              </span>
            </div>
            
            <div className={`prediction-icon-box ${themeClass}`}>
              <Clock size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
