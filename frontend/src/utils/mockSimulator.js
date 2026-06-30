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
  return `${d.getDate()} ${months[d.getMonth()]} ${hour12}:${minute} ${ampm} IST`;
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

  let windSpeed = isStorm ? (localAnomalyState.customSolarWindSpeed || 780.0) : (350.0 + diurnalFactor * 30.0 + Math.random() * 15.0);
  let kpIndex = isStorm ? (localAnomalyState.customKpIndex || 6.8) : (1.5 + diurnalFactor * 0.5 + Math.random() * 0.4);
  let dstIndex = isStorm ? (localAnomalyState.customDstIndex || -110.0) : (2.0 - diurnalFactor * 5.0 - Math.random() * 3.0);
  
  // Calculate electron flux based on parameters
  let flux = 10.0 ** (1.5 + (windSpeed / 300.0) + (kpIndex / 4.0) - (dstIndex / 250.0) + diurnalFactor * 0.3);
  flux = Math.max(10, Math.min(flux, 4500));
  
  // Alert Threshold levels
  let alertLevel = "NORMAL";
  let alertMessage = "All geostationary systems operating within nominal radiation thresholds.";
  
  if (flux >= 1000.0) {
    alertLevel = "HIGH";
    alertMessage = "CRITICAL: Geostationary electron flux exceeds 1000 pfu. Extreme satellite surface charging hazard!";
  } else if (flux >= 300.0) {
    alertLevel = "WARNING";
    alertMessage = "WARNING: Elevated energetic radiation detected. Monitor electrostatic discharges.";
  }

  return {
    satellite_id: "GOES-16",
    orbit_type: "GEO",
    alert_level: alertLevel,
    alert_message: alertMessage,
    electron_flux_pfu: parseFloat(flux.toFixed(1)),
    solar_wind_speed_kms: parseFloat(windSpeed.toFixed(1)),
    kp_index: parseFloat(kpIndex.toFixed(1)),
    dst_index_nt: parseFloat(dstIndex.toFixed(1)),
    data_quality_pct: parseFloat((98.5 + Math.random() * 1.4).toFixed(1)),
    last_updated_short: formatShortDate(now),
    anomaly_mode: isStorm
  };
}

/**
 * Generate 12-hour predictions summary and hourly forecasts
 */
export function generateMockPredictions() {
  const current = generateMockStatus();
  const currentFlux = current.electron_flux_pfu;

  // 45m, 6h, 12h predicted values with slight variations
  const flux45m = current.anomaly_mode 
    ? currentFlux * (0.95 + Math.random() * 0.1) 
    : currentFlux * (1.02 + Math.random() * 0.05);
    
  const flux6h = current.anomaly_mode
    ? currentFlux * (0.8 + Math.random() * 0.15)
    : currentFlux * (1.1 + Math.random() * 0.2);
    
  const flux12h = current.anomaly_mode
    ? currentFlux * (0.6 + Math.random() * 0.2)
    : currentFlux * (0.95 + Math.random() * 0.15);

  const forecast12h = [];
  const baseTime = Date.now();
  
  for (let i = 1; i <= 12; i++) {
    const forecastTime = new Date(baseTime + i * 3600000);
    const timeStr = String(forecastTime.getHours()).padStart(2, '0') + ':00';
    
    // Smooth transition from current flux to 12h flux
    const t = i / 12;
    let predVal = currentFlux * (1 - t) + flux12h * t + (Math.random() - 0.5) * 50;
    predVal = Math.max(10, Math.min(predVal, 4500));
    
    const confidenceLower = Math.max(10, predVal - 80 - i * 15);
    const confidenceUpper = predVal + 80 + i * 15;

    forecast12h.push({
      time: timeStr,
      predicted_flux: Math.round(predVal),
      confidence_lower: Math.round(confidenceLower),
      confidence_upper: Math.round(confidenceUpper)
    });
  }

  const getTrend = (val, prev) => {
    const diff = (val - prev) / prev;
    if (diff > 0.05) return 'rising';
    if (diff < -0.05) return 'falling';
    return 'stable';
  };

  return {
    summary: {
      horizon_45m: {
        predicted_flux: Math.round(flux45m),
        trend: getTrend(flux45m, currentFlux),
        pct_change: parseFloat(((flux45m - currentFlux) / currentFlux * 100).toFixed(1))
      },
      horizon_6h: {
        predicted_flux: Math.round(flux6h),
        trend: getTrend(flux6h, currentFlux),
        pct_change: parseFloat(((flux6h - currentFlux) / currentFlux * 100).toFixed(1))
      },
      horizon_12h: {
        predicted_flux: Math.round(flux12h),
        trend: getTrend(flux12h, currentFlux),
        pct_change: parseFloat(((flux12h - currentFlux) / currentFlux * 100).toFixed(1))
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
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    const dateStr = time.getDate() + ' ' + time.toLocaleString('default', { month: 'short' });
    
    // Simulate quiet weather mostly with one storm event in the past
    let baseVal = 150.0;
    
    // Inject a historical storm event around 3 days ago (indices 60 to 90)
    const distanceToStorm = Math.abs((points - i) - 72);
    if (distanceToStorm < 20) {
      baseVal = 2500.0 * Math.exp(-(distanceToStorm ** 2) / 100);
    }
    
    // Add diurnal orbital oscillation
    const mltAngle = time.getHours() * (Math.PI / 12);
    let flux = baseVal + 80.0 * Math.cos(mltAngle - Math.PI) + (Math.random() - 0.5) * 40;
    flux = Math.max(10, flux);

    data.push({
      time: dateStr,
      electron_flux: Math.round(flux)
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
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    const timeStr = String(time.getHours()).padStart(2, '0') + ':00';
    
    const mltAngle = time.getHours() * (Math.PI / 12);
    let actual = 200 + 90 * Math.cos(mltAngle - Math.PI) + (Math.random() - 0.5) * 20;
    
    // Add anomaly spike if active
    if (localAnomalyState.anomalyMode && i < 12) {
      actual = 3200 + (Math.random() - 0.5) * 150;
    }
    
    // Offset prediction by 45m (lag) and add some model error
    let predicted = actual * (0.96 + (Math.random() - 0.5) * 0.08);
    
    actual = Math.max(10, actual);
    predicted = Math.max(10, predicted);

    data.push({
      time: timeStr,
      actual_flux: Math.round(actual),
      predicted_flux: Math.round(predicted)
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
    r2: 0.942,
    accuracy: 97.2,
    detailed: {
      "45m": { mae: 95.1, rmse: 110.4, mape: 4.8, r2: 0.968, accuracy: 98.2 },
      "6h":  { mae: 122.4, rmse: 151.2, mape: 7.2, r2: 0.934, accuracy: 96.8 },
      "12h": { mae: 137.8, rmse: 177.0, mape: 9.5, r2: 0.912, accuracy: 95.1 }
    }
  };
}
