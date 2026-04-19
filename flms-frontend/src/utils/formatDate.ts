/**
 * Formats a date string or Date object into YYYY-MM-DD HH:mm:ss
 * Uses manual string manipulation to ensure English digits regardless of locale.
 */
export const formatDateTime = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const D = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');

  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

/**
 * Formats a date string or Date object into YYYY-MM-DD
 * Uses manual string manipulation to ensure English digits regardless of locale.
 */
export const formatDate = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const D = String(date.getDate()).padStart(2, '0');

  return `${Y}-${M}-${D}`;
};

/**
 * Formats a number with English digits and thousand separators.
 */
export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return "0";
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  return n.toLocaleString('en-US');
};
