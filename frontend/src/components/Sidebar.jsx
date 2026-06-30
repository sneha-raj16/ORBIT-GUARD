import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  LineChart, 
  Compass, 
  BarChart4, 
  BellRing, 
  Info,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'monitor', label: 'Live Monitor', icon: Activity },
    { id: 'predictions', label: 'Predictions', icon: LineChart },
    { id: 'explorer', label: 'Data Explorer', icon: Compass },
    { id: 'performance', label: 'Model Performance', icon: BarChart4 },
    { id: 'security', label: 'Security Admin', icon: ShieldAlert },
    { id: 'about', label: 'About Us', icon: Info },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
          <Compass size={24} className="satellite-svg" style={{ color: '#3b82f6' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.05em' }}>ORBIT GUARD</h2>
        </div>
        
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', font: 'inherit' }}
              >
                <Icon className="menu-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="data-source-card">
        <div className="data-source-title">Data Source</div>
        <div className="data-source-name">NOAA GOES-16</div>
        <div className="data-source-img-container">
          <svg className="satellite-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 17L12 22L22 17M2 12L12 17L22 12M12 2L2 7L12 12L22 7L12 2Z" />
            <circle cx="12" cy="7" r="1" fill="currentColor" />
            <line x1="12" y1="7" x2="12" y2="17" />
          </svg>
        </div>
        <div className="data-source-resolution">5-min Resolution</div>
      </div>
    </aside>
  );
}
