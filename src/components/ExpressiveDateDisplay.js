/**
 * Birthday Studio - Expressive Date Display Component
 * Universal, theme-aware, responsive date presentation for celebration countdowns and scenes.
 * Transforms raw ISO/developer dates into human-friendly, expressive typographic compositions.
 */

export class ExpressiveDateDisplay {
  /**
   * Parses and formats any valid date string or timestamp into human-readable parts.
   * @param {string|number|Date} dateInput - ISO string, timestamp, or Date object
   * @returns {Object} Extracted date parts
   */
  static parseDate(dateInput) {
    if (!dateInput) {
      dateInput = new Date();
    }

    let parsed;
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      // Split YYYY-MM-DD directly to prevent local timezone rollback
      const [y, m, d] = dateInput.split('-').map(Number);
      parsed = new Date(y, m - 1, d, 12, 0, 0);
    } else {
      parsed = new Date(dateInput);
    }

    if (isNaN(parsed.getTime())) {
      parsed = new Date();
    }

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const weekdays = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    const day = parsed.getDate();
    const month = months[parsed.getMonth()];
    const monthUpper = month.toUpperCase();
    const monthShort = month.slice(0, 3).toUpperCase();
    const year = parsed.getFullYear();
    const weekday = weekdays[parsed.getDay()];
    const weekdayUpper = weekday.toUpperCase();

    return {
      day: String(day),
      dayPadded: String(day).padStart(2, '0'),
      month,
      monthUpper,
      monthShort,
      year: String(year),
      weekday,
      weekdayUpper,
      formattedFull: `${day} ${month} ${year}`,
      formattedUpper: `${day} ${monthUpper} ${year}`
    };
  }

  /**
   * Renders the HTML markup for the Expressive Date Display based on the active theme.
   * @param {Object} options
   * @param {string|Date} options.date - Target date (e.g. '2026-08-18')
   * @param {string} [options.theme='countdown_minimal'] - Countdown style ID
   * @param {string} [options.layout='auto'] - Layout style: 'auto' | 'stacked' | 'badge' | 'inline'
   * @param {boolean} [options.showWeekday=true] - Whether to show the weekday
   * @param {boolean} [options.showYear=true] - Whether to show the year
   * @param {string} [options.badgeText=''] - Optional custom header/badge text (e.g. 'SPECIAL DAY')
   * @param {string} [options.viewMode='desktop'] - 'desktop' | 'mobile'
   * @returns {string} HTML string
   */
  static render(options = {}) {
    const {
      date,
      theme = 'countdown_minimal',
      layout = 'auto',
      showWeekday = true,
      showYear = true,
      badgeText = '',
      viewMode = 'desktop'
    } = options;

    const parts = this.parseDate(date);
    const themeKey = (theme || 'countdown_minimal').toLowerCase().replace('style-', '');
    
    // Theme-specific ornament and badge configurations
    let defaultBadge = 'THE SPECIAL DAY';
    let ornamentLeft = '✦';
    let ornamentRight = '✦';
    let themeLayout = layout !== 'auto' ? layout : 'stacked';

    if (themeKey.includes('elegant')) {
      defaultBadge = 'THE CELEBRATION DAY';
      ornamentLeft = '✨';
      ornamentRight = '✨';
    } else if (themeKey.includes('cinematic')) {
      defaultBadge = 'MARK THE MOMENT';
      ornamentLeft = '✦';
      ornamentRight = '✦';
    } else if (themeKey.includes('neon')) {
      defaultBadge = 'THE BIG DAY';
      ornamentLeft = '⚡';
      ornamentRight = '⚡';
    } else if (themeKey.includes('glass')) {
      defaultBadge = 'SPECIAL DAY';
      ornamentLeft = '💎';
      ornamentRight = '💎';
    } else if (themeKey.includes('flip')) {
      defaultBadge = 'DATE LOCKED';
      ornamentLeft = '•';
      ornamentRight = '•';
    } else if (themeKey.includes('fullscreen')) {
      defaultBadge = 'A CELEBRATION IS COMING';
      ornamentLeft = '✨';
      ornamentRight = '✨';
    }

    const activeBadge = badgeText || defaultBadge;

    return `
      <div class="expressive-date-display theme-${themeKey} mode-${viewMode} layout-${themeLayout}" role="region" aria-label="Celebration Target Date: ${parts.formattedFull}">
        <!-- Top Badge / Header Tag -->
        <div class="expressive-date-badge-wrapper">
          <span class="expressive-date-badge">
            <span class="badge-ornament ornament-left" aria-hidden="true">${ornamentLeft}</span>
            <span class="badge-text">${activeBadge}</span>
            <span class="badge-ornament ornament-right" aria-hidden="true">${ornamentRight}</span>
          </span>
        </div>

        <!-- Main Date Composition -->
        <div class="expressive-date-composition">
          ${showWeekday ? `
            <div class="expressive-date-weekday">
              <span>${parts.weekdayUpper}</span>
            </div>
          ` : ''}

          <div class="expressive-date-core">
            <span class="expressive-date-day">${parts.day}</span>
            <div class="expressive-date-month-year">
              <span class="expressive-date-month">${parts.monthUpper}</span>
              ${showYear ? `<span class="expressive-date-year">${parts.year}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Subtle Theme Accent Divider -->
        <div class="expressive-date-divider" aria-hidden="true"></div>
      </div>
    `;
  }
}
