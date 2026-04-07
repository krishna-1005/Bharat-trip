/**
 * Haptic Engine Utility for Bharat Trip
 * Wraps the navigator.vibrate API with professional patterns and safety checks.
 */

const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

const Haptics = {
  /**
   * Internal helper to execute a pattern
   * @param {number|number[]} pattern 
   */
  _vibrate(pattern) {
    if (canVibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently fail if browser restrictions block vibration
        console.warn("Haptics: Vibration blocked or failed", e);
      }
    }
  },

  /**
   * 15ms Light Tap: Standard button clicks or subtle UI feedback.
   */
  light() {
    this._vibrate(15);
  },

  /**
   * 30ms Medium Tap: Significant button clicks or selection feedback.
   */
  medium() {
    this._vibrate(30);
  },

  /**
   * 50-30-50 Success: Professional double-tap for completions or saves.
   */
  success() {
    this._vibrate([50, 30, 50]);
  },

  /**
   * Heavy Warning: Significant feedback for errors or destructive actions.
   */
  warning() {
    this._vibrate([100, 50, 100]);
  },

  /**
   * Long Error: Continuous pulse for critical failures.
   */
  error() {
    this._vibrate([300, 100, 300, 100, 400]);
  },

  /**
   * Custom: Play any pattern [vibrate, pause, vibrate, ...]
   * @param {number[]} pattern 
   */
  play(pattern) {
    this._vibrate(pattern);
  }
};

export default Haptics;
