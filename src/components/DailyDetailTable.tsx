import React from 'react';
import { 
  Calendar, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { DailySummary, WorkOrderRecord } from '../types';

interface DailyDetailTableProps {
  dailySummaries: DailySummary[];
  records: WorkOrderRecord[];
  onSelectDay: (dateStr: string, day: number, dayRecords: WorkOrderRecord[]) => void;
}

export const DailyDetailTable: React.FC<DailyDetailTableProps> = ({
  dailySummaries,
  records,
  onSelectDay,
}) => {
  const totalCOMP = dailySummaries.reduce((sum, s) => sum + s.comp, 0);
  const totalWFOLLOWUP = dailySummaries.reduce((sum, s) => sum + s.wfollowup, 0);
  const totalWFCOMP = dailySummaries.reduce((sum, s) => sum + s.wfcomp, 0);
  const grandTotal = dailySummaries.reduce((sum, s) => sum + s.total, 0);
  const overallCompPercentage = grandTotal > 0 ? (totalCOMP / grandTotal) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Tabel Rekap & Analisis Harian
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Komposisi status dan persentase penyelesaian Work Order per hari kerja.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="px-4 py-3">Tanggal / Hari</th>
              <th className="px-3 py-3 text-center text-emerald-700">COMP (Selesai)</th>
              <th className="px-3 py-3 text-center text-amber-800">WFOLLOWUP</th>
              <th className="px-3 py-3 text-center text-sky-700">WFCOMP</th>
              <th className="px-4 py-3 text-center text-slate-900">Total WO</th>
              <th className="px-4 py-3 text-left">Penyelesaian (%)</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {dailySummaries.map((item) => {
              const dayRecords = records.filter((r) => r.statusDay === item.day);
              const isSunday = item.dayName === 'Minggu';
              const isSaturday = item.dayName === 'Sabtu';
              const hasData = item.total > 0;

              return (
                <tr
                  key={item.day}
                  className={`hover:bg-slate-50 transition-colors ${
                    !hasData
                      ? 'opacity-60'
                      : isSunday
                      ? 'bg-rose-50/40'
                      : isSaturday
                      ? 'bg-amber-50/40'
                      : ''
                  }`}
                >
                  <td className="px-4 py-2.5 font-medium text-slate-800">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold ${
                          isSunday
                            ? 'bg-rose-100 text-rose-700'
                            : isSaturday
                            ? 'bg-amber-100 text-amber-800'
                            : hasData
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        {item.day}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900">{item.dateStr}</span>
                        <span className="text-[11px] text-slate-500 ml-1.5 font-normal">
                          ({item.dayName})
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-center font-mono">
                    {item.comp > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {item.comp}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 text-center font-mono">
                    {item.wfollowup > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        {item.wfollowup}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 text-center font-mono">
                    {item.wfcomp > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200">
                        {item.wfcomp}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-center font-mono font-extrabold text-slate-900">
                    {item.total > 0 ? item.total : <span className="text-slate-300 font-normal">0</span>}
                  </td>

                  <td className="px-4 py-2.5 min-w-[170px]">
                    {item.total > 0 ? (
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-emerald-700 font-bold">
                            {item.compPercentage.toFixed(1)}% COMP
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {item.comp} / {item.total} WO
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${item.compPercentage}%` }}
                          ></div>
                          <div
                            className="bg-amber-500 h-full transition-all"
                            style={{ width: `${(item.wfollowup / item.total) * 100}%` }}
                          ></div>
                          <div
                            className="bg-sky-500 h-full transition-all"
                            style={{ width: `${(item.wfcomp / item.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Tidak ada data</span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => hasData && onSelectDay(item.dateStr, item.day, dayRecords)}
                      disabled={!hasData}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        hasData
                          ? 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 cursor-pointer shadow-xs'
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Rincian</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Grand Totals Footer */}
          <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-800">
            <tr>
              <td className="px-4 py-3 font-extrabold text-slate-900">GRAND TOTAL</td>
              <td className="px-3 py-3 text-center font-mono text-emerald-700 font-extrabold text-sm">
                {totalCOMP.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center font-mono text-amber-800 font-extrabold text-sm">
                {totalWFOLLOWUP.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center font-mono text-sky-700 font-extrabold text-sm">
                {totalWFCOMP.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-center font-mono text-indigo-700 font-extrabold text-sm">
                {grandTotal.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span className="text-emerald-700 font-extrabold text-xs">
                  {overallCompPercentage.toFixed(1)}% Rata-rata Selesai
                </span>
              </td>
              <td className="px-3 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
