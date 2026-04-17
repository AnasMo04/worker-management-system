export const formatDateTime = (date: any) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDate = (date: any) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());

  return `${year}-${month}-${day}`;
};

export const formatTime = (date: any) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  const pad = (n: number) => n.toString().padStart(2, '0');

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
};

export const formatCurrency = (amount: any) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return "0.00";
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatNumber = (n: any) => {
  const num = typeof n === 'number' ? n : parseFloat(n);
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat('en-US').format(num);
};
