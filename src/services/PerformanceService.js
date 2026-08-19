/**
 * Birthday Studio - Performance Measurement Service (Section 9)
 * Local performance.now() Diagnostic Tracker (Zero Telemetry)
 */

export class PerformanceService {
  static marks = new Map();

  static startMark(name) {
    if (window.performance && window.performance.now) {
      this.marks.set(name, window.performance.now());
    }
  }

  static endMark(name) {
    if (window.performance && window.performance.now && this.marks.has(name)) {
      const startTime = this.marks.get(name);
      const duration = window.performance.now() - startTime;
      this.marks.delete(name);
      console.log(`[PerformanceService] ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
    return 0;
  }
}
