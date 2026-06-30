/**
 * Security and Input Validation Utility Functions
 */

// Secure admin API key
const DEFAULT_API_KEY = "SpaceWeatherSecret2026";

/**
 * Sanitizes input string to prevent cross-site scripting (XSS)
 * @param {string} input - Raw input text
 * @returns {string} - Clean sanitized text
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates whether the given solar wind speed is within physical ranges
 * @param {number|string} val 
 * @returns {boolean}
 */
export function isValidSolarWindSpeed(val) {
  const num = parseFloat(val);
  return !isNaN(num) && num >= 100 && num <= 1200;
}

/**
 * Validates whether Kp index is valid (0 to 9)
 * @param {number|string} val 
 * @returns {boolean}
 */
export function isValidKpIndex(val) {
  const num = parseFloat(val);
  return !isNaN(num) && num >= 0 && num <= 9;
}

/**
 * Validates whether Dst index is valid (-400 to 50 nT)
 * @param {number|string} val 
 * @returns {boolean}
 */
export function isValidDstIndex(val) {
  const num = parseFloat(val);
  return !isNaN(num) && num >= -400 && num <= 50;
}

/**
 * Simple client-side rate-limiter to prevent API call spamming
 */
class ClientRateLimiter {
  constructor(limitMs = 1500) {
    this.limitMs = limitMs;
    this.lastCall = 0;
  }

  /**
   * Attempts to execute action, returns true if permitted, false if rate limited
   */
  check() {
    const now = Date.now();
    if (now - this.lastCall < this.limitMs) {
      return false;
    }
    this.lastCall = now;
    return true;
  }
}

export const submissionLimiter = new ClientRateLimiter(2000);

export function getAuthHeader() {
  const key = localStorage.getItem("admin_api_key") || DEFAULT_API_KEY;
  return `Bearer ${key}`;
}

export function saveApiKey(key) {
  const cleanKey = sanitizeInput(key.trim());
  localStorage.setItem("admin_api_key", cleanKey);
}
