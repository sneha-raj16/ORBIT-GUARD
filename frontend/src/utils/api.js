import { getAuthHeader } from './security';
import { 
  generateMockStatus, 
  generateMockPredictions, 
  generateMockHistorical, 
  generateMockActualVsPredicted, 
  generateMockMetrics,
  setLocalAnomaly 
} from './mockSimulator';

// Support production deployments with external API hosts, fallback to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Global flag to persist mock mode once activated by a connection failure
let useMockMode = false;

/**
 * Helper to perform fetch requests with timeout protection
 */
async function fetchWithTimeout(resource, options = {}) {
  if (useMockMode) {
    throw new Error('API Offline (Client-Side Simulator Active)');
  }

  const { timeout = 6000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    console.warn(`Connection to backend failed (${error.message}). Activating local client-side space weather physics simulator.`);
    useMockMode = true;
    throw error;
  }
}

/**
 * Fetch current geostationary satellite telemetry and status
 */
export async function getStatus() {
  try {
    return await fetchWithTimeout(`${API_BASE_URL}/api/status`);
  } catch (err) {
    return generateMockStatus();
  }
}

/**
 * Fetch predictions and 12-hour ahead forecast
 */
export async function getPredictions() {
  try {
    return await fetchWithTimeout(`${API_BASE_URL}/api/predictions`);
  } catch (err) {
    return generateMockPredictions();
  }
}

/**
 * Fetch 7-day historical electron flux data points
 */
export async function getHistorical() {
  try {
    return await fetchWithTimeout(`${API_BASE_URL}/api/historical`);
  } catch (err) {
    return generateMockHistorical();
  }
}

/**
 * Fetch last 48 hours of actual vs predicted flux values
 */
export async function getActualVsPredicted() {
  try {
    return await fetchWithTimeout(`${API_BASE_URL}/api/actual-vs-predicted`);
  } catch (err) {
    return generateMockActualVsPredicted();
  }
}

/**
 * Fetch trained machine learning model metrics
 */
export async function getMetrics() {
  try {
    return await fetchWithTimeout(`${API_BASE_URL}/api/metrics`);
  } catch (err) {
    return generateMockMetrics();
  }
}

/**
 * Trigger or reset simulated solar storm anomaly (Admin only)
 */
export async function triggerAnomaly(enableAnomaly, customSpeed = null, customKp = null, customDst = null) {
  try {
    if (useMockMode) {
      throw new Error('Client-Side Simulator Active');
    }
    
    const payload = {
      enable_anomaly: enableAnomaly,
      custom_solar_wind_speed: customSpeed !== null ? parseFloat(customSpeed) : null,
      custom_kp_index: customKp !== null ? parseFloat(customKp) : null,
      custom_dst_index: customDst !== null ? parseFloat(customDst) : null
    };
    
    return await fetchWithTimeout(`${API_BASE_URL}/api/simulate-anomaly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // If backend is offline, update the local client-side anomaly state
    return setLocalAnomaly(enableAnomaly, customSpeed, customKp, customDst);
  }
}
