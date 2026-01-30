'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import { Bar } from 'react-chartjs-2';
import { getTopSucursales } from '@/services/chart.service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TopBranchesChart() {
  const { transactions } = useDashboardStore();
  const { labels, values } = getTopSucursales(transactions);

  const data = {
    labels,
    datasets: [
      {
        label: 'Transacciones CC',
        data: values,
        backgroundColor: 'hsl(var(--accent))',
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Top 10 Sucursales por Transacciones CC</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <Bar options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
