import React from 'react';
import { ShieldAlert, ShieldAlert as AlertTriangle, ShieldCheck, ShieldAlert as AlertOctagon } from 'lucide-react';

export default function StatusAlert({ alertLevel, message }) {
  const getAlertIcon = () => {
    switch (alertLevel) {
      case 'HIGH':
        return <AlertOctagon size={24} />;
      case 'WARNING':
        return <AlertTriangle size={24} />;
      default:
        return <ShieldCheck size={24} />;
    }
  };

  const getAlertStatusClass = () => {
    switch (alertLevel) {
      case 'HIGH': return 'high';
      case 'WARNING': return 'warning';
      default: return 'normal';
    }
  };

  const getAlertFooterText = () => {
    switch (alertLevel) {
      case 'HIGH': return 'Stay Monitored!';
      case 'WARNING': return 'Stay Alert!';
      default: return 'Systems Nominal';
    }
  };

  return (
    <div className="alert-widget">
      <div className="alert-header">
        <div className={`alert-icon-box ${getAlertStatusClass()}`}>
          {getAlertIcon()}
        </div>
        <div className="alert-title-container">
          <span className="alert-label">Status Alert</span>
          <span className={`alert-title ${getAlertStatusClass()}`}>
            {alertLevel === 'HIGH' ? 'HIGH RADIATION' : alertLevel === 'WARNING' ? 'ELEVATED RADIATION' : 'NORMAL CONDITIONS'}
          </span>
        </div>
      </div>
      
      <p className="alert-desc">
        {message}
      </p>
      
      <div className="alert-footer">
        <span style={{ color: alertLevel === 'HIGH' ? '#ef4444' : alertLevel === 'WARNING' ? '#f59e0b' : '#10b981' }}>
          ● {getAlertFooterText()}
        </span>
      </div>
    </div>
  );
}
