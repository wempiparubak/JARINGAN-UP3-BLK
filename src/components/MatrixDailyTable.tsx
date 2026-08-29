import React, { useState } from 'react';
import { 
  Table, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Info, 
  Layers, 
  Building2, 
  Calendar,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { MatrixRow, TargetStatus, WorkOrderRecord } from '../types';
import { INDONESIAN_MONTH_NAMES } from '../utils/dataParser';

interface MatrixDailyTableProps {
  statusRows: MatrixRow[];
  unitMatrix: { unit: string; total: number; rows: MatrixRow[] }[];
  daysCount: number;
  yearMonth: string;
  onSelectCell: (title: string, day: number, records: WorkOrderRecord[]) => void;
  onExportCSV: () => void;
  onExportPDF?: () => void;
}

export const MatrixDailyTable: React.FC<MatrixDailyTableProps> = ({
  statusRows,
  unitMatrix,
  daysCount,
  yearMonth,
  onSelectCell,
  onExportCSV,
  onExportPDF,
}) => {
  const [viewMode, setViewMode] = useState<'status' | 'unit'>('status');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  const [yearStr, monthStr] = yearMonth !== 'ALL' ? yearMonth.split('-') : ['2026', '8'];
  const y = parseInt(yearStr, 10) || 2026;
  const m = parseInt(monthStr, 10) || 8;

  const toggleUnit = (unitName: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitName]: !prev[unitName],
    }));
  };

  const expandAllUnits = () => {
    const all: Record<string, boolean> = {};
    unitMatrix.forEach((u) => {
      all[u.unit] = true;
    });
    setExpandedUnits(all);
  };

  const collapseAllUnits = () => {
    setExpandedUnits({});
  };

  // Day of week info for styling (highlight Sunday/Saturday)
  const getDayInfo = (day: number) => {
    const d = new Date(y, m - 1, day);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    const shortName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][dayOfWeek];
    return { shortName, isWeekend, isSunday };
  };

  // Heatmap background styling
  const getCellBgStyle = (count: number, statusType?: TargetStatus | 'TOTAL') => {
    if (!count || count === 0) {
      return 'text-slate-300 bg-transparent';
    }

    if (statusType === 'COMP') {
      if (count > 50) return 'bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-2xs';
      if (count > 20) return 'bg-emerald-500 text-white font-bold hover:bg-emerald-600';
      if (count > 5) return 'bg-emerald-100 text-emerald-900 font-semibold hover:bg-emerald-200 border border-emerald-200';
      return 'bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 border border-emerald-200';
    }

    if (statusType === 'WFOLLOWUP') {
      if (count > 20) return 'bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-2xs';
      if (count > 10) return 'bg-amber-400 text-slate-900 font-bold hover:bg-amber-500';
      if (count > 3) return 'bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200 border border-amber-200';
      return 'bg-amber-50 text-amber-900 font-medium hover:bg-amber-100 border border-amber-200';
    }

    if (statusType === 'WFCOMP') {
      if (count > 20) return 'bg-sky-600 text-white font-bold hover:bg-sky-700 shadow-2xs';
      if (count > 10) return 'bg-sky-500 text-white font-bold hover:bg-sky-600';
      if (count > 3) return 'bg-sky-100 text-sky-900 font-semibold hover:bg-sky-200 border border-sky-200';
      return 'bg-sky-50 text-sky-800 font-medium hover:bg-sky-100 border border-sky-200';
    }

    // Default / Total row
    if (count > 100) return 'bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 shadow-2xs';
    if (count > 40) return 'bg-indigo-500 text-white font-bold hover:bg-indigo-600';
    if (count > 10) return 'bg-indigo-100 text-indigo-900 font-bold hover:bg-indigo-200 border border-indigo-200';
    return 'bg-indigo-50 text-indigo-900 font-semibold hover:bg-indigo-100 border border-indigo-200';
  };

  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Table Top Header Bar */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Tabel Matriks Harian (Tanggal 1 s.d. {daysCount})
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              {yearMonth === 'ALL' ? 'Semua Bulan' : `${INDONESIAN_MONTH_NAMES[m]} ${y}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Klik angka sel mana saja untuk membuka rincian daftar Work Order pada tanggal tersebut.
          </p>
        </div>

        {/* View Mode & Expand Controls */}
        <div className="flex items-center space-x-2">
          
          {/* Mode Switcher */}
          <div className="bg-white p-0.5 rounded-xl border border-slate-200 flex items-center shadow-2xs">
            <button
              onClick={() => setViewMode('status')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                viewMode === 'status'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Per Status</span>
            </button>
            <button
              onClick={() => setViewMode('unit')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                viewMode === 'unit'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Per ULP</span>
            </button>
          </div>

          {viewMode === 'unit' && (
            <div className="flex items-center space-x-1">
              <button
                onClick={expandAllUnits}
                className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-2xs"
              >
                Buka Semua
              </button>
              <button
                onClick={collapseAllUnits}
                className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-2xs"
              >
                Tutup Semua
              </button>
            </div>
          )}

          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
              title="Unduh Tabel Matriks Tanggal 1-31 (PDF Resmi)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-2xs"
            title="Download Matriks CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Table Container */}
      <div className="overflow-x-auto relative max-w-full">
        <table className="w-full text-left text-xs border-collapse font-sans min-w-[1100px]">
          
          {/* Table Header with Days 1..31 */}
          <thead className="bg-slate-50 text-slate-600 sticky top-0 z-20 border-b border-slate-200">
            <tr>
              {/* Sticky Column: Category / Status Title */}
              <th className="sticky left-0 z-30 bg-slate-50 px-4 py-3 font-bold text-slate-700 border-r border-slate-200 min-w-[200px] shadow-xs">
                Status / Unit ULP
              </th>

              {/* Day Headers (1 to 28/30/31) */}
              {daysArray.map((day) => {
                const { shortName, isWeekend, isSunday } = getDayInfo(day);
                return (
                  <th
                    key={day}
                    className={`px-1.5 py-2 text-center border-r border-slate-200 font-mono text-[11px] transition-colors ${
                      isSunday
                        ? 'bg-rose-50 text-rose-700'
                        : isWeekend
                        ? 'bg-amber-50 text-amber-800'
                        : 'text-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{day}</div>
                    <div className={`text-[9px] uppercase font-bold tracking-tighter ${isSunday ? 'text-rose-500' : 'text-slate-400'}`}>
                      {shortName}
                    </div>
                  </th>
                );
              })}

              {/* Total & Avg Columns */}
              <th className="px-3 py-3 text-center bg-slate-50 font-extrabold text-slate-900 border-l border-r border-slate-200 min-w-[75px]">
                Total
              </th>
              <th className="px-2 py-3 text-center bg-slate-50 font-bold text-slate-500 min-w-[65px]">
                Rata/Hr
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 bg-white">
            {viewMode === 'status' ? (
              // Mode 1: Status Grouping (COMP, WFOLLOWUP, WFCOMP, Grand Total)
              statusRows.map((row) => {
                const isTotalRow = row.statusType === 'TOTAL';
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isTotalRow
                        ? 'bg-slate-50 font-bold border-t-2 border-slate-300'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Sticky Status Title Column */}
                    <td className={`sticky left-0 z-10 px-4 py-3 border-r border-slate-200 shadow-xs ${
                      isTotalRow ? 'bg-slate-50' : 'bg-white'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {row.statusType === 'COMP' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        )}
                        {row.statusType === 'WFOLLOWUP' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        )}
                        {row.statusType === 'WFCOMP' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        )}
                        {isTotalRow && (
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                        )}
                        <div>
                          <div className={`font-bold ${
                            row.statusType === 'COMP'
                              ? 'text-emerald-700'
                              : row.statusType === 'WFOLLOWUP'
                              ? 'text-amber-800'
                              : row.statusType === 'WFCOMP'
                              ? 'text-sky-700'
                              : 'text-slate-900 font-extrabold'
                          }`}>
                            {row.title}
                          </div>
                          {row.subTitle && (
                            <div className="text-[10px] text-slate-400 font-normal">{row.subTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Days Cells (1 to 28/30/31) */}
                    {daysArray.map((day) => {
                      const count = row.days[day] || 0;
                      const bgClass = getCellBgStyle(count, row.statusType);
                      const matchingRecords = row.records.filter((r) => r.statusDay === day);

                      return (
                        <td
                          key={day}
                          onClick={() => count > 0 && onSelectCell(`${row.title} (Tgl ${day})`, day, matchingRecords)}
                          className={`px-1 py-2 text-center font-mono border-r border-slate-100 transition-all ${
                            count > 0 ? 'cursor-pointer' : 'cursor-default'
                          }`}
                        >
                          <div className={`py-1 px-0.5 rounded-md transition-all ${bgClass}`}>
                            {count > 0 ? count : <span className="text-slate-300 text-[10px]">-</span>}
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Cell */}
                    <td
                      onClick={() => row.total > 0 && onSelectCell(`${row.title} (Semua Hari)`, 0, row.records)}
                      className={`px-3 py-2 text-center font-mono font-extrabold text-sm border-l border-r border-slate-200 cursor-pointer hover:underline ${
                        row.statusType === 'COMP'
                          ? 'text-emerald-700'
                          : row.statusType === 'WFOLLOWUP'
                          ? 'text-amber-800'
                          : row.statusType === 'WFCOMP'
                          ? 'text-sky-700'
                          : 'text-indigo-700'
                      }`}
                    >
                      {row.total.toLocaleString()}
                    </td>

                    {/* Average Cell */}
                    <td className="px-2 py-2 text-center font-mono text-xs text-slate-500 font-medium">
                      {row.avgDaily.toFixed(1)}
                    </td>
                  </tr>
                );
              })
            ) : (
              // Mode 2: Per ULP / Unit Breakdown Matrix
              unitMatrix.map((unitGroup) => {
                const isExpanded = expandedUnits[unitGroup.unit] ?? true;
                const unitTotalRow = unitGroup.rows.find((r) => r.statusType === 'TOTAL');

                return (
                  <React.Fragment key={unitGroup.unit}>
                    {/* Unit Header Row */}
                    <tr className="bg-slate-50 hover:bg-slate-100 border-t border-slate-200">
                      <td
                        onClick={() => toggleUnit(unitGroup.unit)}
                        className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 border-r border-slate-200 shadow-xs cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <button className="text-slate-500 hover:text-slate-800 p-0.5">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <span className="font-bold text-slate-900 text-xs">
                            {unitGroup.unit}
                          </span>
                        </div>
                      </td>

                      {/* Unit Total per day */}
                      {daysArray.map((day) => {
                        const count = unitTotalRow?.days[day] || 0;
                        const bgClass = getCellBgStyle(count, 'TOTAL');
                        const matching = unitTotalRow?.records.filter((r) => r.statusDay === day) || [];

                        return (
                          <td
                            key={day}
                            onClick={() => count > 0 && onSelectCell(`${unitGroup.unit} - Total (Tgl ${day})`, day, matching)}
                            className={`px-1 py-1.5 text-center font-mono text-xs border-r border-slate-200 ${
                              count > 0 ? 'cursor-pointer font-bold' : ''
                            }`}
                          >
                            <div className={`py-0.5 px-0.5 rounded ${bgClass}`}>
                              {count > 0 ? count : <span className="text-slate-300">-</span>}
                            </div>
                          </td>
                        );
                      })}

                      {/* Unit Total */}
                      <td
                        onClick={() => unitGroup.total > 0 && onSelectCell(`${unitGroup.unit} - Total`, 0, unitTotalRow?.records || [])}
                        className="px-3 py-2 text-center font-mono font-bold text-xs text-slate-900 border-l border-r border-slate-200 cursor-pointer hover:underline"
                      >
                        {unitGroup.total.toLocaleString()}
                      </td>

                      <td className="px-2 py-2 text-center font-mono text-xs text-slate-500">
                        {unitTotalRow?.avgDaily.toFixed(1) || '0.0'}
                      </td>
                    </tr>

                    {/* Sub-rows for COMP, WFOLLOWUP, WFCOMP under this unit */}
                    {isExpanded &&
                      unitGroup.rows
                        .filter((r) => r.statusType !== 'TOTAL')
                        .map((subRow) => (
                          <tr key={subRow.id} className="bg-white hover:bg-slate-50/60">
                            <td className="sticky left-0 z-10 bg-white pl-8 pr-4 py-1.5 border-r border-slate-200 text-xs">
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    subRow.statusType === 'COMP'
                                      ? 'bg-emerald-500'
                                      : subRow.statusType === 'WFOLLOWUP'
                                      ? 'bg-amber-500'
                                      : 'bg-sky-500'
                                  }`}
                                ></span>
                                <span className="text-slate-700 font-medium">
                                  {subRow.statusType}
                                </span>
                              </div>
                            </td>

                            {daysArray.map((day) => {
                              const count = subRow.days[day] || 0;
                              const bgClass = getCellBgStyle(count, subRow.statusType);
                              const matching = subRow.records.filter((r) => r.statusDay === day);

                              return (
                                <td
                                  key={day}
                                  onClick={() => count > 0 && onSelectCell(`${unitGroup.unit} [${subRow.statusType}] (Tgl ${day})`, day, matching)}
                                  className={`px-1 py-1 text-center font-mono text-[11px] border-r border-slate-100 ${
                                    count > 0 ? 'cursor-pointer' : ''
                                  }`}
                                >
                                  <div className={`py-0.5 px-0.5 rounded ${bgClass}`}>
                                    {count > 0 ? count : <span className="text-slate-200">-</span>}
                                  </div>
                                </td>
                              );
                            })}

                            <td
                              onClick={() => subRow.total > 0 && onSelectCell(`${unitGroup.unit} [${subRow.statusType}]`, 0, subRow.records)}
                              className="px-3 py-1 text-center font-mono font-semibold text-xs text-slate-700 border-l border-r border-slate-200 cursor-pointer hover:underline"
                            >
                              {subRow.total}
                            </td>

                            <td className="px-2 py-1 text-center font-mono text-[11px] text-slate-400">
                              {subRow.avgDaily.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>

        </table>
      </div>

      {/* Legend & Help Footer */}
      <div className="bg-slate-50 p-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700">Keterangan:</span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300"></span>
            <span className="font-medium text-emerald-800">COMP (Selesai)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300"></span>
            <span className="font-medium text-amber-800">WFOLLOWUP (Tindak Lanjut)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-100 border border-sky-300"></span>
            <span className="font-medium text-sky-800">WFCOMP (Penyelesaian)</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Intensitas warna menunjukkan volume Work Order per hari</span>
        </div>
      </div>

    </div>
  );
};
