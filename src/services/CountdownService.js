/**
 * Birthday Studio - Universal Countdown Service
 * Timezone-aware Calculation Engine, Timezone Catalog & Countdown Config Factory
 */

export class CountdownService {
  /**
   * Curated list of standard global timezones
   */
  static getTimezonesList() {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    
    const standardTzs = [
      { id: localTz, label: `📍 Local Device (${localTz})` },
      { id: 'UTC', label: '🌐 UTC / GMT (Coordinated Universal Time)' },
      { id: 'America/New_York', label: '🇺🇸 US Eastern (New York, Miami, Atlanta)' },
      { id: 'America/Chicago', label: '🇺🇸 US Central (Chicago, Dallas, Houston)' },
      { id: 'America/Denver', label: '🇺🇸 US Mountain (Denver, Salt Lake, Phoenix)' },
      { id: 'America/Los_Angeles', label: '🇺🇸 US Pacific (Los Angeles, Seattle, SF)' },
      { id: 'America/Toronto', label: '🇨🇦 Canada Eastern (Toronto, Montreal)' },
      { id: 'America/Vancouver', label: '🇨🇦 Canada Pacific (Vancouver)' },
      { id: 'Europe/London', label: '🇬🇧 UK / London (GMT / BST)' },
      { id: 'Europe/Paris', label: '🇫🇷 Europe Central (Paris, Berlin, Rome, Madrid)' },
      { id: 'Europe/Athens', label: '🇬🇷 Europe Eastern (Athens, Cairo, Helsinki)' },
      { id: 'Asia/Dubai', label: '🇦🇪 Gulf Standard (Dubai, Abu Dhabi)' },
      { id: 'Asia/Kolkata', label: '🇮🇳 India Standard Time (IST - Mumbai, Delhi)' },
      { id: 'Asia/Bangkok', label: '🇹🇭 Indochina Time (Bangkok, Hanoi, Jakarta)' },
      { id: 'Asia/Singapore', label: '🇸🇬 Singapore / Hong Kong / Beijing (SGT)' },
      { id: 'Asia/Tokyo', label: '🇯🇵 Japan Standard (Tokyo, Seoul)' },
      { id: 'Australia/Sydney', label: '🇦🇺 Australia Eastern (Sydney, Melbourne)' },
      { id: 'Pacific/Auckland', label: '🇳🇿 New Zealand (Auckland, Wellington)' },
      { id: 'Pacific/Honolulu', label: '🌺 Hawaii Time (Honolulu)' }
    ];

    // Ensure unique IDs
    const seen = new Set();
    return standardTzs.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  /**
   * Generates default countdown configuration for a project
   */
  static getDefaultCountdown(targetDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    return {
      enabled: false,
      targetDate: targetDate || todayStr,
      targetTime: '00:00',
      timezone: localTz,
      styleId: 'countdown_minimal',
      title: 'Something Special is Coming...',
      subtitle: 'Counting down to celebration time!'
    };
  }

  /**
   * Calculates the exact epoch timestamp of target date/time in the chosen timezone
   */
  static getTargetTimestamp(targetDateStr, targetTimeStr, timezoneStr) {
    const datePart = targetDateStr || new Date().toISOString().split('T')[0];
    const timePart = (targetTimeStr || '00:00').trim();
    const formattedTime = timePart.length === 5 ? `${timePart}:00` : timePart;
    const tz = timezoneStr || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    try {
      const isoWithoutTz = `${datePart}T${formattedTime}`;
      const utcTarget = new Date(`${isoWithoutTz}Z`);
      if (isNaN(utcTarget.getTime())) {
        return new Date(`${datePart}T${formattedTime}`).getTime();
      }

      // Check timezone offset relative to UTC
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      });

      const parts = formatter.formatToParts(utcTarget);
      const p = {};
      parts.forEach(({ type, value }) => { p[type] = value; });

      const tzYear = parseInt(p.year, 10);
      const tzMonth = parseInt(p.month, 10) - 1;
      const tzDay = parseInt(p.day, 10);
      const tzHour = parseInt(p.hour === '24' ? '00' : p.hour, 10);
      const tzMinute = parseInt(p.minute, 10);
      const tzSecond = parseInt(p.second, 10);

      const tzDate = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond);
      const offsetMs = tzDate - utcTarget.getTime();

      return utcTarget.getTime() - offsetMs;
    } catch (err) {
      return new Date(`${datePart}T${formattedTime}`).getTime();
    }
  }

  /**
   * Calculates remaining days, hours, minutes, and seconds relative to target moment
   */
  static calculateRemaining(targetDateStr, targetTimeStr, timezoneStr) {
    const targetTimestamp = this.getTargetTimestamp(targetDateStr, targetTimeStr, timezoneStr);
    const now = Date.now();
    const diffMs = targetTimestamp - now;

    if (diffMs <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
        isExpired: true,
        targetTimestamp
      };
    }

    const seconds = Math.floor((diffMs / 1000) % 60);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return {
      days,
      hours,
      minutes,
      seconds,
      totalMs: diffMs,
      isExpired: false,
      targetTimestamp
    };
  }

  /**
   * Formats a 2-digit number with leading zero
   */
  static padZero(num) {
    return String(num).padStart(2, '0');
  }
}
