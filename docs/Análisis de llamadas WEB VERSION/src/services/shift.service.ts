import type { Shift } from '@/types/dashboard.types';

export const SHIFTS: Record<Shift, { start: number; end: number }> = {
  Día: { start: 9, end: 16 }, // End is exclusive
  Noche: { start: 16, end: 24 }, // End is exclusive
};

function getHourFromTime(time: string): number {
  if (!time || !time.includes(':')) return -1;
  try {
    const hour = parseInt(time.split(':')[0], 10);
    return isNaN(hour) ? -1 : hour;
  } catch {
    return -1;
  }
}

export function getShift(time: string): Shift | 'fuera' {
  const hour = getHourFromTime(time);
  if (hour === -1) return 'fuera';

  // Logic from original HTML: `if (hh >= 9 && hh < 16) return 'dia';`
  if (hour >= SHIFTS['Día'].start && hour < SHIFTS['Día'].end) {
    return 'Día';
  }
  // Logic from original HTML: `if (hh >= 16) return 'noche';`
  if (hour >= SHIFTS['Noche'].start && hour < SHIFTS['Noche'].end) {
    return 'Noche';
  }

  return 'fuera';
}
