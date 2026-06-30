import React, { useState, useEffect } from 'react';
import { ShieldCheck, Orbit } from 'lucide-react';

export default function Header() {
  const [timeState, setTimeState] = useState({
    dateStr: '',
    timeStr: ''
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format options for IST
      const dateOptions = { day: '2-digit', month: 'long', year: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      
      const datePart = now.toLocaleDateString('en-GB', dateOptions);
      const timePart = now.toLocaleTimeString('en-US', timeOptions);
      
      setTimeState({
        dateStr: datePart,
        timeStr: `${timePart} IST`
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <div className="isro-logo-text">
          <span>इसरो</span>
          <span className="isro-logo-sub">isro</span>
        </div>
        <div className="header-title-container">
          <h1 className="header-title">GEO ELECTRON FLUX PREDICTION DASHBOARD</h1>
          <span className="header-subtitle">Real-time Space Weather Monitoring & Forecasting System</span>
        </div>
      </div>
      <div className="header-right">
        <div className="security-header-badge">
          <ShieldCheck size={14} />
          <span>Secured Endpoint</span>
        </div>
        <div className="live-clock-card">
          <div className="live-date">{timeState.dateStr}</div>
          <div className="live-time">{timeState.timeStr}</div>
        </div>
      </div>
    </header>
  );
}
