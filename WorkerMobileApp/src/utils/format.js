/**
 * Utility to strictly enforce English/ASCII digits (1234567890)
 * across the application, preventing Eastern Arabic numerals.
 */

export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  const n = typeof num === 'number' ? num : parseFloat(num);
  if (isNaN(n)) return "0";
  return n.toLocaleString('en-US');
};

export const toAsciiDigits = (str) => {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const D = String(date.getDate()).padStart(2, '0');

  return `${Y}-${M}-${D}`;
};

export const formatTime = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');

  return `${h}:${m}`;
};
