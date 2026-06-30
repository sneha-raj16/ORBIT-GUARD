import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GaugeChart from './components/GaugeChart';
import StatusAlert from './components/StatusAlert';
import PredictionSummary from './components/PredictionSummary';
import { HistoricalChart, ComparisonChart, ForecastChart, ChartControls } from './components/Charts';
import ModelPerformance from './components/ModelPerformance';
import SecurityControl from './components/SecurityControl';
import AboutUs from './components/AboutUs';
import { getStatus, getPredictions, getHistorical, getActualVsPredicted, getMetrics } from './utils/api';
import { Calendar, Percent, ShieldCheck, Download, Flame, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dynamic API state variables
  const [statusData, setStatusData] = useState(null);
  const [predictionsData, setPredictionsData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchStaticData = async () => {
    try {
      const [hist, comp, metr] = await Promise.all([
        getHistorical(),
        getActualVsPredicted(),
        getMetrics()
      ]);
      setHistoricalData(hist);
      setComparisonData(comp);
      setMetricsData(metr);
    } catch (err) {
      console.error("Error loading historical or metrics data:", err);
    }
  };

  const fetchDynamicData = async () => {
    try {
      const [stat, pred] = await Promise.all([
        getStatus(),
        getPredictions()
      ]);
      setStatusData(stat);
      setPredictionsData(pred);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err.message || "Failed to establish telemetry link with the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount or manual refresh increment
  useEffect(() => {
    setIsLoading(true);
    fetchStaticData();
    fetchDynamicData();
  }, [refreshCount]);

  // Set up 5-second polling loop for real-time telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDynamicData();
      // Periodically refresh historical values slightly to match anomaly switches
      if (refreshCount % 4 === 0) {
        getHistorical().then(setHistoricalData).catch(console.error);
        getActualVsPredicted().then(setComparisonData).catch(console.error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  const forceRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const handleCsvDownload = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    window.open(`${apiBase}/api/download-csv`, '_blank');
  };

  if (isLoading && !statusData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#020612', color: '#3b82f6', gap: '16px' }}>
        <div className="satellite-svg" style={{ width: '48px', height: '48px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <span style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em' }}>ESTABLISHING ORBITAL TELEMETRY LINK...</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        <Header />

        {errorMsg && (
          <div className="form-status-msg error" style={{ margin: '10px 0' }}>
            {errorMsg} (Retrying automatically...)
          </div>
        )}

        {/* Tab Router Switch */}
        {activeTab === 'dashboard' && statusData && (
          <>
            {/* Row 1: Gauge, Status Alert, Info Cards */}
            <div className="dashboard-top-grid">
              <div className="glass-card" style={{ minHeight: '260px' }}>
                <span className="card-title">Radiation Level</span>
                <GaugeChart value={statusData.electron_flux_pfu} alertLevel={statusData.alert_level} />
              </div>

              <div className="glass-card" style={{ minHeight: '260px' }}>
                <span className="card-title">Status Alert</span>
                <StatusAlert alertLevel={statusData.alert_level} message={statusData.alert_message} />
              </div>

              <div className="status-cards-grid">
                <div className="status-mini-card">
                  <div className="status-mini-card-icon">
                    <Calendar size={18} />
                  </div>
                  <div className="status-mini-card-content">
                    <span className="status-mini-card-label">Last Updated</span>
                    <span className="status-mini-card-value">{statusData.last_updated_short}</span>
                  </div>
                </div>

                <div className="status-mini-card">
                  <div className="status-mini-card-icon">
                    <Percent size={18} style={{ color: '#10b981' }} />
                  </div>
                  <div className="status-mini-card-content">
                    <span className="status-mini-card-label">Data Quality</span>
                    <span className="status-mini-card-value green">{statusData.data_quality_pct}% Good</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Prediction summary cards */}
            <div className="glass-card">
              <span className="card-title">Prediction Summary</span>
              <PredictionSummary predictions={predictionsData?.summary} />
            </div>

            {/* Row 3: 7 Days historical chart */}
            <div className="glass-card">
              <div className="card-title">
                <span>Electron Flux - Last 7 Days</span>
                <ChartControls />
              </div>
              <HistoricalChart data={historicalData} />
            </div>

            {/* Row 4: Comparison vs Forecast plots */}
            <div className="charts-row-split">
              <div className="glass-card">
                <div className="card-title">
                  <span>Actual vs Predicted (Last 48 Hours)</span>
                  <ChartControls />
                </div>
                <ComparisonChart data={comparisonData} />
              </div>

              <div className="glass-card">
                <div className="card-title">
                  <span>Prediction Forecast (Next 12 Hours)</span>
                  <ChartControls />
                </div>
                <ForecastChart data={predictionsData?.forecast_12h} />
              </div>
            </div>

            {/* Row 5: ML performance stats and Download */}
            <div className="performance-download-grid">
              <div className="glass-card">
                <span className="card-title">Model Performance</span>
                <ModelPerformance metrics={metricsData} />
              </div>

              <div className="glass-card">
                <span className="card-title">Download Predictions</span>
                <div className="download-widget">
                  <p className="download-desc">
                    Download the latest prediction results as a comma-separated values (CSV) file for offline analysis.
                  </p>
                  <button onClick={handleCsvDownload} className="download-btn">
                    <Download size={16} />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'monitor' && (
          <div className="glass-card">
            <div className="card-title">
              <span>Real-Time Space Weather Monitor</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div className="metric-stat-box">
                  <div className="metric-stat-label">CURRENT ELECTRON FLUX</div>
                  <div className="metric-stat-val" style={{ color: statusData?.alert_level === 'HIGH' ? '#ef4444' : '#10b981' }}>
                    {statusData?.electron_flux_pfu} <span style={{ fontSize: '0.8rem' }}>pfu</span>
                  </div>
                </div>
                <div className="metric-stat-box">
                  <div className="metric-stat-label">SOLAR WIND SPEED</div>
                  <div className="metric-stat-val">
                    {statusData?.solar_wind_speed_kms} <span style={{ fontSize: '0.8rem' }}>km/s</span>
                  </div>
                </div>
                <div className="metric-stat-box">
                  <div className="metric-stat-label">KP GEOMAGNETIC INDEX</div>
                  <div className="metric-stat-val">
                    {statusData?.kp_index}
                  </div>
                </div>
                <div className="metric-stat-box">
                  <div className="metric-stat-label">DST INDEX</div>
                  <div className="metric-stat-val">
                    {statusData?.dst_index_nt} <span style={{ fontSize: '0.8rem' }}>nT</span>
                  </div>
                </div>
              </div>
              
              <HistoricalChart data={historicalData} />
            </div>
          </div>
        )}

        {activeTab === 'predictions' && predictionsData && (
          <div className="glass-card">
            <div className="card-title">
              <span>Future Forecasting Engine (12-Hour Range)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <PredictionSummary predictions={predictionsData.summary} />
              <ForecastChart data={predictionsData.forecast_12h} />
            </div>
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="glass-card">
            <div className="card-title">
              <span>Data Explorer & Download</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: '#94a3b8', lineHeight: 1.5 }}>
                Access public telemetry and predicted data streams. Select a file type below to extract geostationary orbit radiation levels.
              </p>
              <div style={{ display: 'flex', gap: '16px', maxWidth: '400px' }}>
                <button onClick={handleCsvDownload} className="download-btn">
                  <Download size={16} />
                  <span>Download GOES-16 Predictions (.CSV)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && metricsData && (
          <div className="glass-card">
            <div className="card-title">
              <span>Model Architecture & Metrics</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ModelPerformance metrics={metricsData} />
              
              <div style={{ borderTop: '1px solid rgba(59, 130, 246, 0.1)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Detailed Prediction Horizon Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {Object.entries(metricsData.detailed || {}).map(([key, val]) => (
                    <div key={key} className="metric-stat-box" style={{ textAlign: 'left' }}>
                      <div className="metric-stat-label" style={{ color: '#3b82f6', fontSize: '0.8rem' }}>{key.toUpperCase()} FORECAST LAYER</div>
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <div>MAE: <strong>{val.mae} pfu</strong></div>
                        <div>RMSE: <strong>{val.rmse} pfu</strong></div>
                        <div>MAPE: <strong>{val.mape}%</strong></div>
                        <div>R² Score: <strong>{val.r2}</strong></div>
                        <div>Model Accuracy: <strong>{val.accuracy}%</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <SecurityControl onRefresh={forceRefresh} isAnomalyActive={statusData?.anomaly_mode} />
        )}

        {activeTab === 'about' && (
          <AboutUs />
        )}

        {/* Footer */}
        <footer className="footer">
          <div className="footer-motto">
            <svg className="rocket-svg rocket-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.5 16.5c-1.5 1.5-2.5 3.5-2.5 5.5C4 22 6 21 7.5 19.5" />
              <path d="M12 2C6 2 2 6 2 12c0 2.5.5 4.5 1.5 6L8 13.5l2.5 2.5L6 20.5c1.5 1 3.5 1.5 6 1.5 6 0 10-4 10-10S18 2 12 2z" />
            </svg>
            <span>Together We Reach Beyond</span>
            <svg className="rocket-svg rocket-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.5 16.5c-1.5 1.5-2.5 3.5-2.5 5.5C4 22 6 21 7.5 19.5" />
              <path d="M12 2C6 2 2 6 2 12c0 2.5.5 4.5 1.5 6L8 13.5l2.5 2.5L6 20.5c1.5 1 3.5 1.5 6 1.5 6 0 10-4 10-10S18 2 12 2z" />
            </svg>
          </div>
          <div>ISRO Geostationary Satellites Protection Core System • Real-Time Predictor</div>
        </footer>
      </main>
    </div>
  );
}
