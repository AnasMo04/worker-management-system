/**
 * Formats a date string or Date object into YYYY-MM-DD HH:mm:ss
 * Strictly enforces English/ASCII digits.
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

  // Manual construction prevents locale-specific digit conversion
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

/**
 * Formats a date string or Date object into YYYY-MM-DD
 * Strictly enforces English/ASCII digits.
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
 * Formats a date string or Date object into HH:mm:ss
 * Strictly enforces English/ASCII digits.
 */
export const formatTime = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');

  return `${h}:${m}:${s}`;
};

/**
 * Formats a number with English digits and thousand separators.
 * Forces 'en-US' locale to avoid Eastern Arabic numerals.
 */
export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return "0";
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return "0";

  // Explicitly use en-US to guarantee ASCII digits
  return n.toLocaleString('en-US');
};

/**
 * Converts any string containing Eastern Arabic numerals to standard ASCII digits.
 * Useful for IDs and Passport numbers retrieved as strings.
 */
export const toAsciiDigits = (str: string | number | null | undefined): string => {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};
