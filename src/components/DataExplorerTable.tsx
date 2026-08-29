import React, { useState, useMemo } from 'react';
import { 
  WorkOrderRecord, 
  TargetStatus 
} from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface DataExplorerTableProps {
  records: WorkOrderRecord[];
  onSelectRecord: (record: WorkOrderRecord) => void;
  onExportCSV: () => void;
  onExportPDF?: (records: WorkOrderRecord[]) => void;
}

export const DataExplorerTable: React.FC<DataExplorerTableProps> = ({
  records,
  onSelectRecord,
  onExportCSV,
  onExportPDF,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TargetStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<keyof WorkOrderRecord>('statusDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filtered & Searched records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const match =
          r.workOrder.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.unitDescription.toLowerCase().includes(q) ||
          r.descriptionPenyulang.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.workType.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [records, statusFilter, search]);

  // Sorted records
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleSort = (field: keyof WorkOrderRecord) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'COMP') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
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

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Table Header Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Eksplorasi Data Seluruh Work Order
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Menampilkan {filtered.length.toLocaleString()} dari {records.length.toLocaleString()} total baris
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Quick Filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            {(['ALL', 'COMP', 'WFOLLOWUP', 'WFCOMP'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari WO, ULP, Lokasi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-800 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors w-48 sm:w-60"
            />
          </div>

          {/* Export Actions */}
          <div className="flex items-center space-x-1.5">
            {onExportPDF && (
              <button
                onClick={() => onExportPDF(filtered)}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                title={`Export ${filtered.length} Work Order ke PDF`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            )}
            <button
              onClick={onExportCSV}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-2xs"
              title="Download Data CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th 
                onClick={() => handleSort('workOrder')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>No. WO</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-3 py-3">Status</th>
              <th 
                onClick={() => handleSort('statusDate')}
                className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Status Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-4 py-3">Deskripsi Pekerjaan</th>
              <th 
                onClick={() => handleSort('unitDescription')}
                className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>ULP</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-3 py-3">Penyulang</th>
              <th className="px-3 py-3">Jenis WO</th>
              <th className="px-3 py-3">Lokasi</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((wo) => (
              <tr 
                key={wo.id}
                onClick={() => onSelectRecord(wo)}
                className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
              >
                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                  {wo.workOrder}
                </td>
                <td className="px-3 py-2.5">
                  {getStatusBadge(wo.status)}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                  {wo.statusDate || '-'}
                </td>
                <td className="px-4 py-2.5 text-slate-800 max-w-xs truncate" title={wo.description}>
                  {wo.description || '-'}
                </td>
                <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                  {wo.unitDescription || wo.unit || '-'}
                </td>
                <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                  {wo.descriptionPenyulang || '-'}
                </td>
                <td className="px-3 py-2.5 text-slate-600 font-mono text-[11px]">
                  {wo.workType || wo.jenisWo || '-'}
                </td>
                <td className="px-3 py-2.5 text-slate-500 font-mono text-[11px] truncate max-w-[130px]" title={wo.location}>
                  {wo.location || '-'}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecord(wo);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                  Tidak ada Work Order yang sesuai dengan filter atau pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <span>Tampilkan:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
          <span>baris per halaman</span>
        </div>

        <div className="flex items-center space-x-2">
          <span>
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> ({filtered.length} WO)
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
