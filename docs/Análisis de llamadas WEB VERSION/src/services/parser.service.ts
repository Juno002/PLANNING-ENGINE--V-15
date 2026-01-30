import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type {
  AnsweredCall,
  AbandonedCall,
  Transaction,
} from '@/types/dashboard.types';
import { getShift } from './shift.service';

export const parseCsvFile = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseXlsxFile = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd hh:mm:ss',
        });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve([]);
          return;
        }
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<T>(worksheet, {
          raw: false,
          defval: '',
        });
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};

// --- Data Processing ---

function toNumber(v: any): number {
  if (v == null || v === '') return 0;
  const s = String(v).trim().replace(/,/g, '.');
  const m = s.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

function fixHora(h: any): string {
  if (!h) return '00:00:00';
  if (h instanceof Date) {
    return (
      h.getHours().toString().padStart(2, '0') +
      ':' +
      h.getMinutes().toString().padStart(2, '0') +
      ':' +
      h.getSeconds().toString().padStart(2, '0')
    );
  }
  const s = String(h).trim();
  try {
    if (/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(s)) {
      const [H = '0', M = '0', S = '0'] = s.split(':');
      return `${String(+H).padStart(2, '0')}:${String(+M).padStart(
        2,
        '0'
      )}:${String(+S).padStart(2, '0')}`;
    }
    if (/^\d{1,2}$/.test(s)) {
      return `${String(+s).padStart(2, '0')}:00:00`;
    }
    const dt = new Date('1970-01-01T' + s);
    if (!isNaN(dt.getTime())) {
      return `${String(dt.getHours()).padStart(2, '0')}:${String(
        dt.getMinutes()
      ).padStart(2, '0')}:${String(dt.getSeconds()).padStart(2, '0')}`;
    }
  } catch (e) {}
  return '00:00:00';
}

function periodo30(hhmmss: string): string {
  const [hh, mm] = fixHora(hhmmss).split(':').map(Number);
  return mm < 30
    ? `${String(hh).padStart(2, '0')}:00`
    : `${String(hh).padStart(2, '0')}:30`;
}

function normalizeDate(d: any): string {
  if (!d) return '';
  if (d instanceof Date) {
    try {
      // Adjust for timezone offset before converting to ISO string
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localDate = new Date(d.getTime() - tzOffset);
      return localDate.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  }
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2})-([A-Za-z]{3,4})-(\d{2,4})$/);
  if (m) {
    const day = ('0' + m[1]).slice(-2);
    const monStr = m[2].toLowerCase();
    const monMap: { [key: string]: string } = {
      jan: '01',
      ene: '01',
      feb: '02',
      mar: '03',
      apr: '04',
      abr: '04',
      may: '05',
      jun: '06',
      jul: '07',
      aug: '08',
      ago: '08',
      sep: '09',
      sept: '09',
      set: '09',
      oct: '10',
      nov: '11',
      dec: '12',
      dic: '12',
    };
    const mon = monMap[monStr] || '01';
    let year = m[3];
    if (year.length === 2) {
      year = +year >= 70 ? '19' + year : '20' + year;
    }
    return `${year}-${mon}-${day}`;
  }

  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    const tzOffset = dt.getTimezoneOffset() * 60000;
    const localDate = new Date(dt.getTime() - tzOffset);
    return localDate.toISOString().slice(0, 10);
  }
  return s;
}

function mapRawFields(rawRow: any, findKeys: string[]): string {
  const normalizedRow: { [key: string]: any } = {};
  Object.keys(rawRow).forEach((k) => {
    const normalizedKey = k
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '');
    normalizedRow[normalizedKey] = rawRow[k];
  });

  for (const key of findKeys) {
    const normalizedKey = key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '');
    if (Object.prototype.hasOwnProperty.call(normalizedRow, normalizedKey)) {
      return String(normalizedRow[normalizedKey] ?? '');
    }
  }
  return '';
}

export function getUniqueDates(raw: any[]): string[] {
  const dates = raw.map((r) =>
    normalizeDate(mapRawFields(r, ['fecha', 'date', 'dia']))
  );
  return [...new Set(dates.filter((d) => d))];
}

