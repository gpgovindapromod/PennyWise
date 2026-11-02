/**
 * Centralized Date & Timezone Utility for Pennywise
 * 
 * Guarantees standard Asia/Kolkata (IST = UTC+05:30) calendar boundaries
 * irrespective of the server's local host timezone.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 330 minutes in ms

/**
 * Returns the current date broken down into IST components.
 */
function getCurrentISTDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());

  const get = (t) => parts.find(p => p.type === t)?.value;
  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10);
  const day = parseInt(get('day'), 10);
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  const second = parseInt(get('second'), 10);

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const dayKey = `${monthKey}-${String(day).padStart(2, '0')}`;

  return { year, month, day, hour, minute, second, monthKey, dayKey };
}

/**
 * Parses a month indicator (either 'YYYY-MM', a Date instance, or defaults to now)
 * into numeric year and month (1-12) under IST.
 */
function parseYearMonth(input) {
  if (typeof input === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(input)) {
    const [y, m] = input.split('-');
    return { year: parseInt(y, 10), month: parseInt(m, 10) };
  }
  const d = (input instanceof Date && !isNaN(input.getTime())) ? input : new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);
  const year = parseInt(parts.find(p => p.type === 'year').value, 10);
  const month = parseInt(parts.find(p => p.type === 'month').value, 10);
  return { year, month };
}

/**
 * Calculates the exact IST month boundary instants in UTC.
 * 
 * - startOfMonth: Inclusive lower boundary (1st of month at 00:00:00.000 IST)
 * - startOfNextMonth: Exclusive upper boundary (1st of next month at 00:00:00.000 IST)
 * 
 * Usage for MongoDB:
 *   date: { $gte: startOfMonth, $lt: startOfNextMonth }
 */
function getISTMonthRange(input) {
  const { year, month } = parseYearMonth(input);
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1) - IST_OFFSET_MS);

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }
  const startOfNextMonth = new Date(Date.UTC(nextYear, nextMonth - 1, 1) - IST_OFFSET_MS);
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  return { startOfMonth, startOfNextMonth, monthKey, year, month };
}

/**
 * Calculates the exact IST day boundary instants in UTC.
 * 
 * - startOfDay: Inclusive lower boundary (00:00:00.000 IST)
 * - startOfNextDay: Exclusive upper boundary (00:00:00.000 IST next day)
 * 
 * Usage for MongoDB:
 *   date: { $gte: startOfDay, $lt: startOfNextDay }
 */
function getISTDayRange(input) {
  let year, month, day;
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split('-');
    year = parseInt(y, 10);
    month = parseInt(m, 10);
    day = parseInt(d, 10);
  } else {
    const d = (input instanceof Date && !isNaN(input.getTime())) ? input : new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d);
    year = parseInt(parts.find(p => p.type === 'year').value, 10);
    month = parseInt(parts.find(p => p.type === 'month').value, 10);
    day = parseInt(parts.find(p => p.type === 'day').value, 10);
  }

  const startOfDay = new Date(Date.UTC(year, month - 1, day) - IST_OFFSET_MS);
  const startOfNextDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  const dayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return { startOfDay, startOfNextDay, dayKey, year, month, day };
}

/**
 * Returns the day of month (1-31) in IST for a given date.
 */
function getISTDayOfMonth(date) {
  if (!date) return 1;
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return 1;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit'
  }).formatToParts(d);
  return parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
}

module.exports = {
  getCurrentISTDate,
  getISTMonthRange,
  getISTDayRange,
  getISTDayOfMonth,
  IST_OFFSET_MS
};

