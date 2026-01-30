'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import { Bar } from 'react-chartjs-2';
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

export default function ShiftPerformanceChart() {
  const { kpisByShift } = useDashboardStore();

  const data = {
    labels: ['Día', 'Noche'],
    datasets: [
      {
        label: '% Atención',
        data: [kpisByShift.Día.atencion, kpisByShift.Noche.atencion],
        backgroundColor: 'hsl(var(--primary))',
      },
      {
        label: '% Abandono',
        data: [kpisByShift.Día.abandonoPct, kpisByShift.Noche.abandonoPct],
        backgroundColor: 'hsl(var(--destructive))',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + '%';
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: string | number) => `${value}%`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
  const hasData =
    kpisByShift.Día.recibidas > 0 || kpisByShift.Noche.recibidas > 0;

  if (!hasData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>% Atención vs % Abandono por turno</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Bar options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