export function processAnsweredCalls(raw: any[]): AnsweredCall[] {
  return raw
    .map((r, index) => {
      const hora = fixHora(mapRawFields(r, ['hora', 'time', 'tiempo']));
      return {
        id: `ans-${index}`,
        dst: String(
          mapRawFields(r, ['dst', 'destino', 'troncal', 'destination']) || ''
        ),
        fecha: normalizeDate(mapRawFields(r, ['fecha', 'date', 'dia'])),
        periodo: String(
          mapRawFields(r, ['periodo', 'slot', 'horario']) || ''
        ),
        hora,
        llamadas: toNumber(
          mapRawFields(r, ['llamadas', 'calls', 'count', 'cantidad'])
        ),
        conexion: toNumber(
          mapRawFields(r, [
            'conexion',
            'coneccion',
            'tiempo',
            'duracion',
            'duration',
          ])
        ),
        turno: getShift(hora),
      } as AnsweredCall;
    })
    .filter(
      (r) => r.dst !== '8095330202' && (r.llamadas > 0 || r.conexion > 0)
    );
}

export function processAbandonedCalls(raw: any[]): {
  clean: AbandonedCall[];
  raw: AbandonedCall[];
} {
  const cleanedRaw: AbandonedCall[] = raw
    .map((r, index) => {
      const hora = fixHora(mapRawFields(r, ['hora', 'time', 'tiempo']));
      return {
        id: `abn-${index}`,
        telefono: String(
          mapRawFields(r, ['telefono', 'phone', 'callerid', 'numero']) || ''
        ),
        fecha: normalizeDate(mapRawFields(r, ['fecha', 'date', 'dia'])),
        hora: hora,
        conexion: toNumber(
          mapRawFields(r, [
            'conexion',
            'coneccion',
            'tiempo',
            'duracion',
            'duration',
          ])
        ),
        periodo: periodo30(hora),
        turno: getShift(hora),
        disposition: String(
          mapRawFields(r, ['disposition', 'estado', 'status']) || ''
        ),
      };
    })
    .filter((r) => r.telefono !== '' || r.conexion > 0);

  const telCount = new Map<string, number>();
  cleanedRaw.forEach((r) => {
    const k = r.telefono || '';
    telCount.set(k, (telCount.get(k) || 0) + 1);
  });

  const fullRaw = cleanedRaw.map((r) => ({
    ...r,
    isDuplicate: (telCount.get(r.telefono) || 0) > 1,
    isLT20: r.conexion < 20,
  }));

  const clean = fullRaw.filter((r) => !r.isDuplicate && !r.isLT20);

  return { clean, raw: fullRaw };
}

export function processTransactions(raw: any[]): {
  clean: Transaction[];
  raw: Transaction[];
} {
  const PLATFORM_LABELS: { [key: string]: string } = {
    CC: 'Call Center',
    APP: 'App',
    WA: 'WhatsApp',
    WEB: 'Web',
    AG: 'Agregadores',
  };

  const resolveCanalReal = (
    tipoFacRaw: string,
    plataformaCode: string
  ): string => {
    if (String(plataformaCode || '').toUpperCase() === 'AG') return 'Agregador';
    const v = String(tipoFacRaw || '').toUpperCase();
    if (v === 'D') return 'Delivery';
    if (v === 'C') return 'Carryout';
    return v || '';
  };

  const allTransactions = raw.map((r, index) => {
    const plataforma = (
      mapRawFields(r, ['canal', 'plataforma']) || ''
    ).toUpperCase();
    return {
      id: `trx-${index}`,
      sucursal: mapRawFields(r, [
        'nom_unidad',
        'nomunidad',
        'sucursal',
        'tienda',
      ]),
      canalReal: resolveCanalReal(
        mapRawFields(r, ['tipo_fac', 'tipofac']),
        plataforma
      ),
      plataforma:
        PLATFORM_LABELS[plataforma] || plataforma || 'Sin plataforma',
      plataformaCode: plataforma,
      fecha: normalizeDate(mapRawFields(r, ['fecha', 'date', 'dia'])),
      hora: fixHora(mapRawFields(r, ['hora', 'time', 'tiempo'])),
      estatus: (
        mapRawFields(r, ['estatuscc', 'estatus', 'estado']) || ''
      ).toUpperCase(),
      valor: toNumber(mapRawFields(r, ['valor', 'monto', 'total'])),
    };
  });

  const cleanTransactions = allTransactions.filter((r) => r.estatus !== 'A');

  return { clean: cleanTransactions, raw: allTransactions };
}
