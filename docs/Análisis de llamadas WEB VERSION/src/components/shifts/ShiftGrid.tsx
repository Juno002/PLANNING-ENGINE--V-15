'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import ShiftCard from '@/components/kpis/ShiftCard';

export default function ShiftGrid() {
  const kpisByShift = useDashboardStore((s) => s.kpisByShift);

  const hasData =
    kpisByShift.Día.recibidas > 0 || kpisByShift.Noche.recibidas > 0;
  if (!hasData) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Análisis por Turno</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShiftCard name="Día" kpis={kpisByShift.Día} />
        <ShiftCard name="Noche" kpis={kpisByShift.Noche} />
      </div>
    </section>
  );
}
