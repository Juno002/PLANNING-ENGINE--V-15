'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Beaker,
  Search,
  Trash2,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard.store';
import {
  processAbandonedCalls,
  processAnsweredCalls,
  processTransactions,
  getUniqueDates,
} from '@/services/parser.service';
import {
  demoAnsweredCalls,
  demoAbandonedCalls,
  demoTransactions,
} from '@/lib/demo-data';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv, exportToXlsx } from '@/services/export.service';

export default function FileLoadButtons() {
  const {
    setAnsweredCalls,
    setAbandonedCalls,
    setTransactions,
    toggleAudit,
    dataDate,
    setDataDate,
    clearData,
    answeredCalls,
    abandonedCalls,
    rawAbandonedCalls,
    transactions,
  } = useDashboardStore();
  const { toast } = useToast();

  const answeredInputRef = useRef<HTMLInputElement>(null);
  const abandonedInputRef = useRef<HTMLInputElement>(null);
  const transactionsInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'answered' | 'abandoned' | 'transactions'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      let data: any[];

      if (isCsv) {
        const { parseCsvFile } = await import('@/services/parser.service');
        data = await parseCsvFile<any>(file);
      } else {
        const { parseXlsxFile } = await import('@/services/parser.service');
        data = await parseXlsxFile<any>(file);
      }

      // --- VALIDATION LOGIC ---
      const uniqueDates = getUniqueDates(data);

      if (uniqueDates.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Error de Validación',
          description: `El archivo ${file.name} no contiene fechas válidas.`,
        });
        return;
      }

      if (dataDate) {
        const isConsistent = uniqueDates.every((date) => date === dataDate);
        if (!isConsistent) {
          toast({
            variant: 'destructive',
            title: 'Error de Fecha',
            description: `El archivo contiene fechas diferentes a los datos ya cargados (${dataDate}).`,
          });
          return;
        }
      } else {
        if (uniqueDates.length > 1) {
          toast({
            variant: 'destructive',
            title: 'Error de Fecha',
            description:
              'El primer archivo cargado no puede contener múltiples fechas.',
          });
          return;
        }
        setDataDate(uniqueDates[0]);
      }
      // --- END VALIDATION ---

      if (fileType === 'answered') {
        setAnsweredCalls(processAnsweredCalls(data));
      } else if (fileType === 'abandoned') {
        const { clean, raw } = processAbandonedCalls(data);
        setAbandonedCalls({ clean, raw });
      } else if (fileType === 'transactions') {
        const { clean, raw } = processTransactions(data);
        setTransactions({ clean, raw });
      }

      toast({
        title: 'Archivo Cargado',
        description: `${file.name} ha sido procesado exitosamente.`,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Procesamiento',
        description: `No se pudo procesar el archivo ${file.name}.`,
      });
    } finally {
      if (event.currentTarget) {
        event.currentTarget.value = '';
      }
    }
  };

  const handleLoadDemoData = () => {
    clearData();

    const dateForDemo = getUniqueDates(demoAnsweredCalls)[0] || null;
    setDataDate(dateForDemo);

    setAnsweredCalls(processAnsweredCalls(demoAnsweredCalls));
    const { clean: cleanAbandoned, raw: rawAbandoned } = processAbandonedCalls(
      demoAbandonedCalls as any[]
    );
    setAbandonedCalls({ clean: cleanAbandoned, raw: rawAbandoned });
    const { clean: cleanTrans, raw: rawTrans } = processTransactions(
      demoTransactions as any[]
    );
    setTransactions({ clean: cleanTrans, raw: rawTrans });

    toast({ title: 'Datos de Demostración Cargados' });
  };

  const handleClearData = () => {
    clearData();
    toast({
      title: 'Datos Limpiados',
      description: 'El dashboard ha sido reiniciado.',
    });
  };

  const hasData = dataDate !== null;

  const handleExportCsv = () => {
    if (!hasData) return;
    try {
      exportToCsv({
        answeredCalls,
        abandonedCalls,
        rawAbandonedCalls,
        transactions,
      });
      toast({
        title: 'Exportación Exitosa',
        description: 'El reporte CSV ha sido descargado.',
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Exportación',
        description: 'No se pudo generar el archivo CSV.',
      });
    }
  };

  const handleExportXlsx = () => {
    if (!hasData) return;
    try {
      exportToXlsx({
        answeredCalls,
        abandonedCalls,
        rawAbandonedCalls,
        transactions,
      });
      toast({
        title: 'Exportación Exitosa',
        description: 'El reporte de Excel ha sido descargado.',
      });
    } catch (error) {
      console.error('Error exporting to XLSX:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Exportación',
        description: 'No se pudo generar el archivo de Excel.',
      });
    }
  };

  const commonFileTypes =
    '.csv,.xls,.xlsx,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12';

  return (
    <>
      <input
        type="file"
        ref={answeredInputRef}
        className="hidden"
        accept={commonFileTypes}
        onChange={(e) => handleFileChange(e, 'answered')}
      />
      <input
        type="file"
        ref={abandonedInputRef}
        className="hidden"
        accept={commonFileTypes}
        onChange={(e) => handleFileChange(e, 'abandoned')}
      />
      <input
        type="file"
        ref={transactionsInputRef}
        className="hidden"
        accept={commonFileTypes}
        onChange={(e) => handleFileChange(e, 'transactions')}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => answeredInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Contestadas
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => abandonedInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Abandonadas
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => transactionsInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Transacciones
        </Button>
        <Button variant="outline" size="sm" onClick={handleLoadDemoData}>
          <Beaker className="mr-2 h-4 w-4" />
          Demo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={!hasData}
        >
          <FileText className="mr-2 h-4 w-4" />
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportXlsx}
          disabled={!hasData}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel
        </Button>
        <Button variant="destructive" size="sm" onClick={handleClearData}>
          <Trash2 className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={toggleAudit}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Auditoría</span>
        </Button>
      </div>
    </>
  );
}
