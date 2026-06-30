import React from 'react';

export default function ModelPerformance({ metrics }) {
  if (!metrics) return null;

  const { mae, rmse, mape, r2, accuracy } = metrics;
  
  // Circumference of accuracy circle (r=28) -> 2 * PI * 28 = 175.93
  const circ = 175.93;
  const strokeDashoffset = circ - (accuracy / 100) * circ;

  return (
    <div className="metrics-panel">
      <div className="metrics-stats-grid">
        <div className="metric-stat-box">
          <div className="metric-stat-label">MAE</div>
          <div className="metric-stat-val">
            {mae} <span className="metric-stat-unit">pfu</span>
          </div>
        </div>
        
        <div className="metric-stat-box">
          <div className="metric-stat-label">RMSE</div>
          <div className="metric-stat-val">
            {rmse} <span className="metric-stat-unit">pfu</span>
          </div>
        </div>
        
        <div className="metric-stat-box">
          <div className="metric-stat-label">MAPE</div>
          <div className="metric-stat-val">
            {mape} <span className="metric-stat-unit">%</span>
          </div>
        </div>
        
        <div className="metric-stat-box">
          <div className="metric-stat-label">R² Score</div>
          <div className="metric-stat-val">
            {r2}
          </div>
        </div>
      </div>
      
      <div className="accuracy-ring-container">
        <svg className="accuracy-ring-svg" viewBox="0 0 64 64">
          <circle 
            className="accuracy-ring-bg" 
            cx="32" 
            cy="32" 
            r="28" 
          />
          <circle 
            className="accuracy-ring-fill" 
            cx="32" 
            cy="32" 
            r="28" 
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div className="accuracy-label-container">
          <div className="accuracy-pct-text" style={{ color: '#10b981' }}>{accuracy}%</div>
          <div className="accuracy-title">Model Accuracy</div>
        </div>
      </div>
    </div>
  );
}
