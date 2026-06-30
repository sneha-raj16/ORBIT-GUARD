import React, { useState, useEffect } from 'react';
import { Shield, Settings, Zap, RotateCcw } from 'lucide-react';
import { 
  sanitizeInput, 
  isValidSolarWindSpeed, 
  isValidKpIndex, 
  isValidDstIndex, 
  saveApiKey,
  submissionLimiter
} from '../utils/security';
import { triggerAnomaly } from '../utils/api';

export default function SecurityControl({ onRefresh, isAnomalyActive }) {
  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('admin_api_key') || 'SpaceWeatherSecret2026');
  
  // Track UI state checkbox separately from the actual backend state
  const [simulationEnabled, setSimulationEnabled] = useState(isAnomalyActive || false);
  
  // Simulation Parameter Form Inputs
  const [windSpeed, setWindSpeed] = useState('780');
  const [kpIndex, setKpIndex] = useState('6.8');
  const [dstIndex, setDstIndex] = useState('-110');
  
  // Status feedback
  const [statusMsg, setStatusMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with parent/backend updates
  useEffect(() => {
    setSimulationEnabled(isAnomalyActive);
  }, [isAnomalyActive]);

  const handleKeySave = (e) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    saveApiKey(cleanKey);
    setStatusMsg({ type: 'success', text: 'API authorization token updated in secure storage.' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Client-Side Rate-Limiting Protection
    if (!submissionLimiter.check()) {
      setStatusMsg({ type: 'error', text: 'Rate limit: Please wait 2 seconds between updates.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    // 2. Client-Side Input Validation & Sanitization
    let cleanSpeed = null;
    let cleanKp = null;
    let cleanDst = null;

    if (simulationEnabled) {
      // Validate inputs
      const speedVal = sanitizeInput(windSpeed);
      const kpVal = sanitizeInput(kpIndex);
      const dstVal = sanitizeInput(dstIndex);

      if (!isValidSolarWindSpeed(speedVal)) {
        setStatusMsg({ type: 'error', text: 'Invalid solar wind speed (range: 100 to 1200 km/s).' });
        setIsSubmitting(false);
        return;
      }
      if (!isValidKpIndex(kpVal)) {
        setStatusMsg({ type: 'error', text: 'Invalid Kp index (range: 0 to 9).' });
        setIsSubmitting(false);
        return;
      }
      if (!isValidDstIndex(dstVal)) {
        setStatusMsg({ type: 'error', text: 'Invalid Dst index (range: -400 to 50 nT).' });
        setIsSubmitting(false);
        return;
      }

      cleanSpeed = parseFloat(speedVal);
      cleanKp = parseFloat(kpVal);
      cleanDst = parseFloat(dstVal);
    }

    try {
      // 3. API Dispatch with CSRF/Bearer Authorization Headers
      const response = await triggerAnomaly(simulationEnabled, cleanSpeed, cleanKp, cleanDst);
      
      setStatusMsg({ 
        type: 'success', 
        text: simulationEnabled 
          ? `Solar storm anomaly simulation successfully triggered. Radiation warning level is now HIGH.` 
          : `Anomaly simulation terminated. Restoring satellite quiet orbit conditions.` 
      });
      
      // Instantly trigger dashboard refresh to show new dials/warnings
      onRefresh();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Authorization failed. Check your Secret Key.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div className="card-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} style={{ color: '#10b981' }} />
          <span>Security & Simulation Admin</span>
        </div>
      </div>
      
      <p className="security-panel-desc">
        Configure access credentials and inject orbital solar storm scenarios to evaluate predictive response limits.
      </p>

      {statusMsg && (
        <div className={`form-status-msg ${statusMsg.type}`} style={{ marginBottom: '16px' }}>
          {statusMsg.text}
        </div>
      )}

      <form className="security-form" onSubmit={handleKeySave} style={{ marginBottom: '24px', borderBottom: '1px solid rgba(59, 130, 246, 0.1)', paddingBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label">Admin API Secret Bearer Token</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="password" 
              className="form-input" 
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter API Secret Key"
            />
            <button type="submit" className="security-submit-btn">
              Save Key
            </button>
          </div>
        </div>
      </form>

      <form className="security-form" onSubmit={handleSimulateSubmit}>
        <div className="toggle-switch-container">
          <div className="toggle-switch-label">
            <span className="toggle-title">Solar Storm Simulation</span>
            <span className="toggle-desc">Trigger extreme energetic electron flux charging events</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={simulationEnabled}
              onChange={(e) => setSimulationEnabled(e.target.checked)}
              disabled={isSubmitting}
            />
            <span className="slider"></span>
          </label>
        </div>

        {simulationEnabled && (
          <div className="form-group-row" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="form-group">
              <label className="form-label">Solar Wind Speed (km/s)</label>
              <input 
                type="number" 
                className="form-input" 
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kp Index (Geomagnetic)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-input" 
                value={kpIndex}
                onChange={(e) => setKpIndex(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Dst Index (nT Ring Current)</label>
              <input 
                type="number" 
                className="form-input" 
                value={dstIndex}
                onChange={(e) => setDstIndex(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className={`security-submit-btn ${simulationEnabled ? 'active' : ''}`}
          style={{ width: '100%' }}
          disabled={isSubmitting}
        >
          {simulationEnabled ? (
            <>
              <Zap size={16} />
              <span>Inject Solar Flare Anomaly</span>
            </>
          ) : (
            <>
              <RotateCcw size={16} />
              <span>Reset Satellite Environment</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
