import Papa from 'papaparse';
import { WorkOrderRecord, TargetStatus, MatrixRow, DailySummary, KPISummary } from '../types';

export const DEFAULT_SPREADSHEET_ID = '1cQsWKZcQPtNPUCKEUIZDP2w7hatq0r6gWLvZ7gAv_ws';
export const DEFAULT_GID = '1986723754';
export const DEFAULT_SHEET_NAME = 'WO T&D';
export const DEFAULT_CSV_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/export?format=csv&gid=${DEFAULT_GID}`;

// Clean string from non-breaking spaces and redundant whitespaces
export function cleanStr(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\u00a0/g, ' ').trim();
}

// Parse date string like "24/07/2026", "2026-07-24", "24-07-2026"
export function parseDate(dateStr: string): { day: number; month: number; year: number; ym: string } | null {
  if (!dateStr) return null;
  const clean = cleanStr(dateStr);
  if (!clean) return null;

  // Check DD/MM/YYYY or D/M/YYYY
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length >= 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      let y = parseInt(parts[2], 10);
      if (y < 100) y += 2000;
      if (!isNaN(d) && !isNaN(m) && !isNaN(y) && d >= 1 && d <= 31 && m >= 1 && m <= 12) {
        return {
          day: d,
          month: m,
          year: y,
          ym: `${y}-${String(m).padStart(2, '0')}`,
        };
      }
    }
  }

  // Check YYYY-MM-DD or DD-MM-YYYY
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && d >= 1 && d <= 31 && m >= 1 && m <= 12) {
          return {
            day: d,
            month: m,
            year: y,
            ym: `${y}-${String(m).padStart(2, '0')}`,
          };
        }
      } else {
        // DD-MM-YYYY
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        let y = parseInt(parts[2], 10);
        if (y < 100) y += 2000;
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && d >= 1 && d <= 31 && m >= 1 && m <= 12) {
          return {
            day: d,
            month: m,
            year: y,
            ym: `${y}-${String(m).padStart(2, '0')}`,
          };
        }
      }
    }
  }

  return null;
}

export function parseCSVData(csvText: string): WorkOrderRecord[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => cleanStr(h),
  });

  const records: WorkOrderRecord[] = [];

  result.data.forEach((row, idx) => {
    const wo = cleanStr(row['Work Order']);
    // Filter out rows that are not valid work orders or are empty headers/totals
    if (!wo || !/^\d+$/.test(wo)) {
      return;
    }

    const rawStatus = cleanStr(row['Status']).toUpperCase();
    const statusDateStr = cleanStr(row['Status Date']);
    const dateParsed = parseDate(statusDateStr);

    const record: WorkOrderRecord = {
      id: `wo-${wo}-${idx}`,
      workOrder: wo,
      description: cleanStr(row['Description']),
      workType: cleanStr(row['Work Type']),
      location: cleanStr(row['Location']),
      asset: cleanStr(row['Asset']),
      owner: cleanStr(row['Owner']),
      unit: cleanStr(row['Unit']),
      status: rawStatus,
      unitDescription: cleanStr(row['Unit Description']),
      po: cleanStr(row['PO']),
      reportedDate: cleanStr(row['Reported Date']),
      scheduledStart: cleanStr(row['Scheduled Start']),
      hiValue: cleanStr(row['HI Value']),
      descriptionPenyulang: cleanStr(row['Description Penyulang']),
      statusDate: statusDateStr,
      statusDay: dateParsed ? dateParsed.day : null,
      statusMonth: dateParsed ? dateParsed.month : null,
      statusYear: dateParsed ? dateParsed.year : null,
      statusYearMonth: dateParsed ? dateParsed.ym : null,
      priority: cleanStr(row['Priority']),
      originatingRecord: cleanStr(row['Originating Record']),
      site: cleanStr(row['Site']),
      bulan: cleanStr(row['Bulan']),
      up3: cleanStr(row['UP3']),
      insp: cleanStr(row['INSP']),
      jenisWo: cleanStr(row['JENIS WO']),
      panjangJtm: cleanStr(row['PANJANG JTM']),
      fasa: cleanStr(row['FASA']),
      year: cleanStr(row['YEAR']),
      raw: row,
    };

    records.push(record);
  });

  return records;
}

export const INDONESIAN_MONTH_NAMES: Record<number, string> = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember',
};

export const INDONESIAN_DAY_NAMES: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

export function getDaysInMonth(yearMonth: string): number {
  if (yearMonth === 'ALL') return 31;
  const [y, m] = yearMonth.split('-').map(Number);
  if (!y || !m) return 31;
  return new Date(y, m, 0).getDate();
}

export function formatMonthYear(ym: string): string {
  if (ym === 'ALL') return 'Semua Bulan';
  const [yearStr, monthStr] = ym.split('-');
  const m = parseInt(monthStr, 10);
  return `${INDONESIAN_MONTH_NAMES[m] || monthStr} ${yearStr}`;
}

export function calculateKPISummary(records: WorkOrderRecord[], daysInMonth: number, yearMonth: string): KPISummary {
  const totalRecords = records.length;
  let compCount = 0;
  let wfollowupCount = 0;
  let wfcompCount = 0;

  const dayCounts: Record<number, number> = {};

  records.forEach((r) => {
    if (r.status === 'COMP') compCount++;
    else if (r.status === 'WFOLLOWUP') wfollowupCount++;
    else if (r.status === 'WFCOMP') wfcompCount++;

    if (r.statusDay !== null && r.statusDay >= 1 && r.statusDay <= 31) {
      dayCounts[r.statusDay] = (dayCounts[r.statusDay] || 0) + 1;
    }
  });

  let peakDay: { day: number; count: number; dateStr: string } | null = null;
  let maxCount = 0;
  const daysWithData = Object.keys(dayCounts).length;

  for (let d = 1; d <= daysInMonth; d++) {
    const count = dayCounts[d] || 0;
    if (count > maxCount) {
      maxCount = count;
      let dateStr = `Tgl ${d}`;
      if (yearMonth !== 'ALL') {
        const [y, m] = yearMonth.split('-');
        dateStr = `${d} ${INDONESIAN_MONTH_NAMES[parseInt(m, 10)]} ${y}`;
      }
      peakDay = { day: d, count, dateStr };
    }
  }

  const compPercentage = totalRecords > 0 ? (compCount / totalRecords) * 100 : 0;
  const wfollowupPercentage = totalRecords > 0 ? (wfollowupCount / totalRecords) * 100 : 0;
  const wfcompPercentage = totalRecords > 0 ? (wfcompCount / totalRecords) * 100 : 0;
  const dailyAverage = daysWithData > 0 ? totalRecords / daysWithData : (daysInMonth > 0 ? totalRecords / daysInMonth : 0);

  return {
    totalRecords,
    compCount,
    wfollowupCount,
    wfcompCount,
    compPercentage,
    wfollowupPercentage,
    wfcompPercentage,
    peakDay,
    dailyAverage,
    totalDaysWithData: daysWithData,
  };
}

export function buildStatusMatrix(
  records: WorkOrderRecord[],
  daysCount: number,
  activeStatuses: string[]
): MatrixRow[] {
  const statuses: TargetStatus[] = ['COMP', 'WFOLLOWUP', 'WFCOMP'];
  const filteredStatuses = statuses.filter((s) => activeStatuses.includes(s));

  const rows: MatrixRow[] = [];
  const grandTotalDays: Record<number, number> = {};
  for (let d = 1; d <= daysCount; d++) {
    grandTotalDays[d] = 0;
  }
  const allFilteredRecords: WorkOrderRecord[] = [];

  filteredStatuses.forEach((status) => {
    const statusRecords = records.filter((r) => r.status === status);
    allFilteredRecords.push(...statusRecords);
    const dayMap: Record<number, number> = {};
    for (let d = 1; d <= daysCount; d++) {
      dayMap[d] = 0;
    }

    statusRecords.forEach((r) => {
      if (r.statusDay !== null && r.statusDay >= 1 && r.statusDay <= daysCount) {
        dayMap[r.statusDay] = (dayMap[r.statusDay] || 0) + 1;
        grandTotalDays[r.statusDay] = (grandTotalDays[r.statusDay] || 0) + 1;
      }
    });

    const total = statusRecords.length;
    let daysWithData = Object.values(dayMap).filter((v) => v > 0).length;
    const avgDaily = daysWithData > 0 ? total / daysWithData : (daysCount > 0 ? total / daysCount : 0);

    const labels: Record<TargetStatus, { title: string; subTitle: string }> = {
      COMP: { title: 'COMP (Completed)', subTitle: 'Pekerjaan WO Selesai' },
      WFOLLOWUP: { title: 'WFOLLOWUP (Waiting Follow Up)', subTitle: 'Menunggu Tindak Lanjut' },
      WFCOMP: { title: 'WFCOMP (Waiting Completion)', subTitle: 'Menunggu Penyelesaian Final' },
    };

    rows.push({
      id: `status-${status}`,
      category: 'status',
      title: labels[status].title,
      subTitle: labels[status].subTitle,
      statusType: status,
      days: dayMap,
      total,
      avgDaily,
      records: statusRecords,
    });
  });

  const grandTotal = allFilteredRecords.length;
  let activeDays = Object.values(grandTotalDays).filter((v) => v > 0).length;
  const grandAvg = activeDays > 0 ? grandTotal / activeDays : (daysCount > 0 ? grandTotal / daysCount : 0);

  rows.push({
    id: 'status-TOTAL',
    category: 'status',
    title: 'TOTAL HARIAN WO',
    subTitle: 'Akumulasi semua status per tanggal',
    statusType: 'TOTAL',
    days: grandTotalDays,
    total: grandTotal,
    avgDaily: grandAvg,
    records: allFilteredRecords,
  });

  return rows;
}

export function buildUnitMatrix(
  records: WorkOrderRecord[],
  daysCount: number,
  activeStatuses: string[]
): { unit: string; total: number; rows: MatrixRow[] }[] {
  // Get all unique units
  const unitsMap = new Map<string, WorkOrderRecord[]>();

  records.forEach((r) => {
    const unitName = r.unitDescription || r.unit || 'Lainnya';
    if (!unitsMap.has(unitName)) {
      unitsMap.set(unitName, []);
    }
    unitsMap.get(unitName)!.push(r);
  });

  const sortedUnits = Array.from(unitsMap.keys()).sort((a, b) => {
    return (unitsMap.get(b)?.length || 0) - (unitsMap.get(a)?.length || 0);
  });

  return sortedUnits.map((unitName) => {
    const unitRecords = unitsMap.get(unitName) || [];
    const subRows = buildStatusMatrix(unitRecords, daysCount, activeStatuses);
    return {
      unit: unitName,
      total: unitRecords.length,
      rows: subRows,
    };
  });
}

export function buildDailySummaryList(
  records: WorkOrderRecord[],
  daysCount: number,
  yearMonth: string
): DailySummary[] {
  const summaries: DailySummary[] = [];
  const [yearStr, monthStr] = yearMonth !== 'ALL' ? yearMonth.split('-') : ['2026', '8'];
  const y = parseInt(yearStr, 10) || 2026;
  const m = parseInt(monthStr, 10) || 8;

  for (let d = 1; d <= daysCount; d++) {
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    const dayName = INDONESIAN_DAY_NAMES[dayOfWeek] || '';
    const dateStr = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;

    let comp = 0;
    let wfollowup = 0;
    let wfcomp = 0;

    records.forEach((r) => {
      if (r.statusDay === d) {
        if (r.status === 'COMP') comp++;
        else if (r.status === 'WFOLLOWUP') wfollowup++;
        else if (r.status === 'WFCOMP') wfcomp++;
      }
    });

    const total = comp + wfollowup + wfcomp;
    const compPercentage = total > 0 ? (comp / total) * 100 : 0;

    summaries.push({
      day: d,
      dateStr,
      dayName,
      comp,
      wfollowup,
      wfcomp,
      total,
      compPercentage,
    });
  }

  return summaries;
}

export function exportMatrixToCSV(matrixRows: MatrixRow[], daysCount: number, monthLabel: string): void {
  const headers = ['Status / Kategori', 'Keterangan'];
  for (let d = 1; d <= daysCount; d++) {
    headers.push(`Tgl ${d}`);
  }
  headers.push('Total', 'Rata-Rata/Hari');

  const rows = matrixRows.map((r) => {
    const row = [r.title, r.subTitle || ''];
    for (let d = 1; d <= daysCount; d++) {
      row.push(String(r.days[d] || 0));
    }
    row.push(String(r.total), r.avgDaily.toFixed(1));
    return row;
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Monitoring_WO_TD_${monthLabel.replace(/\s+/g, '_')}_Matrix.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportRecordsToCSV(records: WorkOrderRecord[], filename: string): void {
  const headers = [
    'Work Order',
    'Status',
    'Status Date',
    'Description',
    'Unit Description',
    'Description Penyulang',
    'Work Type',
    'Location',
    'Asset',
    'Owner',
    'Reported Date',
    'Priority',
  ];

  const rows = records.map((r) => [
    r.workOrder,
    r.status,
    r.statusDate,
    r.description,
    r.unitDescription,
    r.descriptionPenyulang,
    r.workType,
    r.location,
    r.asset,
    r.owner,
    r.reportedDate,
    r.priority,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
