'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeSlotKpi } from '@/types/dashboard.types';
import { cn } from '@/lib/utils';

type ShiftDetailTableProps = {
  title: string;
  data: TimeSlotKpi[];
};

const heatClassAtencion = (p: number) => {
  if (p >= 90) return 'bg-green-100 text-green-800';
  if (p >= 80) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const heatClassAbandono = (p: number) => {
  if (p <= 5) return 'bg-green-100 text-green-800';
  if (p <= 10) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const formatPercent = (val: number) => `${val.toFixed(1)}%`;

export default function ShiftDetailTable({ title, data }: ShiftDetailTableProps) {
  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="relative w-full overflow-auto max-h-96">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Recibidas</TableHead>
                <TableHead>Contestadas</TableHead>
                <TableHead>Conexión</TableHead>
                <TableHead>AVG time</TableHead>
                <TableHead>% Atención</TableHead>
                <TableHead>Abandonadas</TableHead>
                <TableHead>Conexión</TableHead>
                <TableHead>AVG time Aband.</TableHead>
                <TableHead>% Abandono</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((s) => (
                <TableRow key={s.hora}>
                  <TableCell className="font-medium">{s.hora}</TableCell>
                  <TableCell>{s.recibidas}</TableCell>
                  <TableCell>{s.contestadas}</TableCell>
                  <TableCell>{s.conexionSum.toFixed(4)}</TableCell>
                  <TableCell>{s.conexionAvg.toFixed(1)}</TableCell>
                  <TableCell
                    className={cn(
                      'font-semibold',
                      heatClassAtencion(s.pctAtencion)
                    )}
                  >
                    {formatPercent(s.pctAtencion)}
                  </TableCell>
                  <TableCell>{s.abandonadas}</TableCell>
                  <TableCell>{s.abandConnSum.toFixed(4)}</TableCell>
                  <TableCell>{s.abandAvg.toFixed(1)}</TableCell>
                  <TableCell
                    className={cn('font-semibold', heatClassAbandono(s.pctAband))}
                  >
                    {formatPercent(s.pctAband)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
