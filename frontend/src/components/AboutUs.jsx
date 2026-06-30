import React from 'react';
import { Space, Compass, ShieldAlert } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="glass-card">
      <div className="card-title">
        <span>Space Environment Hazards & Geostationary Satellites</span>
      </div>
      
      <div className="about-grid">
        <p>
          Geostationary orbit (GEO, ~35,786 km altitude) is home to critical communications, meteorology, and navigation satellites operated by agencies worldwide, including ISRO (e.g., INSAT and GSAT series). However, GEO satellites operate in the outer region of Earth's outer radiation belt, exposing them to highly energetic relativistic particles.
        </p>

        <div className="about-highlight">
          "The primary threat comes from high-energy relativistic electrons (&ge;2 MeV). These particles can penetrate spacecraft walls, depositing charge directly into circuit boards, cabling, and semiconductors."
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#3b82f6', marginTop: '8px' }}>Deep Dielectric Charging (DDC)</h3>
        <p>
          When the accumulation rate of these electrons exceeds the rate of charge leakage, massive electric fields build up inside the satellite. This results in **Electrostatic Discharge (ESD)**, which causes phantom commands, payload resets, signal disruption, or permanent component burnout.
        </p>

        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#3b82f6', marginTop: '8px' }}>Mission Safeguards via ML Forecasting</h3>
        <p>
          To mitigate charging damage, satellite operators rely on early warnings:
        </p>
        <ul style={{ paddingLeft: '24px', listStyleType: 'square', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li><strong>30 to 45 Minutes Warning:</strong> Enables rapid defensive actions, such as shutting down high-voltage payloads, disabling thruster triggers, or postponing delicate orbit maneuvers.</li>
          <li><strong>6 to 12 Hours Forecast:</strong> Allows orbital operators to plan operations, schedule safe intervals, and monitor cumulative radiation doses for critical missions.</li>
        </ul>
      </div>
    </div>
  );
}
