<<<<<<< HEAD
# Geo Electron Flux Prediction Dashboard

A premium, fully working space weather forecasting system designed to predict energetic particle radiation environments (relativistic electron fluxes &ge;2 MeV) for satellites in geostationary orbit (GEO). This project meets the problem statement of forecasting radiation hazards to safeguard satellite payloads from electrostatic discharge (ESD) and deep dielectric charging (DDC).

---

## 🚀 Quick Start

To launch both services simultaneously on Windows:

1. Double-click the **`run.bat`** script in the root directory.
2. The script will open two windows:
   - **FastAPI API Server** on `http://127.0.0.1:8000`
   - **Vite React Dev Server** on `http://localhost:5173`
3. Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## 🛠️ System Architecture

The application is structured into two main services:

### 1. Backend (`/backend`)
*   **FastAPI Engine (`main.py`)**: High-performance asynchronous REST API.
*   **Predictor Engine (`predictor.py`)**: Loads trained ML models and runs a 1D interpolation algorithm to generate smooth, physically realistic 12-hour forecasts with confidence intervals.
*   **Space Physics Models (`model.py`)**: Data simulator and Random Forest regression model trained to predict future electron flux at 3 time horizons:
    - **45 Minutes Ahead** (Immediate protection triggers)
    - **6 Hours Ahead** (Orbit scheduling)
    - **12 Hours Ahead** (Mission planning)
*   **Model Artifacts (`/models`)**: Contains pre-trained regression models (`model_45m.joblib`, `model_6h.joblib`, `model_12h.joblib`) and model performance statistics (`metrics.json`).

### 2. Frontend (`/frontend`)
*   **Vite + React (JavaScript)**: Structured Single Page Application.
*   **Custom Styling (`src/index.css`)**: Premium space-themed aesthetics featuring custom glowing cards, glassmorphic panels, animated SVG gauges, and status badges.
*   **Interactive Charts (`src/components/Charts.jsx`)**: Built on Recharts, showcasing:
    - 7-day historical flux trends.
    - 48-hour comparison between Actual and Model-predicted values.
    - 12-hour prediction forecast band containing shaded 95% confidence intervals.
*   **Security Controls (`src/components/SecurityControl.jsx`)**: Admin console to manage authorization tokens and configure space weather parameters.

---

## 🛡️ Security Controls & Hardening

This platform incorporates OWASP-aligned security controls to safeguard data streams:

1.  **Client-Side Rate-Limiting**: Spam mitigation restricting admin actions to once every 2 seconds.
2.  **Server-Side Rate-Limiting**: IP-based sliding window filter restricting requests to a maximum of 60 requests per minute.
3.  **Authentication Control**: The simulated solar storm endpoint (`POST /api/simulate-anomaly`) is secured via a Bearer Token header check.
    - **Secret Key**: `SpaceWeatherSecret2026` (Pre-configured in both the frontend and backend).
4.  **CORS Restrictions**: Configured to only allow requests originating from authorized local domains.
5.  **OWASP Security Headers**: Enforced via middleware:
    - `Content-Security-Policy` (prevents frame injection and malicious asset loads)
    - `X-Frame-Options: DENY` (clickjacking mitigation)
    - `X-Content-Type-Options: nosniff` (mime sniffing mitigation)
    - `Referrer-Policy: no-referrer`
6.  **Input Sanitation**: Forms and parameters are sanitized on the client and validated on the backend via Pydantic model ranges (e.g. Kp index must be between 0 and 9) to prevent buffer overflows or malicious script injection.

---

## 🧪 Testing the Solar Storm Anomaly

To verify the reactive nature of the model:
1. Navigate to the **Security Admin** tab on the left sidebar.
2. Enter the default Secret Key: `SpaceWeatherSecret2026` (Pre-filled).
3. Toggle the **Solar Storm Simulation** switch.
4. Customize parameters (e.g. Solar Wind Speed, Kp Index) or use the defaults, and click **Inject Solar Flare Anomaly**.
5. Switch to the **Dashboard** tab. You will observe:
   - The Radiation Level Gauge needle swings to the red **HIGH** range (>1280 pfu).
   - The **Status Alert** card displays a critical red danger message.
   - Future 45m, 6h, and 12h forecast cards jump upwards, indicating charging risk.
   - The **Prediction Forecast** line adjusts to the new anomalous solar wind speeds.
=======
# ORBIT-GUARD
>>>>>>> 9c097fc44aae86cb462d24d670a0bffd1f462499
