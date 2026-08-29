import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  TrendingUp, 
  CalendarDays,
} from 'lucide-react';
import { KPISummary } from '../types';

interface KPICardsProps {
  kpi: KPISummary;
  selectedMonthLabel: string;
  onSelectStatusFilter?: (status: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  kpi,
  selectedMonthLabel,
  onSelectStatusFilter,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
      
      {/* Total Work Orders */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total WO</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {kpi.totalRecords.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {selectedMonthLabel}
          </div>
        </div>
      </div>

      {/* COMP (Completed) */}
      <div 
        onClick={() => onSelectStatusFilter && onSelectStatusFilter('COMP')}
        className="bg-white border border-emerald-200 hover:border-emerald-400 rounded-2xl p-4 shadow-xs transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            COMP
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">
            {kpi.compCount.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="text-slate-500 font-medium">Selesai</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              {kpi.compPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* WFOLLOWUP (Waiting Follow Up) */}
      <div 
        onClick={() => onSelectStatusFilter && onSelectStatusFilter('WFOLLOWUP')}
        className="bg-white border border-amber-200 hover:border-amber-400 rounded-2xl p-4 shadow-xs transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            WFOLLOWUP
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-amber-600 tracking-tight">
            {kpi.wfollowupCount.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="text-slate-500 font-medium">Tindak Lanjut</span>
            <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
              {kpi.wfollowupPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* WFCOMP (Waiting Completion) */}
      <div 
        onClick={() => onSelectStatusFilter && onSelectStatusFilter('WFCOMP')}
        className="bg-white border border-sky-200 hover:border-sky-400 rounded-2xl p-4 shadow-xs transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            WFCOMP
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:bg-sky-100 transition-colors">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-sky-600 tracking-tight">
            {kpi.wfcompCount.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="text-slate-500 font-medium">Penyelesaian</span>
            <span className="font-bold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
              {kpi.wfcompPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Peak Activity Day */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hari Teraktif</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-purple-700 tracking-tight">
            {kpi.peakDay ? `${kpi.peakDay.count} WO` : '0 WO'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {kpi.peakDay ? kpi.peakDay.dateStr : '-'}
          </div>
        </div>
      </div>

      {/* Daily Average */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-Rata/Hari</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-rose-600 tracking-tight">
            {kpi.dailyAverage.toFixed(1)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            dari {kpi.totalDaysWithData} hari aktif
          </div>
        </div>
      </div>

    </div>
  );
};
