import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Upload, 
  RefreshCw, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { DataSourceConfig } from '../types';

interface DataSourceModalProps {
  isOpen: boolean;
  dataSource: DataSourceConfig;
  isLoading: boolean;
  onClose: () => void;
  onUpdateSource: (url: string, gid: string) => void;
  onUploadCSV: (file: File) => void;
  onReloadDefault: () => void;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({
  isOpen,
  dataSource,
  isLoading,
  onClose,
  onUpdateSource,
  onUploadCSV,
  onReloadDefault,
}) => {
  const [inputUrl, setInputUrl] = useState(dataSource.url);
  const [inputGid, setInputGid] = useState(dataSource.gid);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadCSV(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCSV(e.target.files[0]);
    }
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSource(inputUrl, inputGid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sumber Data Google Sheets</h3>
              <p className="text-xs text-slate-500">Sinkronisasi & Konfigurasi Lembar Kerja</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Active Sheet Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                Sheet: WO T&D
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Live Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-500 break-all font-mono">
              ID: 1cQsWKZcQPtNPUCKEUIZDP2w7hatq0r6gWLvZ7gAv_ws
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              GID: 1986723754
            </p>
            {dataSource.lastUpdated && (
              <p className="text-[10px] text-slate-400">
                Terakhir disinkronkan: {dataSource.lastUpdated}
              </p>
            )}
          </div>

          {/* Drag and Drop Local CSV */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800">
              Unggah File CSV / Excel Terbaru
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tarik dan lepaskan file CSV di sini, atau klik untuk memilih
            </p>
            <label className="mt-3 inline-block">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 cursor-pointer inline-block transition-colors shadow-sm">
                Pilih File CSV
              </span>
            </label>
          </div>

          {/* Reset to Default Live Sheet */}
          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              onClick={onReloadDefault}
              disabled={isLoading}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang Default Google Sheet</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
