import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  DailySummary, 
  KPISummary, 
  MatrixRow, 
  WorkOrderRecord, 
  TargetStatus 
} from '../types';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Zap, 
  ArrowUpRight, 
  Calendar, 
  Layers, 
  Filter, 
  ChevronRight, 
  ShieldAlert,
  Flame,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

interface ExecutiveDashboardProps {
  kpi: KPISummary;
  dailySummaries: DailySummary[];
  statusRows: MatrixRow[];
  unitData: { unit: string; total: number; comp: number; wfollowup: number; wfcomp: number }[];
  allFilteredRecords: WorkOrderRecord[];
  daysCount: number;
  selectedMonthLabel: string;
  onSelectStatus: (status: TargetStatus) => void;
  onSelectUnit: (unit: string) => void;
  onOpenCell: (title: string, day: number, records: WorkOrderRecord[]) => void;
  onNavigateTab: (tab: 'matrix' | 'daily' | 'explorer') => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  kpi,
  dailySummaries,
  statusRows,
  unitData,
  allFilteredRecords,
  daysCount,
  selectedMonthLabel,
  onSelectStatus,
  onSelectUnit,
  onOpenCell,
  onNavigateTab,
}) => {
  // Top Feeders / Penyulang with most work orders
  const topPenyulangs = useMemo(() => {
    const map = new Map<string, { name: string; total: number; comp: number; pending: number }>();
    allFilteredRecords.forEach((r) => {
      const p = r.descriptionPenyulang || 'Tanpa Penyulang';
      if (!map.has(p)) {
        map.set(p, { name: p, total: 0, comp: 0, pending: 0 });
      }
      const item = map.get(p)!;
      item.total++;
      if (r.status === 'COMP') item.comp++;
      else item.pending++;
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [allFilteredRecords]);

  // Urgent pending follow-up queue (WFOLLOWUP and WFCOMP)
  const pendingRecords = useMemo(() => {
    return allFilteredRecords
      .filter((r) => r.status === 'WFOLLOWUP' || r.status === 'WFCOMP')
      .slice(0, 6);
  }, [allFilteredRecords]);

  // Work Types distribution
  const workTypeData = useMemo(() => {
    const map = new Map<string, number>();
    allFilteredRecords.forEach((r) => {
      const wt = r.workType || r.jenisWo || 'Lainnya';
      map.set(wt, (map.get(wt) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [allFilteredRecords]);

  const COLORS = {
    COMP: '#10b981', // emerald-500
    WFOLLOWUP: '#f59e0b', // amber-500
    WFCOMP: '#0284c7', // sky-600
  };

  const pieData = [
    { name: 'COMP (Selesai)', value: kpi.compCount, color: COLORS.COMP },
    { name: 'WFOLLOWUP (Tindak Lanjut)', value: kpi.wfollowupCount, color: COLORS.WFOLLOWUP },
    { name: 'WFCOMP (Menunggu Penyelesaian)', value: kpi.wfcompCount, color: COLORS.WFCOMP },
  ].filter((d) => d.value > 0);

  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      
      {/* 1. Top Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total WO Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Work Order
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpi.totalRecords.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Periode: {selectedMonthLabel}</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                1 - {daysCount} Hari
              </span>
            </div>
          </div>
        </div>

        {/* COMP Status Card */}
        <div 
          onClick={() => onSelectStatus('COMP')}
          className="bg-white border border-emerald-200/80 hover:border-emerald-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                COMP (Selesai)
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                {kpi.compCount.toLocaleString()}
              </div>
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {kpi.compPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${kpi.compPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* WFOLLOWUP Status Card */}
        <div 
          onClick={() => onSelectStatus('WFOLLOWUP')}
          className="bg-white border border-amber-200/80 hover:border-amber-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                WFOLLOWUP (Tindak Lanjut)
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
                {kpi.wfollowupCount.toLocaleString()}
              </div>
              <span className="text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {kpi.wfollowupPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${kpi.wfollowupPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* WFCOMP Status Card */}
        <div 
          onClick={() => onSelectStatus('WFCOMP')}
          className="bg-white border border-sky-200/80 hover:border-sky-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                WFCOMP (Menunggu Selesai)
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:bg-sky-100 transition-colors">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-extrabold text-sky-600 tracking-tight">
                {kpi.wfcompCount.toLocaleString()}
              </div>
              <span className="text-sm font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                {kpi.wfcompPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${kpi.wfcompPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Charts & Analytics Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Progression Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Tren Harian Work Order (Tanggal 1 - {daysCount})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aktivitas penyelesaian dan penumpukan WO harian berdasarkan Status Date
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onNavigateTab('matrix')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors flex items-center space-x-1"
              >
                <span>Buka Matriks Penuh</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySummaries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}`}
                />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [`${val} WO`, name]}
                  labelFormatter={(label) => `Tanggal ${label} ${selectedMonthLabel}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="comp" name="COMP (Selesai)" stackId="a" fill={COLORS.COMP} radius={[0, 0, 0, 0]} />
                <Bar dataKey="wfollowup" name="WFOLLOWUP (Tindak Lanjut)" stackId="a" fill={COLORS.WFOLLOWUP} />
                <Bar dataKey="wfcomp" name="WFCOMP (Menunggu)" stackId="a" fill={COLORS.WFCOMP} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Komposisi Status
              </h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {kpi.totalRecords} Total
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Rasio efektivitas penyelesaian WO
            </p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} WO`, 'Jumlah']} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">COMP RATE</span>
              <span className="text-xl font-extrabold text-emerald-600">{kpi.compPercentage.toFixed(1)}%</span>
            </div>
          </div>

          {/* Legend list */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {item.value.toLocaleString()} ({((item.value / kpi.totalRecords) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. ULP Leaderboard & Quick Heatmap Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ULP Performance Ranking Leaderboard (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Peringkat Kinerja Unit Layanan Pelanggan (ULP)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring volume dan rasio penyelesaian tiap unit kerja
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {unitData.length} Unit Terdaftar
            </span>
          </div>

          <div className="space-y-3">
            {unitData.map((u, idx) => {
              const compPct = u.total > 0 ? (u.comp / u.total) * 100 : 0;
              const pendingCount = u.wfollowup + u.wfcomp;

              return (
                <div 
                  key={u.unit}
                  onClick={() => onSelectUnit(u.unit)}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/70 hover:border-indigo-200 rounded-xl transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {u.unit}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span>Total: <strong className="text-slate-800">{u.total.toLocaleString()} WO</strong></span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">COMP: {u.comp}</span>
                        <span>•</span>
                        <span className="text-amber-700 font-medium">Pending: {pendingCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 min-w-[200px] justify-end">
                    <div className="text-right flex-1">
                      <div className="text-xs font-bold text-slate-800">
                        {compPct.toFixed(1)}% COMP
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${compPct}%` }}
                        ></div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Penyulang / Feeder Activity Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Penyulang Teraktif
              </h3>
              <span className="text-xs font-semibold text-slate-500">Top 8</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Penyulang dengan volume WO tertinggi
            </p>

            <div className="space-y-2.5">
              {topPenyulangs.map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center space-x-2 truncate max-w-[170px]">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">#{idx + 1}</span>
                    <span className="font-semibold text-slate-800 truncate" title={p.name}>
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-100">
                      {p.comp} COMP
                    </span>
                    <span className="font-mono font-bold text-slate-700 text-xs">
                      {p.total} WO
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center space-x-1 w-full"
            >
              <span>Eksplorasi Semua Work Order</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Mini Heatmap Quick Matrix Widget */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Matriks Kilat Harian (Tanggal 1 s.d. {daysCount})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada kotak tanggal untuk melihat seluruh Work Order yang diselesaikan/diproses pada hari tersebut
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('matrix')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <span>Tabel Matriks Penuh</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Day Grid 1..31 */}
        <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-11 lg:grid-cols-16 gap-2">
          {daysArray.map((day) => {
            const daySummary = dailySummaries.find((s) => s.day === day);
            const total = daySummary?.total || 0;
            const comp = daySummary?.comp || 0;
            const isPeak = kpi.peakDay?.day === day && total > 0;
            const dayRecords = allFilteredRecords.filter((r) => r.statusDay === day);

            let bgClass = 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100';
            if (total > 0) {
              if (comp === total) {
                bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100';
              } else if (total > 20) {
                bgClass = 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100';
              } else {
                bgClass = 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100';
              }
            }

            return (
              <button
                key={day}
                onClick={() => total > 0 && onOpenCell(`Work Order Tanggal ${day} ${selectedMonthLabel}`, day, dayRecords)}
                disabled={total === 0}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between relative group ${bgClass} ${
                  total > 0 ? 'cursor-pointer shadow-2xs hover:scale-105' : 'cursor-default opacity-60'
                } ${isPeak ? 'ring-2 ring-amber-400' : ''}`}
                title={total > 0 ? `Tgl ${day}: ${total} WO (${comp} COMP)` : `Tgl ${day}: Tidak ada data`}
              >
                {isPeak && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></span>
                )}
                <span className="text-[11px] font-bold text-slate-500 block">Tgl {day}</span>
                <span className="text-sm font-extrabold font-mono my-0.5 block">
                  {total > 0 ? total : '-'}
                </span>
                <span className="text-[10px] font-medium block">
                  {total > 0 ? `${comp} COMP` : 'Kosong'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Urgent Pending Attention Queue */}
      {pendingRecords.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">
                Antrean Perlu Tindak Lanjut (WFOLLOWUP & WFCOMP)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
            >
              Lihat Semua ({kpi.wfollowupCount + kpi.wfcompCount} WO)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingRecords.map((wo) => (
              <div 
                key={wo.id}
                onClick={() => onOpenCell(`Detail WO #${wo.workOrder}`, wo.statusDay || 0, [wo])}
                className="p-3.5 bg-slate-50 hover:bg-amber-50/40 border border-slate-200 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold font-mono text-slate-900">
                    WO #{wo.workOrder}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    wo.status === 'WFOLLOWUP'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-sky-50 text-sky-800 border-sky-200'
                  }`}>
                    {wo.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 line-clamp-2 mb-2 group-hover:text-indigo-900">
                  {wo.description || 'Tanpa Deskripsi'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="truncate max-w-[140px] font-medium">{wo.unitDescription || wo.unit}</span>
                  <span className="font-mono text-indigo-600 font-semibold">{wo.statusDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
