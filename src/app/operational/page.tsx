'use client';

import { EmptyState } from '@/ui/operational-dashboard/ui/EmptyState';
import { useDashboardStore } from '@/store/useOperationalDashboardStore';
import { BarChart3, Upload } from 'lucide-react';
import KPISummary from '@/ui/operational-dashboard/kpis/KPISummary';
import FileLoadButtons from '@/ui/operational-dashboard/header/FileLoadButtons';
import ShiftGrid from '@/ui/operational-dashboard/shifts/ShiftGrid';
import KPIObserver from '@/ui/operational-dashboard/kpis/KPIObserver';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/ui/operational-dashboard/ui/tabs';
import ShiftTablesContainer from '@/ui/operational-dashboard/tables/ShiftTablesContainer';
import DateRangeBadge from '@/ui/operational-dashboard/header/DateRangeBadge';
import { Toaster } from '@/ui/operational-dashboard/ui/toaster';

import ShiftPerformanceChart from '@/ui/operational-dashboard/charts/ShiftPerformanceChart';
import HourlyDistributionChart from '@/ui/operational-dashboard/charts/HourlyDistributionChart';
import PlatformTransactionsChart from '@/ui/operational-dashboard/charts/PlatformTransactionsChart';
import PlatformSalesChart from '@/ui/operational-dashboard/charts/PlatformSalesChart';
import PlatformAovChart from '@/ui/operational-dashboard/charts/PlatformAovChart';
import TopBranchesChart from '@/ui/operational-dashboard/charts/TopBranchesChart';
import HourlyAbandonmentRateChart from '@/ui/operational-dashboard/charts/HourlyAbandonmentRateChart';
import HourlyConversionRateChart from '@/ui/operational-dashboard/charts/HourlyConversionRateChart';
import AuditView from '@/ui/operational-dashboard/audit/AuditView';

export default function OperationalDashboardPage() {
    const dataDate = useDashboardStore((state) => state.dataDate);

    return (
        <main className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Dashboard Operacional (Analisis)
                    </h1>
                    {dataDate && <DateRangeBadge />}
                </div>
                <FileLoadButtons />
            </div>

            <Tabs defaultValue="main">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="main">Vista Principal</TabsTrigger>
                    <TabsTrigger value="analysis">Análisis Gráfico</TabsTrigger>
                </TabsList>
                <TabsContent value="main" className="space-y-6 mt-4">
                    {!dataDate ? (
                        <EmptyState
                            title="No hay datos cargados"
                            description="Carga tus archivos CSV (Contestadas, Abandonadas) o XLSX (Transacciones) para comenzar."
                            icon={Upload}
                        />
                    ) : (
                        <>
                            <KPISummary />
                            <ShiftGrid />
                            <ShiftTablesContainer />
                        </>
                    )}
                </TabsContent>
                <TabsContent value="analysis" className="mt-4">
                    {!dataDate ? (
                        <EmptyState
                            title="Análisis no disponible"
                            description="Se requieren datos cargados para generar las gráficas de rendimiento."
                            icon={BarChart3}
                        />
                    ) : (
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
                    )}
                </TabsContent>
            </Tabs>
            <AuditView />
            <KPIObserver />
            <Toaster />
        </main>
    );
}
