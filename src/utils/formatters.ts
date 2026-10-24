export function formatVND(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatVNDCompact(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0 đ';
  if (Math.abs(value) >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2).replace('.', ',') + ' tỷ';
  }
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace('.', ',') + ' tr';
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(0) + ' k';
  }
  return value.toString();
}

export function formatDateVN(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('vi-VN');
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function formatNumber(num: number | undefined | null, decimals = 0): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(num);
}
