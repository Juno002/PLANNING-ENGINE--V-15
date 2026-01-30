'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import { Line } from 'react-chartjs-2';
import { aggregateByTimeSlot } from '@/services/kpi.service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PillButton, PillToggleContainer } from '../ui/pills';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HourlyAbandonmentRateChart() {
  const {
    answeredCalls,
    abandonedCalls,
    transactions,
    hourlyChartShift,
    setHourlyChartShift,
  } = useDashboardStore();

  const timeSlotData = aggregateByTimeSlot(
    answeredCalls,
    abandonedCalls,
    transactions
  );
  const chartDetails =
    hourlyChartShift === 'Día' ? timeSlotData.day : timeSlotData.night;

  const data = {
    labels: chartDetails.map((s) => s.hora),
    datasets: [
      {
        label: '% Abandono',
        data: chartDetails.map((s) => s.pctAband),
        borderColor: 'hsl(var(--destructive))',
        backgroundColor: 'hsl(var(--destructive) / 0.1)',
        fill: true,
        tension: 0.4,
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
          label: function (context: any) {
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
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: string | number) => `${value}%`,
        },
      },
    },
  };

  if (answeredCalls.length === 0 && abandonedCalls.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle>Tasa de Abandono por Hora</CardTitle>
          <PillToggleContainer>
            <PillButton
              onClick={() => setHourlyChartShift('Día')}
              isActive={hourlyChartShift === 'Día'}
            >
              Día
            </PillButton>
            <PillButton
              onClick={() => setHourlyChartShift('Noche')}
              isActive={hourlyChartShift === 'Noche'}
            >
              Noche
            </PillButton>
          </PillToggleContainer>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <Line options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
