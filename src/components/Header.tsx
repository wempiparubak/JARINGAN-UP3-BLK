import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  ExternalLink, 
  FileSpreadsheet, 
  Calendar, 
  Settings, 
  Download, 
  Zap,
  CheckCircle2,
  BarChart3,
  Layers,
  FileText,
  ChevronDown
} from 'lucide-react';
import { DataSourceConfig } from '../types';

interface HeaderProps {
  dataSource: DataSourceConfig;
  isLoading: boolean;
  totalFiltered: number;
  totalAll: number;
  onRefresh: () => void;
  onOpenSourceModal: () => void;
  onExportMatrixPDF: () => void;
  onExportDetailedPDF: () => void;
  onExportMatrixCSV: () => void;
  onExportRecordsCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dataSource,
  isLoading,
  totalFiltered,
  totalAll,
  onRefresh,
  onOpenSourceModal,
  onExportMatrixPDF,
  onExportDetailedPDF,
  onExportMatrixCSV,
  onExportRecordsCSV,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 p-0.5 shadow-md shadow-indigo-100 shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-600 fill-indigo-50" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                  DASHBOARD MONITORING WO T&D
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                    UP3 Bulukumba
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>Monitoring Harian Status Date:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">COMP</span>
                <span>•</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">WFOLLOWUP</span>
                <span>•</span>
                <span className="font-bold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">WFCOMP</span>
              </p>
            </div>
          </div>

          {/* Action Tools & Sheet Connection */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sheet Link Badge */}
            <a
              href="https://docs.google.com/spreadsheets/d/1cQsWKZcQPtNPUCKEUIZDP2w7hatq0r6gWLvZ7gAv_ws/edit?pli=1&gid=1986723754#gid=1986723754"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors shadow-xs"
              title="Buka Google Spreadsheet Sumber"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span className="truncate max-w-[130px] sm:max-w-none">Sheet: WO T&D</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-xs font-bold text-white transition-all shadow-sm shadow-indigo-100 disabled:opacity-50"
              title="Perbarui Data dari Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Memuat...' : 'Sync Live'}</span>
            </button>

            {/* Direct Export PDF Button */}
            <button
              onClick={onExportMatrixPDF}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-xs font-bold text-white transition-all shadow-sm shadow-rose-100"
              title="Unduh Laporan PDF Matriks Bulanan Resmi UP3 Bulukumba"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            {/* Export Dropdown (PDF & CSV options) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors shadow-xs"
                title="Pilihan Unduh PDF & CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Data</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 text-xs">
                  <div className="px-2.5 py-1.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    Format Dokumen PDF
                  </div>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportMatrixPDF();
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-rose-50 rounded-lg flex items-start space-x-2 text-slate-700 hover:text-rose-900 group"
                  >
                    <FileText className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-rose-900">Laporan Matriks Harian (PDF)</p>
                      <p className="text-[11px] text-slate-500">Tabel tanggal 1–31 resmi dengan tanda tangan</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportDetailedPDF();
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-rose-50 rounded-lg flex items-start space-x-2 text-slate-700 hover:text-rose-900 group"
                  >
                    <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-rose-900">Rekap Detail WO (PDF)</p>
                      <p className="text-[11px] text-slate-500">Daftar lengkap Work Order terfilter</p>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>

                  <div className="px-2.5 py-1.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    Format Data CSV / Excel
                  </div>

                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportMatrixCSV();
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-emerald-50 rounded-lg flex items-start space-x-2 text-slate-700 hover:text-emerald-900 group"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-emerald-900">Matriks Harian (CSV)</p>
                      <p className="text-[11px] text-slate-500">Tabel 1–31 untuk diolah di Excel</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportRecordsCSV();
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-emerald-50 rounded-lg flex items-start space-x-2 text-slate-700 hover:text-emerald-900 group"
                  >
                    <Download className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-emerald-900">Semua Baris WO (CSV)</p>
                      <p className="text-[11px] text-slate-500">Data mentah Work Order lengkap</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Settings / Source Modal */}
            <button
              onClick={onOpenSourceModal}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors shadow-xs"
              title="Konfigurasi Sumber Data / Upload CSV"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Subheader Status Info */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status: Live Connected</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Total Terdata: <strong className="text-slate-900">{totalFiltered.toLocaleString()}</strong> dari {totalAll.toLocaleString()} baris
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            {dataSource.lastUpdated && (
              <span>Pembaruan terakhir: {dataSource.lastUpdated}</span>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
