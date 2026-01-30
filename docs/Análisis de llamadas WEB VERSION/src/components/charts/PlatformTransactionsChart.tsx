'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import { Bar } from 'react-chartjs-2';
import { getTransactionsByPlatform } from '@/services/chart.service';
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

export default function PlatformTransactionsChart() {
  const { transactions } = useDashboardStore();
  const chartData = getTransactionsByPlatform(transactions);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Órdenes válidas',
        data: chartData.values,
        backgroundColor: 'hsl(var(--primary) / 0.6)',
      },
    ],
  };

  const options = {
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
      y: {
        beginAtZero: true,
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones: Call Center vs Plataformas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Bar options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
