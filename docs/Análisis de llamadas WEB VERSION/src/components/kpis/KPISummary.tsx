'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import KPICard from './KPICard';

export default function KPISummary() {
  const kpis = useDashboardStore((state) => state.kpis);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
      <KPICard title="Total Recibidas" value={kpis.recibidas} />
      <KPICard title="Total Contestadas" value={kpis.contestadas} />
      <KPICard title="Total Abandonadas" value={kpis.abandonadas} />
      <KPICard
        title="% Atención"
        value={formatPercent(kpis.nivelDeServicio)}
      />
      <KPICard
        title="% Abandono"
        value={formatPercent(
          kpis.recibidas > 0
            ? (kpis.abandonadas / kpis.recibidas) * 100
            : 0
        )}
      />
      <KPICard title="Transacciones CC" value={kpis.transaccionesCC} />
      <KPICard title="% Conversión" value={formatPercent(kpis.conversion)} />
    </section>
  );
}
