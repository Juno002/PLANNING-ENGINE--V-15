'use client';

import KPISummary from '@/components/kpis/KPISummary';
import FileLoadButtons from '@/components/header/FileLoadButtons';
import ShiftGrid from '@/components/shifts/ShiftGrid';
import KPIObserver from '@/components/kpis/KPIObserver';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import ShiftTablesContainer from '@/components/tables/ShiftTablesContainer';
import DateRangeBadge from '@/components/header/DateRangeBadge';
import { Toaster } from '@/components/ui/toaster';

import ShiftPerformanceChart from '@/components/charts/ShiftPerformanceChart';
import HourlyDistributionChart from '@/components/charts/HourlyDistributionChart';
import PlatformTransactionsChart from '@/components/charts/PlatformTransactionsChart';
import PlatformSalesChart from '@/components/charts/PlatformSalesChart';
import PlatformAovChart from '@/components/charts/PlatformAovChart';
import TopBranchesChart from '@/components/charts/TopBranchesChart';
import HourlyAbandonmentRateChart from '@/components/charts/HourlyAbandonmentRateChart';
import HourlyConversionRateChart from '@/components/charts/HourlyConversionRateChart';
import AuditView from '@/components/audit/AuditView';

export default function DashboardPage() {
  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Call Center
          </h1>
          <DateRangeBadge />
        </div>
        <FileLoadButtons />
      </div>

      <Tabs defaultValue="main">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="main">Vista Principal</TabsTrigger>
          <TabsTrigger value="analysis">Análisis Gráfico</TabsTrigger>
        </TabsList>
        <TabsContent value="main" className="space-y-6 mt-4">
          <KPISummary />
          <ShiftGrid />
          <ShiftTablesContainer />
        </TabsContent>
        <TabsContent value="analysis" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ShiftPerformanceChart />
            <HourlyDistributionChart />
            <HourlyAbandonmentRateChart />
            <HourlyConversionRateChart />
            <PlatformTransactionsChart />
            <PlatformSalesChart />
            <PlatformAovChart />
            <TopBranchesChart />
          </div>
        </TabsContent>
      </Tabs>
      <AuditView />
      <KPIObserver />
      <Toaster />
    </main>
  );
}
