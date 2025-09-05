export function maskKey(k?: string) {
    if (!k) return '';
    if (k.length <= 12) return '***';
    return k.slice(0, 6) + '…' + k.slice(-4);
  }