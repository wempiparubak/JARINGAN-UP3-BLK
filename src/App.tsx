import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  KPICards 
} from './components/KPICards';
import { 
  FilterBar 
} from './components/FilterBar';
import { 
  ExecutiveDashboard 
} from './components/ExecutiveDashboard';
import { 
  MatrixDailyTable 
} from './components/MatrixDailyTable';
import { 
  DailyDetailTable 
} from './components/DailyDetailTable';
import { 
  ChartsView 
} from './components/ChartsView';
import { 
  DataExplorerTable 
} from './components/DataExplorerTable';
import { 
  WorkOrderListModal 
} from './components/WorkOrderListModal';
import { 
  DataSourceModal 
} from './components/DataSourceModal';

import { 
  WorkOrderRecord, 
  FilterState, 
  DataSourceConfig,
  TargetStatus
} from './types';
import { 
  parseCSVData, 
  DEFAULT_SPREADSHEET_ID, 
  DEFAULT_GID, 
  DEFAULT_SHEET_NAME, 
  DEFAULT_CSV_URL,
  getDaysInMonth, 
  formatMonthYear, 
  calculateKPISummary, 
  buildStatusMatrix, 
  buildUnitMatrix, 
  buildDailySummaryList, 
  exportMatrixToCSV,
  exportRecordsToCSV 
} from './utils/dataParser';
import { 
  exportMatrixPDF, 
  exportDetailedRecordsPDF 
} from './utils/exportPdf';
import { INITIAL_REAL_RECORDS } from './utils/embeddedData';
import { 
  LayoutDashboard,
  Calendar, 
  ListChecks, 
  BarChart3, 
  FileSpreadsheet,
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Initialize with real 3,470 Work Order records so dashboard is instantly visible when shared
  const [allRecords, setAllRecords] = useState<WorkOrderRecord[]>(() => INITIAL_REAL_RECORDS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [dataSource, setDataSource] = useState<DataSourceConfig>({
    url: DEFAULT_CSV_URL,
    sheetName: DEFAULT_SHEET_NAME,
    gid: DEFAULT_GID,
    lastUpdated: 'Data Sinkron CSV (Live)',
    isCustomUpload: false,
  });

  const [filters, setFilters] = useState<FilterState>({
    monthYear: '2026-08', // Default to August 2026
    statuses: ['COMP', 'WFOLLOWUP', 'WFCOMP'], // The 3 required statuses
    unit: 'ALL',
    penyulang: 'ALL',
    workType: 'ALL',
    search: '',
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'matrix' | 'daily' | 'charts' | 'explorer'>('dashboard');

  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    records: WorkOrderRecord[];
  }>({
    isOpen: false,
    title: '',
    records: [],
  });

  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  // Fetch Google Sheets CSV Data with multi-tier resilient fallback
  const loadSheetData = async (forceFresh = false) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let csvText = '';

      // Source 1: Server proxy endpoint
      try {
        const res = await fetch(`/api/sheet-data?fresh=${forceFresh}`);
        if (res.ok) {
          const text = await res.text();
          if (text && text.includes('Work Order')) {
            csvText = text;
          }
        }
      } catch (err) {
        console.warn('Server proxy not reached, attempting direct CSV fetch...', err);
      }

      // Source 2: Direct Google Sheet GViz CSV (has standard CORS support)
      if (!csvText) {
        try {
          const gvizUrl = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${DEFAULT_GID}`;
          const res = await fetch(gvizUrl);
          if (res.ok) {
            const text = await res.text();
            if (text && text.includes('Work Order')) {
              csvText = text;
            }
          }
        } catch (gvizErr) {
          console.warn('Direct GViz fetch error:', gvizErr);
        }
      }

      // Source 3: Direct Google Sheet CSV Export URL
      if (!csvText) {
        try {
          const directRes = await fetch(dataSource.url);
          if (directRes.ok) {
            const text = await directRes.text();
            if (text && text.includes('Work Order')) {
              csvText = text;
            }
          }
        } catch (directErr) {
          console.warn('Direct Google Sheets export fetch error:', directErr);
        }
      }

      // Source 4: Bundled static CSV
      if (!csvText) {
        try {
          const localRes = await fetch('/wo_data.csv');
          if (localRes.ok) {
            const text = await localRes.text();
            if (text && text.includes('Work Order')) {
              csvText = text;
            }
          }
        } catch (localErr) {
          console.warn('Local static CSV fetch error:', localErr);
        }
      }

      // Source 5: Public CORS Proxy for Google Sheets CSV
      if (!csvText) {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
            `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/export?format=csv&gid=${DEFAULT_GID}`
          )}`;
          const proxyRes = await fetch(proxyUrl);
          if (proxyRes.ok) {
            const text = await proxyRes.text();
            if (text && text.includes('Work Order')) {
              csvText = text;
            }
          }
        } catch (proxyErr) {
          console.warn('CORS proxy fetch error:', proxyErr);
        }
      }

      if (csvText && csvText.trim().length > 0) {
        const parsed = parseCSVData(csvText);
        if (parsed.length > 0) {
          setAllRecords(parsed);
          const now = new Date();
          const timeStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} (Live CSV)`;
          setDataSource((prev) => ({ ...prev, lastUpdated: timeStr }));
        }
      } else {
        const now = new Date();
        const timeStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} (Lokal CSV)`;
        setDataSource((prev) => ({ ...prev, lastUpdated: timeStr }));
      }
    } catch (err: any) {
      console.error('Data load error:', err);
      // Keep existing records so the UI remains 100% visible and functional
      setErrorMsg(err?.message || 'Gagal sinkronisasi data CSV langsung. Menampilkan data tersimpan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSheetData();
  }, []);

  // Compute available months, units, feeders, work types from dataset
  const { availableMonths, availableUnits, availablePenyulangs, availableWorkTypes } = useMemo(() => {
    const monthsSet = new Set<string>();
    const unitsSet = new Set<string>();
    const penyulangsSet = new Set<string>();
    const workTypesSet = new Set<string>();

    allRecords.forEach((r) => {
      if (['COMP', 'WFOLLOWUP', 'WFCOMP'].includes(r.status)) {
        if (r.statusYearMonth) monthsSet.add(r.statusYearMonth);
        if (r.unitDescription) unitsSet.add(r.unitDescription);
        if (r.descriptionPenyulang) penyulangsSet.add(r.descriptionPenyulang);
        if (r.workType) workTypesSet.add(r.workType);
      }
    });

    const sortedMonths = Array.from(monthsSet).sort().reverse();
    const sortedUnits = Array.from(unitsSet).sort();
    const sortedPenyulangs = Array.from(penyulangsSet).sort();
    const sortedWorkTypes = Array.from(workTypesSet).sort();

    return {
      availableMonths: sortedMonths,
      availableUnits: sortedUnits,
      availablePenyulangs: sortedPenyulangs,
      availableWorkTypes: sortedWorkTypes,
    };
  }, [allRecords]);

  // If initial month is not in data, default to first available month
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(filters.monthYear) && filters.monthYear !== 'ALL') {
      setFilters((prev) => ({ ...prev, monthYear: availableMonths[0] }));
    }
  }, [availableMonths]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      // 1. Status Filter: must be one of user selected statuses (COMP, WFOLLOWUP, WFCOMP)
      if (!filters.statuses.includes(r.status)) {
        return false;
      }

      // 2. Month Filter
      if (filters.monthYear !== 'ALL') {
        if (r.statusYearMonth !== filters.monthYear) {
          return false;
        }
      }

      // 3. Unit / ULP Filter
      if (filters.unit !== 'ALL') {
        if (r.unitDescription !== filters.unit && r.unit !== filters.unit) {
          return false;
        }
      }

      // 4. Penyulang (Feeder) Filter
      if (filters.penyulang !== 'ALL') {
        if (r.descriptionPenyulang !== filters.penyulang) {
          return false;
        }
      }

      // 5. Work Type Filter
      if (filters.workType !== 'ALL') {
        if (r.workType !== filters.workType) {
          return false;
        }
      }

      // 6. Search query
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matches =
          r.workOrder.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.location.toLowerCase().includes(query) ||
          r.asset.toLowerCase().includes(query) ||
          r.unitDescription.toLowerCase().includes(query) ||
          r.descriptionPenyulang.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [allRecords, filters]);

  // Days in selected period
  const daysCount = useMemo(() => {
    return getDaysInMonth(filters.monthYear);
  }, [filters.monthYear]);

  // KPI Calculations
  const kpi = useMemo(() => {
    return calculateKPISummary(filteredRecords, daysCount, filters.monthYear);
  }, [filteredRecords, daysCount, filters.monthYear]);

  // Matrix per Status
  const statusMatrix = useMemo(() => {
    return buildStatusMatrix(filteredRecords, daysCount, filters.statuses);
  }, [filteredRecords, daysCount, filters.statuses]);

  // Matrix per Unit / ULP
  const unitMatrix = useMemo(() => {
    return buildUnitMatrix(filteredRecords, daysCount, filters.statuses);
  }, [filteredRecords, daysCount, filters.statuses]);

  // Daily Summary List
  const dailySummaries = useMemo(() => {
    return buildDailySummaryList(filteredRecords, daysCount, filters.monthYear);
  }, [filteredRecords, daysCount, filters.monthYear]);

  // Unit chart dataset
  const unitChartData = useMemo(() => {
    const map = new Map<string, { unit: string; total: number; comp: number; wfollowup: number; wfcomp: number }>();
    filteredRecords.forEach((r) => {
      const u = r.unitDescription || r.unit || 'Lainnya';
      if (!map.has(u)) {
        map.set(u, { unit: u, total: 0, comp: 0, wfollowup: 0, wfcomp: 0 });
      }
      const item = map.get(u)!;
      item.total++;
      if (r.status === 'COMP') item.comp++;
      else if (r.status === 'WFOLLOWUP') item.wfollowup++;
      else if (r.status === 'WFCOMP') item.wfcomp++;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredRecords]);

  // Handlers
  const handleOpenCell = (title: string, day: number, records: WorkOrderRecord[]) => {
    setModalState({
      isOpen: true,
      title,
      records,
    });
  };

  const handleExportMatrixCSV = () => {
    const monthLabel = formatMonthYear(filters.monthYear);
    exportMatrixToCSV(statusMatrix, daysCount, monthLabel);
  };

  const handleExportRecordsCSV = (customRecords?: WorkOrderRecord[]) => {
    const recs = customRecords || filteredRecords;
    const monthLabel = formatMonthYear(filters.monthYear);
    exportRecordsToCSV(recs, `Rekap_WO_TD_${monthLabel.replace(/\s+/g, '_')}_${recs.length}WO`);
  };

  const handleExportMatrixPDF = () => {
    const monthLabel = formatMonthYear(filters.monthYear);
    exportMatrixPDF({
      monthLabel,
      daysCount,
      statusMatrix,
      unitMatrix,
      kpi,
      filteredRecords,
      unitFilter: filters.unit,
      penyulangFilter: filters.penyulang,
    });
  };

  const handleExportDetailedPDF = (customRecords?: WorkOrderRecord[]) => {
    const recs = customRecords || filteredRecords;
    const monthLabel = formatMonthYear(filters.monthYear);
    exportDetailedRecordsPDF(recs, monthLabel, filters.unit);
  };

  const handleResetFilters = () => {
    setFilters({
      monthYear: availableMonths[0] || '2026-08',
      statuses: ['COMP', 'WFOLLOWUP', 'WFCOMP'],
      unit: 'ALL',
      penyulang: 'ALL',
      workType: 'ALL',
      search: '',
    });
  };

  const handleUploadCSV = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSVData(text);
        if (parsed.length === 0) {
          throw new Error('File CSV tidak memiliki data Work Order yang valid.');
        }
        setAllRecords(parsed);
        setDataSource((prev) => ({
          ...prev,
          lastUpdated: `File lokal: ${file.name}`,
          isCustomUpload: true,
        }));
        setIsSourceModalOpen(false);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Gagal memproses file CSV.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* App Header */}
      <Header
        dataSource={dataSource}
        isLoading={isLoading}
        totalFiltered={filteredRecords.length}
        totalAll={allRecords.length}
        onRefresh={() => loadSheetData(true)}
        onOpenSourceModal={() => setIsSourceModalOpen(true)}
        onExportMatrixPDF={handleExportMatrixPDF}
        onExportDetailedPDF={() => handleExportDetailedPDF()}
        onExportMatrixCSV={handleExportMatrixCSV}
        onExportRecordsCSV={() => handleExportRecordsCSV()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Alert if any */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold block text-rose-900 mb-0.5">Terjadi Kendala Koneksi Data</strong>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => loadSheetData(true)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && allRecords.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Mengambil Data dari Google Spreadsheet...
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              Membaca sheet <strong>WO T&D</strong> dan menyaring status <strong>COMP, WFOLLOWUP, WFCOMP</strong>...
            </p>
          </div>
        )}

        {allRecords.length > 0 && (
          <>
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              availableMonths={availableMonths}
              availableUnits={availableUnits}
              availablePenyulangs={availablePenyulangs}
              availableWorkTypes={availableWorkTypes}
              onReset={handleResetFilters}
            />

            {/* View Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-0 overflow-x-auto">
              <div className="flex items-center space-x-1 min-w-max">
                
                {/* Tab 1: Executive Dashboard */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
                    activeTab === 'dashboard'
                      ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Utama</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                    Utama
                  </span>
                </button>

                {/* Tab 2: Daily Matrix 1-31 */}
                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`px-4 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
                    activeTab === 'matrix'
                      ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Matriks Harian (1 - {daysCount})</span>
                </button>

                {/* Tab 3: Daily List */}
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`px-4 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
                    activeTab === 'daily'
                      ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ListChecks className="w-4 h-4" />
                  <span>Rekap Harian</span>
                </button>

                {/* Tab 4: Charts View */}
                <button
                  onClick={() => setActiveTab('charts')}
                  className={`px-4 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
                    activeTab === 'charts'
                      ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Grafik & Analitik</span>
                </button>

                {/* Tab 5: Data Explorer */}
                <button
                  onClick={() => setActiveTab('explorer')}
                  className={`px-4 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
                    activeTab === 'explorer'
                      ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Eksplorasi Data WO</span>
                </button>
              </div>

              <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 pb-2">
                <span>Filter Aktif:</span>
                <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  {filteredRecords.length.toLocaleString()} WO
                </span>
              </div>
            </div>

            {/* Tab 1: Executive Dashboard */}
            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                kpi={kpi}
                dailySummaries={dailySummaries}
                statusRows={statusMatrix}
                unitData={unitChartData}
                allFilteredRecords={filteredRecords}
                daysCount={daysCount}
                selectedMonthLabel={formatMonthYear(filters.monthYear)}
                onSelectStatus={(status: TargetStatus) => {
                  setFilters((prev) => ({ ...prev, statuses: [status] }));
                }}
                onSelectUnit={(unit: string) => {
                  setFilters((prev) => ({ ...prev, unit }));
                }}
                onOpenCell={handleOpenCell}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* Tab 2: Matrix Table */}
            {activeTab === 'matrix' && (
              <div className="space-y-4">
                <KPICards
                  kpi={kpi}
                  selectedMonthLabel={formatMonthYear(filters.monthYear)}
                  onSelectStatusFilter={(status) => {
                    setFilters((prev) => ({ ...prev, statuses: [status] }));
                  }}
                />
                <MatrixDailyTable
                  statusRows={statusMatrix}
                  unitMatrix={unitMatrix}
                  daysCount={daysCount}
                  yearMonth={filters.monthYear}
                  onSelectCell={handleOpenCell}
                  onExportCSV={handleExportMatrixCSV}
                  onExportPDF={handleExportMatrixPDF}
                />
              </div>
            )}

            {/* Tab 3: Daily Detail List */}
            {activeTab === 'daily' && (
              <div className="space-y-4">
                <KPICards
                  kpi={kpi}
                  selectedMonthLabel={formatMonthYear(filters.monthYear)}
                  onSelectStatusFilter={(status) => {
                    setFilters((prev) => ({ ...prev, statuses: [status] }));
                  }}
                />
                <DailyDetailTable
                  dailySummaries={dailySummaries}
                  records={filteredRecords}
                  onSelectDay={(dateStr, day, dayRecords) => {
                    handleOpenCell(`Work Order Tanggal ${dateStr}`, day, dayRecords);
                  }}
                />
              </div>
            )}

            {/* Tab 4: Charts View */}
            {activeTab === 'charts' && (
              <div className="space-y-4">
                <KPICards
                  kpi={kpi}
                  selectedMonthLabel={formatMonthYear(filters.monthYear)}
                  onSelectStatusFilter={(status) => {
                    setFilters((prev) => ({ ...prev, statuses: [status] }));
                  }}
                />
                <ChartsView
                  dailySummaries={dailySummaries}
                  kpi={kpi}
                  unitData={unitChartData}
                />
              </div>
            )}

            {/* Tab 5: Data Explorer Table */}
            {activeTab === 'explorer' && (
              <div className="space-y-4">
                <DataExplorerTable
                  records={filteredRecords}
                  onSelectRecord={(rec) => {
                    handleOpenCell(`Detail Work Order #${rec.workOrder}`, rec.statusDay || 0, [rec]);
                  }}
                  onExportCSV={() => handleExportRecordsCSV()}
                  onExportPDF={(customRecs) => handleExportDetailedPDF(customRecs)}
                />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-semibold text-slate-700">
            Dashboard Monitoring Work Order T&D • PT PLN (Persero) UP3 Bulukumba
          </span>
          <span className="text-[11px] text-slate-500">
            Sumber Data: Google Spreadsheet (Sheet: WO T&D) • Status: COMP, WFOLLOWUP, WFCOMP
          </span>
        </div>
      </footer>

      {/* Drilldown Modal */}
      <WorkOrderListModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        records={modalState.records}
        onClose={() => setModalState({ isOpen: false, title: '', records: [] })}
      />

      {/* Data Source Configuration Modal */}
      <DataSourceModal
        isOpen={isSourceModalOpen}
        dataSource={dataSource}
        isLoading={isLoading}
        onClose={() => setIsSourceModalOpen(false)}
        onUpdateSource={(url, gid) => {
          setDataSource((prev) => ({ ...prev, url, gid }));
          setIsSourceModalOpen(false);
          loadSheetData(true);
        }}
        onUploadCSV={handleUploadCSV}
        onReloadDefault={() => {
          setDataSource({
            url: DEFAULT_CSV_URL,
            sheetName: DEFAULT_SHEET_NAME,
            gid: DEFAULT_GID,
            lastUpdated: null,
            isCustomUpload: false,
          });
          setIsSourceModalOpen(false);
          loadSheetData(true);
        }}
      />

    </div>
  );
}
