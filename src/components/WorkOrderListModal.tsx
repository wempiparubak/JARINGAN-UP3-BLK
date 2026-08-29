import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Info
} from 'lucide-react';
import { WorkOrderRecord } from '../types';
import { exportRecordsToCSV } from '../utils/dataParser';
import { exportDetailedRecordsPDF } from '../utils/exportPdf';

interface WorkOrderListModalProps {
  isOpen: boolean;
  title: string;
  records: WorkOrderRecord[];
  onClose: () => void;
}

export const WorkOrderListModal: React.FC<WorkOrderListModalProps> = ({
  isOpen,
  title,
  records,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<WorkOrderRecord | null>(null);

  if (!isOpen) return null;

  const filtered = records.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.workOrder.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term) ||
      r.unitDescription.toLowerCase().includes(term) ||
      r.descriptionPenyulang.toLowerCase().includes(term) ||
      r.location.toLowerCase().includes(term) ||
      r.asset.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    if (status === 'COMP') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <CheckCircle2 className="w-3 h-3" />
          <span>COMP</span>
        </span>
      );
    }
    if (status === 'WFOLLOWUP') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" />
          <span>WFOLLOWUP</span>
        </span>
      );
    }
    if (status === 'WFCOMP') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <AlertCircle className="w-3 h-3" />
          <span>WFCOMP</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {status}
      </span>
    );
  };

  const handleExportCSV = () => {
    exportRecordsToCSV(filtered, `Daftar_WO_${title.replace(/[^a-zA-Z0-9]/g, '_')}`);
  };

  const handleExportPDF = () => {
    exportDetailedRecordsPDF(filtered, title, 'ALL');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filtered.length} dari {records.length} Work Order yang sesuai.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportPDF}
              disabled={filtered.length === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-xs font-bold text-white transition-colors shadow-2xs disabled:opacity-50"
              title="Unduh Daftar Work Order ini dalam format PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors shadow-sm disabled:opacity-50"
              title="Unduh Daftar Work Order ini dalam format CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Search Bar */}
        <div className="p-3 bg-white border-b border-slate-200 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari dalam daftar ini (No. WO, Deskripsi, ULP, Penyulang, Lokasi)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Modal Content: Data Table */}
        <div className="flex-1 overflow-auto p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
              <Info className="w-8 h-8 text-slate-400 mb-2" />
              <span>Tidak ada Work Order yang cocok dengan filter pencarian.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-3 py-2.5">No. WO</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Status Date</th>
                  <th className="px-4 py-2.5">Deskripsi Pekerjaan</th>
                  <th className="px-3 py-2.5">Unit (ULP)</th>
                  <th className="px-3 py-2.5">Penyulang</th>
                  <th className="px-3 py-2.5">Work Type</th>
                  <th className="px-3 py-2.5">Lokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((wo) => (
                  <tr
                    key={wo.id}
                    onClick={() => setSelectedRecord(wo)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2 font-mono font-bold text-slate-900 text-xs">
                      {wo.workOrder}
                    </td>
                    <td className="px-3 py-2">
                      {getStatusBadge(wo.status)}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">
                      {wo.statusDate || '-'}
                    </td>
                    <td className="px-4 py-2 text-slate-800 max-w-xs truncate" title={wo.description}>
                      {wo.description || '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                      {wo.unitDescription || wo.unit || '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                      {wo.descriptionPenyulang || '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-500 font-mono">
                      {wo.workType || '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-500 font-mono text-[11px] truncate max-w-[120px]" title={wo.location}>
                      {wo.location || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Klik baris mana saja untuk melihat detail teknis lengkap</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* Nested Single Work Order Detail Dialog */}
      {selectedRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                WO #{selectedRecord.workOrder}
              </span>
              {getStatusBadge(selectedRecord.status)}
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-4">
              {selectedRecord.description || 'Tanpa Deskripsi'}
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Unit Layanan (ULP)</span>
                <span className="text-slate-800 font-semibold">{selectedRecord.unitDescription || '-'}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Penyulang (Feeder)</span>
                <span className="text-slate-800 font-semibold">{selectedRecord.descriptionPenyulang || '-'}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Date</span>
                <span className="text-indigo-600 font-mono font-bold">{selectedRecord.statusDate || '-'}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Reported Date</span>
                <span className="text-slate-700 font-mono">{selectedRecord.reportedDate || '-'}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Lokasi</span>
                <span className="text-slate-700 font-mono">{selectedRecord.location || '-'}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Asset / Gardu</span>
                <span className="text-slate-700 font-mono">{selectedRecord.asset || '-'}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Work Type / Jenis WO</span>
                <span className="text-slate-700">{selectedRecord.workType || selectedRecord.jenisWo || '-'}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">HI Value</span>
                <span className="text-slate-700">{selectedRecord.hiValue || '-'}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
