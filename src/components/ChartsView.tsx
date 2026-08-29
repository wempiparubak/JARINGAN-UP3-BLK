import React from 'react';
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
} from 'recharts';
import { DailySummary, KPISummary } from '../types';
import { BarChart3, PieChart as PieIcon, Building2 } from 'lucide-react';

interface ChartsViewProps {
  dailySummaries: DailySummary[];
  kpi: KPISummary;
  unitData: { unit: string; total: number; comp: number; wfollowup: number; wfcomp: number }[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  dailySummaries,
  kpi,
  unitData,
}) => {
  const COLORS = {
    COMP: '#10b981', // emerald-500
    WFOLLOWUP: '#f59e0b', // amber-500
    WFCOMP: '#0284c7', // sky-600
  };

  const pieData = [
    { name: 'COMP (Selesai)', value: kpi.compCount, color: COLORS.COMP },
    { name: 'WFOLLOWUP (Tindak Lanjut)', value: kpi.wfollowupCount, color: COLORS.WFOLLOWUP },
    { name: 'WFCOMP (Menunggu Selesai)', value: kpi.wfcompCount, color: COLORS.WFCOMP },
  ].filter((d) => d.value > 0);

  const customTooltipStyle = {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: '0.75rem',
    color: '#0f172a',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Daily Volume Trend Bar Chart (Spans 2 columns) */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Tren Harian Work Order (Tanggal 1 - 31)</h3>
          </div>
          <span className="text-xs text-slate-500">Distribusi Status Date</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailySummaries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `Tgl ${val}`}
              />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={customTooltipStyle}
                formatter={(val: any, name: any) => [`${val} WO`, name]}
                labelFormatter={(label) => `Tanggal ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="comp" name="COMP (Selesai)" stackId="a" fill={COLORS.COMP} radius={[0, 0, 0, 0]} />
              <Bar dataKey="wfollowup" name="WFOLLOWUP (Tindak Lanjut)" stackId="a" fill={COLORS.WFOLLOWUP} />
              <Bar dataKey="wfcomp" name="WFCOMP (Menunggu)" stackId="a" fill={COLORS.WFCOMP} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Donut Composition Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Proporsi Status</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {kpi.totalRecords} Total
          </span>
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
              <Tooltip contentStyle={customTooltipStyle} formatter={(val: any) => [`${val} WO`, 'Jumlah']} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-bold text-slate-400">COMP RATE</span>
            <span className="text-xl font-extrabold text-emerald-600">{kpi.compPercentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Legend pills */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="truncate max-w-[150px] font-medium">{item.name}</span>
              </span>
              <span className="font-mono font-bold text-slate-900">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-ULP Work Order Distribution (Full Width) */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Distribusi Work Order per Unit Layanan Pelanggan (ULP)</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">Total {unitData.length} Unit</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={unitData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="unit" 
                stroke="#94a3b8" 
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="comp" name="COMP (Selesai)" fill={COLORS.COMP} />
              <Bar dataKey="wfollowup" name="WFOLLOWUP (Tindak Lanjut)" fill={COLORS.WFOLLOWUP} />
              <Bar dataKey="wfcomp" name="WFCOMP (Menunggu)" fill={COLORS.WFCOMP} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
