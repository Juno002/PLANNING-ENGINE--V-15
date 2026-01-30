'use client';

import { useDashboardStore } from '@/store/dashboard.store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { calculateAuditData } from '@/services/audit.service';

const AuditTable = ({
  data,
  valueFormatter,
}: {
  data: Record<string, number>;
  valueFormatter?: (value: number) => string | number;
}) => {
  const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <table className="w-full max-w-md text-sm my-3 border-collapse">
      <tbody>
        {sortedData.map(([key, value]) => (
          <tr key={key} className="border-b">
            <td className="p-2">{key}</td>
            <td className="p-2 text-right font-mono">
              {valueFormatter
                ? valueFormatter(value)
                : value.toLocaleString('es-ES')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default function AuditView() {
  const {
    isAuditVisible,
    rawTransactions,
    transactions: validTransactions,
  } = useDashboardStore();

  if (!isAuditVisible || rawTransactions.length === 0) {
    return null;
  }

  const auditData = calculateAuditData(rawTransactions, validTransactions);
  const formatCurrency = (val: number) =>
    val.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2,
    });

  return (
    <Card className="mt-6 border-amber-500/50 bg-amber-50/50 dark:bg-gray-800 dark:border-amber-700">
      <CardHeader>
        <CardTitle>Auditoría de Transacciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <strong>Rango de fechas detectado:</strong> {auditData.dateRange}
        </div>
        <div>
          <strong>Registros totales:</strong>{' '}
          {auditData.totalRecords.toLocaleString('es-ES')}
        </div>
        <div>
          <strong>Registros válidos (Anuladas excluidas):</strong>{' '}
          {auditData.validRecords.toLocaleString('es-ES')}
        </div>
        <div>
          <h4 className="font-semibold mt-4">
            Desglose por estatus (datos crudos):
          </h4>
          <AuditTable data={auditData.byStatus} />
        </div>
        <div>
          <h4 className="font-semibold mt-4">
            Desglose por plataforma (válidas):
          </h4>
          <AuditTable data={auditData.byPlatform} />
        </div>
        <div>
          <h4 className="font-semibold mt-4">
            Desglose por canal real (válidas):
          </h4>
          <AuditTable data={auditData.byCanalReal} />
        </div>
        <div>
          <h4 className="font-semibold mt-4">
            Análisis de montos (válidas):
          </h4>
          <div className="pl-4">
            <p>
              <strong>Monto total:</strong>{' '}
              {formatCurrency(auditData.totalValue)}
            </p>
            <p>
              <strong>Ticket promedio global:</strong>{' '}
              {formatCurrency(auditData.globalAov)}
            </p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mt-4">
            Ticket promedio por plataforma (válidas):
          </h4>
          <AuditTable
            data={auditData.aovByPlatform}
            valueFormatter={(v) => v.toFixed(2)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
