/**
 * Client-Side Space Weather Telemetry & ML Prediction Simulator Fallback
 * Used automatically when the FastAPI backend is offline (e.g. public static deployments).
 */

let localAnomalyState = {
  anomalyMode: false,
  customSolarWindSpeed: null,
  customKpIndex: null,
  customDstIndex: null
};

// Helper: Format date
function formatShortDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(date);
  const hour = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hour12}:${minute} ${ampm} IST`;
}

/**
 * Update the local mock anomaly state
 */
export function setLocalAnomaly(enable, speed, kp, dst) {
  localAnomalyState = {
    anomalyMode: enable,
    customSolarWindSpeed: speed,
    customKpIndex: kp,
    customDstIndex: dst
  };
  return localAnomalyState;
}

export function getLocalAnomalyMode() {
  return localAnomalyState.anomalyMode;
}

/**
 * Generate current real-time satellite telemetry
 */
export function generateMockStatus() {
  const now = new Date();
  const isStorm = localAnomalyState.anomalyMode;
  
  // Base calculations simulating diurnal variation in orbit
  const mltAngle = (now.getHours() + now.getMinutes() / 60) * (Math.PI / 12);
  const diurnalFactor = Math.cos(mltAngle - Math.PI); // Peak at noon, trough at midnight

  let windSpeed = isStorm ? (localAnomalyState.customSolarWindSpeed || 780.0) : (350.0 + diurnalFactor * 30.0 + (Math.random() - 0.5) * 15.0);
  let kpIndex = isStorm ? (localAnomalyState.customKpIndex || 6.8) : (1.5 + diurnalFactor * 0.5 + Math.random() * 0.4);
  let dstIndex = isStorm ? (localAnomalyState.customDstIndex || -110.0) : (2.0 - diurnalFactor * 5.0 - Math.random() * 3.0);
  
  // Calculate electron flux based on parameters
  let flux = 10.0 ** (1.5 + (windSpeed / 300.0) + (kpIndex / 4.0) - (dstIndex / 250.0) + diurnalFactor * 0.3);
  flux = Math.max(10, Math.min(flux, 3500));
  
  // Alert Threshold levels
  let alertLevel = "NORMAL";
  let alertMessage = "Space radiation environment is quiet. Geostationary satellite electronics operating safely.";
  
  if (flux >= 1200.0) {
    alertLevel = "HIGH";
    alertMessage = "Elevated electron flux detected. Potential risk to satellites and space weather sensitive systems. Stay Monitored!";
  } else if (flux >= 800.0) {
    alertLevel = "WARNING";
    alertMessage = "Moderate flux levels detected. Satellite sub-systems should monitor charging levels.";
  }

  return {
    satellite_id: "GOES-16",
    orbit_type: "GEO",
    timestamp: formatShortDate(now),
    last_updated_short: formatShortDate(now),
    mlt_hours: parseFloat(((now.getHours() + now.getMinutes() / 60) % 24).toFixed(2)),
    alert_level: alertLevel,
    alert_message: alertMessage,
    electron_flux_pfu: parseFloat(flux.toFixed(1)),
    solar_wind_speed_kms: parseFloat(windSpeed.toFixed(1)),
    kp_index: parseFloat(kpIndex.toFixed(1)),
    dst_index_nt: parseFloat(dstIndex.toFixed(1)),
    data_quality_pct: parseFloat((98.5 + Math.random() * 1.4).toFixed(1)),
    anomaly_mode: isStorm
  };
}

/**
 * Generate 12-hour predictions summary and hourly forecasts
 */
export function generateMockPredictions() {
  const current = generateMockStatus();
  const currentFlux = current.electron_flux_pfu;

  // 45m, 6h, 12h predicted values with realistic variations
  const flux45m = current.anomaly_mode 
    ? currentFlux * (0.95 + Math.random() * 0.1) 
    : currentFlux * (1.02 + Math.random() * 0.05);
    
  const flux6h = current.anomaly_mode
    ? currentFlux * (0.8 + Math.random() * 0.15)
    : currentFlux * (1.1 + Math.random() * 0.15);
    
  const flux12h = current.anomaly_mode
    ? currentFlux * (0.6 + Math.random() * 0.2)
    : currentFlux * (0.95 + Math.random() * 0.15);

  const forecast12h = [];
  
  for (let i = 1; i <= 12; i++) {
    // Smooth transition from current flux to 12h flux
    const t = i / 12;
    let predVal = currentFlux * (1 - t) + flux12h * t + (Math.random() - 0.5) * 30;
    predVal = Math.max(10, Math.min(predVal, 3500));
    
    const confidenceLower = Math.max(10, predVal - 60 - i * 12);
    const confidenceUpper = predVal + 60 + i * 12;

    forecast12h.push({
      hour: `+${i}h`,
      value: Math.round(predVal),
      lower_ci: Math.round(confidenceLower),
      upper_ci: Math.round(confidenceUpper)
    });
  }

  const calcPctChange = (val, prev) => {
    return parseFloat(((val - prev) / prev * 100).toFixed(1));
  };

  return {
    summary: {
      prediction_45m: {
        value: Math.round(flux45m),
        pct_change: calcPctChange(flux45m, currentFlux),
        direction: flux45m >= currentFlux ? "up" : "down"
      },
      prediction_6h: {
        value: Math.round(flux6h),
        pct_change: calcPctChange(flux6h, currentFlux),
        direction: flux6h >= currentFlux ? "up" : "down"
      },
      prediction_12h: {
        value: Math.round(flux12h),
        pct_change: calcPctChange(flux12h, currentFlux),
        direction: flux12h >= currentFlux ? "up" : "down"
      }
    },
    forecast_12h: forecast12h
  };
}

/**
 * Generate 7 days of historical electron flux values
 */
export function generateMockHistorical(days = 7) {
  const data = [];
  const now = Date.now();
  const points = days * 24; // Hourly
  const isStorm = localAnomalyState.anomalyMode;
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    const dateStr = time.getDate() + ' ' + time.toLocaleString('default', { month: 'short' });
    const timeStr = String(time.getHours()).padStart(2, '0') + ':00';
    
    let baseVal = 150.0;
    
    // Inject a storm event around 3 days ago OR recent hours if anomaly is currently enabled
    const distanceToStorm = Math.abs((points - i) - 72);
    if (distanceToStorm < 20) {
      baseVal = 1800.0 * Math.exp(-(distanceToStorm ** 2) / 80);
    }

    if (isStorm && i <= 12) {
      baseVal = 2400.0 * (1 - i / 14);
    }
    
    // Add diurnal orbital oscillation
    const mltAngle = time.getHours() * (Math.PI / 12);
    let flux = baseVal + 80.0 * Math.cos(mltAngle - Math.PI) + (Math.random() - 0.5) * 30;
    flux = Math.max(10, Math.min(flux, 3500));

    data.push({
      date: dateStr,
      time: timeStr,
      flux: Math.round(flux)
    });
  }
  
  return data;
}

/**
 * Generate 48 hours of comparison data (actual vs predicted)
 */
export function generateMockActualVsPredicted() {
  const data = [];
  const now = Date.now();
  const hours = 48;
  const isStorm = localAnomalyState.anomalyMode;
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    const dateStr = time.getDate() + ' ' + time.toLocaleString('default', { month: 'short' });
    const timeStr = String(time.getHours()).padStart(2, '0') + ':00';
    const timestamp = `${dateStr} ${timeStr}`;
    
    const mltAngle = time.getHours() * (Math.PI / 12);
    let actual = 200 + 90 * Math.cos(mltAngle - Math.PI) + (Math.random() - 0.5) * 20;
    
    // Add anomaly spike if active
    if (isStorm && i <= 12) {
      actual = 2200 + (Math.random() - 0.5) * 150;
    }
    
    // Offset prediction by 45m (lag) and add slight model error
    let predicted = actual * (0.97 + (Math.random() - 0.5) * 0.06);
    
    actual = Math.max(10, Math.min(actual, 3500));
    predicted = Math.max(10, Math.min(predicted, 3500));

    data.push({
      timestamp: timestamp,
      actual: Math.round(actual),
      predicted: Math.round(predicted)
    });
  }
  
  return data;
}

/**
 * Static trained model metrics
 */
export function generateMockMetrics() {
  return {
    model_name: "Random Forest Regressor Ensemble",
    training_samples: 48500,
    mae: 118.4,
    rmse: 146.2,
    mape: 8.2,
    r2: 0.942,
    accuracy: 97.2,
    detailed: {
      "45m": { mae: 95.1, rmse: 110.4, mape: 4.8, r2: 0.968, accuracy: 98.2 },
      "6h":  { mae: 122.4, rmse: 151.2, mape: 7.2, r2: 0.934, accuracy: 96.8 },
      "12h": { mae: 137.8, rmse: 177.0, mape: 9.5, r2: 0.912, accuracy: 95.1 }
    }
  };
}

