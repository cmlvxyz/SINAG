import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

type Timeframe = 'today' | 'weekly' | 'monthly';

interface StackPoint {
  label: string;
  critical: number;
  standard: number;
}

const DATA: Record<Timeframe, StackPoint[]> = {
  today: [
    { label: '6AM', critical: 8, standard: 12 },
    { label: '9AM', critical: 14, standard: 18 },
    { label: '12PM', critical: 22, standard: 16 },
    { label: '3PM', critical: 10, standard: 24 },
    { label: '6PM', critical: 26, standard: 15 },
    { label: '9PM', critical: 18, standard: 17 },
  ],
  weekly: [
    { label: 'Mon', critical: 32, standard: 28 },
    { label: 'Tue', critical: 28, standard: 34 },
    { label: 'Wed', critical: 40, standard: 18 },
    { label: 'Thu', critical: 16, standard: 38 },
    { label: 'Fri', critical: 44, standard: 22 },
    { label: 'Sat', critical: 35, standard: 26 },
    { label: 'Sun', critical: 24, standard: 20 },
  ],
  monthly: [
    { label: 'Wk 1', critical: 120, standard: 95 },
    { label: 'Wk 2', critical: 145, standard: 110 },
    { label: 'Wk 3', critical: 110, standard: 130 },
    { label: 'Wk 4', critical: 160, standard: 120 },
  ],
};

const StackedTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const critical = payload.find((p: any) => p.dataKey === 'critical')?.value ?? 0;
  const standard = payload.find((p: any) => p.dataKey === 'standard')?.value ?? 0;
  const total = critical + standard;
  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-[#1C1635] px-3 py-2 shadow-xl">
      <p className="text-[11px] font-bold text-slate-900 dark:text-white">{label}</p>
      <div className="mt-1 space-y-0.5 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
          <span className="text-slate-500 dark:text-slate-400">Critical: </span>
          <strong className="text-slate-900 dark:text-white">{critical}</strong>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#C4B5FD]" />
          <span className="text-slate-500 dark:text-slate-400">Standard: </span>
          <strong className="text-slate-900 dark:text-white">{standard}</strong>
        </div>
        <div className="pt-0.5 text-purple-700 dark:text-purple-300 font-bold">
          Total: {total} alerts
        </div>
      </div>
      {/* line indicator */}
      <div className="mt-1.5 h-0.5 w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C4B5FD]" />
    </div>
  );
};

export const CardAlertDistribution: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');

  const chartData = DATA[timeframe];
  const total = useMemo(
    () => chartData.reduce((sum, d) => sum + d.critical + d.standard, 0),
    [chartData]
  );

  const tabs: { id: Timeframe; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ];

  return (
    <div className="bg-white dark:bg-[#141026] rounded-3xl p-6 border border-[#E9E3F5] dark:border-[#272044] shadow-sm flex flex-col justify-between transition-all duration-200">

      {/* Top Header with Segmented Filter Control */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Alert Volume & Speed
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Critical vs standard alerts (stacked)
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-purple-50/80 dark:bg-[#1C1635] rounded-xl border border-purple-100/50 dark:border-purple-900/40">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === t.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-1 text-[11px] font-semibold">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
          Critical
        </span>
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C4B5FD]" />
          Standard
        </span>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold shadow-md shadow-purple-600/30 flex items-center gap-1 whitespace-nowrap">
          <TrendingUp className="w-2.5 h-2.5" />
          +18.4% Faster · 1.9m ETA
        </span>
      </div>

      {/* Stacked Bar Chart with line-indicator tooltip */}
      <div className="w-full h-[210px] px-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap="24%">
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
              minTickGap={0}
              padding={{ left: 10, right: 10 }}
              tick={{ fontSize: 11, fontWeight: 600, fill: '#8b86a3' }}
            />
            <Tooltip
              content={<StackedTooltip />}
              cursor={{ fill: 'rgba(124,58,237,0.08)' }}
            />
            <Bar
              dataKey="critical"
              stackId="a"
              fill="#7C3AED"
              radius={[0, 0, 4, 4]}
              maxBarSize={42}
            />
            <Bar
              dataKey="standard"
              stackId="a"
              fill="#C4B5FD"
              radius={[4, 4, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-purple-50 dark:border-[#272044] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Average Response: <strong className="text-purple-700 dark:text-purple-300 font-semibold">2.4 mins</strong></span>
        <span className="font-mono text-[11px]">{total} Total Alerts Logged</span>
      </div>

    </div>
  );
};
