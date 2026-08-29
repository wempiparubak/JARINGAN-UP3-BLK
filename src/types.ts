export type TargetStatus = 'COMP' | 'WFOLLOWUP' | 'WFCOMP';

export interface WorkOrderRecord {
  id: string;
  workOrder: string;
  description: string;
  workType: string;
  location: string;
  asset: string;
  owner: string;
  unit: string;
  status: string;
  unitDescription: string;
  po: string;
  reportedDate: string;
  scheduledStart: string;
  hiValue: string;
  descriptionPenyulang: string;
  statusDate: string;
  statusDay: number | null;
  statusMonth: number | null;
  statusYear: number | null;
  statusYearMonth: string | null; // e.g. "2026-08"
  priority: string;
  originatingRecord: string;
  site: string;
  bulan: string;
  up3: string;
  insp: string;
  jenisWo: string;
  panjangJtm: string;
  fasa: string;
  year: string;
  raw: Record<string, string>;
}

export interface FilterState {
  monthYear: string; // '2026-08', '2026-07', '2026-06', '2026-05', '2026-04', 'ALL'
  statuses: string[]; // default ['COMP', 'WFOLLOWUP', 'WFCOMP']
  unit: string; // 'ALL' or specific unit description
  penyulang: string; // 'ALL' or specific feeder
  workType: string; // 'ALL' or specific work type
  search: string;
}

export interface DailySummary {
  day: number;
  dateStr: string;
  dayName: string;
  comp: number;
  wfollowup: number;
  wfcomp: number;
  total: number;
  compPercentage: number;
}

export interface MatrixRow {
  id: string;
  category: 'status' | 'unit' | 'penyulang';
  title: string;
  subTitle?: string;
  statusType?: TargetStatus | 'TOTAL';
  unitName?: string;
  penyulangName?: string;
  days: Record<number, number>; // day 1..31 count
  total: number;
  avgDaily: number;
  records: WorkOrderRecord[];
}

export interface KPISummary {
  totalRecords: number;
  compCount: number;
  wfollowupCount: number;
  wfcompCount: number;
  compPercentage: number;
  wfollowupPercentage: number;
  wfcompPercentage: number;
  peakDay: { day: number; count: number; dateStr: string } | null;
  dailyAverage: number;
  totalDaysWithData: number;
}

export interface DataSourceConfig {
  url: string;
  sheetName: string;
  gid: string;
  lastUpdated: string | null;
  isCustomUpload: boolean;
}
