'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboard.store';
import {
  calculateGlobalKpis,
  calculateKPIsByShift,
} from '@/services/kpi.service';

export default function KPIObserver() {
  const {
    answeredCalls,
    abandonedCalls,
    rawAbandonedCalls,
    transactions,
    setKPIs,
    setKPIsByShift,
  } = useDashboardStore((state) => ({
    answeredCalls: state.answeredCalls,
    abandonedCalls: state.abandonedCalls,
    rawAbandonedCalls: state.rawAbandonedCalls,
    transactions: state.transactions,
    setKPIs: state.setKPIs,
    setKPIsByShift: state.setKPIsByShift,
  }));

  useEffect(() => {
    const globalKpis = calculateGlobalKpis(
      answeredCalls,
      abandonedCalls,
      transactions
    );
    setKPIs(globalKpis);

    const shiftKpis = calculateKPIsByShift(
      answeredCalls,
      rawAbandonedCalls,
      transactions
    );
    setKPIsByShift(shiftKpis);
  }, [
    answeredCalls,
    abandonedCalls,
    rawAbandonedCalls,
    transactions,
    setKPIs,
    setKPIsByShift,
  ]);

  return null;
}
