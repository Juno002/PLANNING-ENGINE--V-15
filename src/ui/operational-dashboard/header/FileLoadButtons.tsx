'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/ui/operational-dashboard/ui/button';
import {
  Upload,
  Beaker,
  Search,
  Trash2,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { useDashboardStore } from '@/store/useOperationalDashboardStore';
import {
  processAbandonedCalls,
  processAnsweredCalls,
  processTransactions,
  getUniqueDates,
} from '@/domain/operational/parser.service';
import {
  demoAnsweredCalls,
  demoAbandonedCalls,
  demoTransactions,
} from '@/lib/demo-data';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv, exportToXlsx } from '@/domain/operational/export.service';

export default function FileLoadButtons() {
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      let data: any[];

      if (isCsv) {
        const { parseCsvFile } = await import('@/domain/operational/parser.service');
        data = await parseCsvFile<any>(file);
      } else {
        const { parseXlsxFile } = await import('@/domain/operational/parser.service');
        data = await parseXlsxFile<any>(file);
      }

      // --- VALIDATION LOGIC ---
      const uniqueDates = getUniqueDates(data);

      if (uniqueDates.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Archivo sin fechas',
          description: `No pudimos encontrar fechas válidas en ${file.name}. Verifique el formato.`,
        });
        return;
      }

      if (dataDate) {
        const isConsistent = uniqueDates.every((date) => date === dataDate);
        if (!isConsistent) {
          toast({
            variant: 'destructive',
            title: 'Fecha incorrecta',
            description: `Este archivo no coincide con la fecha del dashboard (${dataDate}).`,
          });
          return;
        }
      } else {
        if (uniqueDates.length > 1) {
          toast({
            variant: 'destructive',
            title: 'Múltiples fechas detectadas',
            description:
              'El primer archivo debe contener solo una fecha para inicializar el dashboard.',
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
        title: 'Archivo Procesado',
        description: `${file.name} se cargó correctamente.`,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Lectura',
        description: `No pudimos leer ${file.name}. Asegúrese de que sea un archivo válido.`,
      });
    } finally {
      setIsLoading(false);
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
        title: 'ExportaciÃƒÂ³n Exitosa',
        description: 'El reporte de Excel ha sido descargado.',
      });
    } catch (error) {
      console.error('Error exporting to XLSX:', error);
      toast({
        variant: 'destructive',
        title: 'Error de ExportaciÃƒÂ³n',
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
          disabled={isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? '...' : 'Contestadas'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => abandonedInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? '...' : 'Abandonadas'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => transactionsInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? '...' : 'Transacciones'}
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
          <span className="sr-only">AuditorÃƒÂ­a</span>
        </Button>
      </div>
    </>
  );
}
