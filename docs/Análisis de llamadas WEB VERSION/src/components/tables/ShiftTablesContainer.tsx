'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import { aggregateByTimeSlot } from '@/services/kpi.service';
import ShiftDetailTable from './ShiftDetailTable';

export default function ShiftTablesContainer() {
  const { answeredCalls, abandonedCalls, transactions } = useDashboardStore();

  const hasData = answeredCalls.length > 0 || abandonedCalls.length > 0;
  if (!hasData) {
    return null;
  }

  const { day, night } = aggregateByTimeSlot(
    answeredCalls,
    abandonedCalls,
    transactions
  );

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ShiftDetailTable title="Turno Día" data={day} />
      <ShiftDetailTable title="Turno Noche" data={night} />
    </section>
  );
}
