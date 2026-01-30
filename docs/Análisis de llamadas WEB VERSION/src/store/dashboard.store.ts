import { create } from 'zustand';
import type {
  AnsweredCall,
  AbandonedCall,
  Transaction,
  KPIs,
  ShiftKPIs,
  Shift,
} from '@/types/dashboard.types';

type DashboardState = {
  answeredCalls: AnsweredCall[];
  abandonedCalls: AbandonedCall[];
  rawAbandonedCalls: AbandonedCall[];
  transactions: Transaction[];
  rawTransactions: Transaction[];
  kpis: KPIs;
  kpisByShift: {
    Día: ShiftKPIs;
    Noche: ShiftKPIs;
  };
  setAnsweredCalls: (data: AnsweredCall[]) => void;
  setAbandonedCalls: (data: {
    clean: AbandonedCall[];
    raw: AbandonedCall[];
  }) => void;
  setTransactions: (data: {
    clean: Transaction[];
    raw: Transaction[];
  }) => void;
  setKPIs: (kpis: KPIs) => void;
  setKPIsByShift: (kpisByShift: { Día: ShiftKPIs; Noche: ShiftKPIs }) => void;
  // Chart state
  hourlyChartShift: Shift;
  salesChartMode: 'agg' | 'plat';
  aovChartMode: 'agg' | 'plat';
  setHourlyChartShift: (shift: Shift) => void;
  setSalesChartMode: (mode: 'agg' | 'plat') => void;
  setAovChartMode: (mode: 'agg' | 'plat') => void;
  // Audit state
  isAuditVisible: boolean;
  toggleAudit: () => void;
  // Date state
  dataDate: string | null;
  setDataDate: (date: string | null) => void;
  clearData: () => void;
};

const initialShiftKPIs: ShiftKPIs = {
  recibidas: 0,
  contestadas: 0,
  trans: 0,
  conv: 0,
  abandonadas: 0,
  duplicadas: 0,
  lt20: 0,
  atencion: 0,
  abandonoPct: 0,
};

const initialState = {
  answeredCalls: [],
  abandonedCalls: [],
  rawAbandonedCalls: [],
  transactions: [],
  rawTransactions: [],
  kpis: {
    recibidas: 0,
    contestadas: 0,
    abandonadas: 0,
    nivelDeServicio: 0,
    conversion: 0,
    transaccionesCC: 0,
  },
  kpisByShift: {
    Día: initialShiftKPIs,
    Noche: initialShiftKPIs,
  },
  dataDate: null,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,
  hourlyChartShift: 'Día',
  salesChartMode: 'agg',
  aovChartMode: 'agg',
  isAuditVisible: false,

  setAnsweredCalls: (data) => set({ answeredCalls: data }),
  setAbandonedCalls: (data) =>
    set({ abandonedCalls: data.clean, rawAbandonedCalls: data.raw }),
  setTransactions: (data) =>
    set({ transactions: data.clean, rawTransactions: data.raw }),
  setKPIs: (kpis) => set({ kpis }),
  setKPIsByShift: (kpis) => set({ kpisByShift: kpis }),
  setHourlyChartShift: (shift) => set({ hourlyChartShift: shift }),
  setSalesChartMode: (mode) => set({ salesChartMode: mode }),
  setAovChartMode: (mode) => set({ aovChartMode: mode }),
  toggleAudit: () => set((state) => ({ isAuditVisible: !state.isAuditVisible })),
  setDataDate: (date) => set({ dataDate: date }),
  clearData: () => set(initialState),
}));
