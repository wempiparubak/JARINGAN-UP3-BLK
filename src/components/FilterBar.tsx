import React from 'react';
import { 
  Calendar, 
  Search, 
  RotateCcw, 
  Check, 
  ChevronDown,
  Filter
} from 'lucide-react';
import { FilterState, TargetStatus } from '../types';
import { formatMonthYear } from '../utils/dataParser';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableMonths: string[];
  availableUnits: string[];
  availablePenyulangs: string[];
  availableWorkTypes: string[];
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableMonths,
  availableUnits,
  availablePenyulangs,
  availableWorkTypes,
  onReset,
}) => {
  const toggleStatus = (status: TargetStatus) => {
    let nextStatuses: string[];
    if (filters.statuses.includes(status)) {
      if (filters.statuses.length === 1) {
        // Keep at least one status
        return;
      }
      nextStatuses = filters.statuses.filter((s) => s !== status);
    } else {
      nextStatuses = [...filters.statuses, status];
    }
    onFilterChange({ ...filters, statuses: nextStatuses });
  };

  const isFiltered = 
    filters.monthYear !== '2026-08' || 
    filters.statuses.length !== 3 || 
    filters.unit !== 'ALL' || 
    filters.penyulang !== 'ALL' || 
    filters.workType !== 'ALL' || 
    Boolean(filters.search);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col gap-3.5">
        
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Month Selector Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 mr-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Periode Bulan:</span>
            </div>
            {availableMonths.map((ym) => {
              const isSelected = filters.monthYear === ym;
              return (
                <button
                  key={ym}
                  onClick={() => onFilterChange({ ...filters, monthYear: ym })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {formatMonthYear(ym)}
                </button>
              );
            })}
            <button
              onClick={() => onFilterChange({ ...filters, monthYear: 'ALL' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filters.monthYear === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Bulan
            </button>
          </div>

          {/* Target Status Filter Toggles (COMP, WFOLLOWUP, WFCOMP) */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">
              Filter Status:
            </span>

            {/* COMP Toggle */}
            <button
              onClick={() => toggleStatus('COMP')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                filters.statuses.includes('COMP')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filters.statuses.includes('COMP') ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              <span>COMP</span>
              {filters.statuses.includes('COMP') && <Check className="w-3 h-3 text-emerald-700" />}
            </button>

            {/* WFOLLOWUP Toggle */}
            <button
              onClick={() => toggleStatus('WFOLLOWUP')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                filters.statuses.includes('WFOLLOWUP')
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filters.statuses.includes('WFOLLOWUP') ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
              <span>WFOLLOWUP</span>
              {filters.statuses.includes('WFOLLOWUP') && <Check className="w-3 h-3 text-amber-700" />}
            </button>

            {/* WFCOMP Toggle */}
            <button
              onClick={() => toggleStatus('WFCOMP')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                filters.statuses.includes('WFCOMP')
                  ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-2xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filters.statuses.includes('WFCOMP') ? 'bg-sky-500' : 'bg-slate-400'}`}></span>
              <span>WFCOMP</span>
              {filters.statuses.includes('WFCOMP') && <Check className="w-3 h-3 text-sky-700" />}
            </button>
          </div>

        </div>

        {/* Secondary Filter Dropdowns and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          
          {/* ULP Selector */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Unit Layanan Pelanggan (ULP):
            </label>
            <div className="relative">
              <select
                value={filters.unit}
                onChange={(e) => onFilterChange({ ...filters, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              >
                <option value="ALL">Semua ULP ({availableUnits.length} Unit)</option>
                {availableUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Penyulang (Feeder) Selector */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Penyulang (Feeder):
            </label>
            <div className="relative">
              <select
                value={filters.penyulang}
                onChange={(e) => onFilterChange({ ...filters, penyulang: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              >
                <option value="ALL">Semua Penyulang ({availablePenyulangs.length})</option>
                {availablePenyulangs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Pencarian WO:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="No. WO, Lokasi, Deskripsi..."
                value={filters.search}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-slate-400"
              />
              {filters.search && (
                <button
                  onClick={() => onFilterChange({ ...filters, search: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Reset Filters & Action */}
          <div className="flex items-end">
            <button
              onClick={onReset}
              disabled={!isFiltered}
              className={`w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                isFiltered
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 shadow-xs cursor-pointer'
                  : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
