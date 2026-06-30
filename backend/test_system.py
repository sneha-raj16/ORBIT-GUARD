import sys
import os
import unittest
from fastapi.testclient import TestClient

# Add parent path to allow imports
sys.path.append(os.path.dirname(__file__))

from main import app, sat_state
from predictor import ElectronFluxPredictor

class TestSpaceWeatherSystem(unittest.TestCase):
    
    def setUp(self):
        from main import ip_request_history
        ip_request_history.clear()
        self.client = TestClient(app)
        self.predictor = ElectronFluxPredictor()
        
    def test_predictor_logic(self):
        """
        Verify ML predictor outputs bounded, physical predictions and forecasts.
        """
        # Under normal conditions
        forecast = self.predictor.generate_12h_forecast(
            mlt=12.0, solar_wind_speed=380.0, kp_index=1.5, dst_index=2.0, current_flux=350.0
        )
        
        self.assertIn("summary", forecast)
        self.assertIn("forecast", forecast)
        self.assertEqual(len(forecast["forecast"]), 12)
        
        # Verify values are numeric and physically plausible (between 10 and 3500)
        for hour_data in forecast["forecast"]:
            self.assertTrue(10.0 <= hour_data["value"] <= 3500.0)
            self.assertTrue(hour_data["lower_ci"] <= hour_data["value"] <= hour_data["upper_ci"])

    def test_status_endpoint(self):
        """
        Verify status API returns correct metrics and labels.
        """
        response = self.client.get("/api/status")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("electron_flux_pfu", data)
        self.assertIn("solar_wind_speed_kms", data)
        self.assertIn("kp_index", data)
        self.assertIn("dst_index_nt", data)
        self.assertIn("alert_level", data)
        self.assertIn("data_quality_pct", data)

    def test_security_headers(self):
        """
        Verify OWASP secure response headers are present on all endpoints.
        """
        response = self.client.get("/api/status")
        headers = response.headers
        
        self.assertEqual(headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(headers.get("X-Frame-Options"), "DENY")
        self.assertEqual(headers.get("X-XSS-Protection"), "1; mode=block")
        self.assertIn("frame-ancestors 'none'", headers.get("Content-Security-Policy", ""))
        self.assertEqual(headers.get("Referrer-Policy"), "no-referrer")

    def test_authentication_simulation(self):
        """
        Verify bearer auth controls on simulated storm injection endpoint.
        """
        payload = {"enable_anomaly": True}
        
        # Case 1: Missing auth header -> 401 Unauthorized
        response = self.client.post("/api/simulate-anomaly", json=payload)
        self.assertEqual(response.status_code, 401)
        
        # Case 2: Bad authorization secret -> 403 Forbidden
        response = self.client.post(
            "/api/simulate-anomaly", 
            json=payload,
            headers={"Authorization": "Bearer BadSecretKey123"}
        )
        self.assertEqual(response.status_code, 403)
        
        # Case 3: Valid authorization token -> 200 Success
        response = self.client.post(
            "/api/simulate-anomaly", 
            json=payload,
            headers={"Authorization": "Bearer SpaceWeatherSecret2026"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["current_telemetry"]["electron_flux_pfu"] > 400)
        
        # Reset simulation state
        self.client.post(
            "/api/simulate-anomaly", 
            json={"enable_anomaly": False},
            headers={"Authorization": "Bearer SpaceWeatherSecret2026"}
        )

    def test_input_bounds_validation(self):
        """
        Verify Pydantic input range boundaries validation (e.g. Kp index max 9).
        """
        # Kp index is out of bounds (12.5 > 9.0)
        payload = {
            "enable_anomaly": True,
            "custom_kp_index": 12.5
        }
        response = self.client.post(
            "/api/simulate-anomaly", 
            json=payload,
            headers={"Authorization": "Bearer SpaceWeatherSecret2026"}
        )
        # Should return 422 Unprocessable Entity
        self.assertEqual(response.status_code, 422)

    def test_server_rate_limiter(self):
        """
        Verify sliding-window rate limiter returns 429 after exceeding limit.
        """
        # Enforce rate limit test by flooding status requests
        # Limit is 60/min. We run 61 requests to trigger rate limit.
        triggered_429 = False
        for _ in range(65):
            response = self.client.get("/api/status")
            if response.status_code == 429:
                triggered_429 = True
                break
                
        self.assertTrue(triggered_429)

if __name__ == "__main__":
    unittest.main()
