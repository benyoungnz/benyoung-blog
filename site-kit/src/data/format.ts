export const formatDate = (d: Date, style: 'short' | 'long' = 'short') =>
  d.toLocaleDateString('en-NZ', style === 'short' ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' });

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
