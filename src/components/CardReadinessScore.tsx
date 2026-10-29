import React from 'react';
import { ArrowUpRight, Send, BellRing, TrendingUp } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { soundEffects } from '../services/soundEffects';

interface CardReadinessScoreProps {
  onOpenSos: () => void;
  onTestPush: () => void;
}

// Last 6 months of fleet readiness vs coverage
const chartData = [
  { month: 'January', readiness: 96.2, coverage: 82 },
  { month: 'February', readiness: 97.4, coverage: 86 },
  { month: 'March', readiness: 98.1, coverage: 88 },
  { month: 'April', readiness: 98.8, coverage: 91 },
  { month: 'May', readiness: 99.3, coverage: 94 },
  { month: 'June', readiness: 99.8, coverage: 96 },
];

const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-[#1C1635] px-3 py-2 shadow-xl text-[11px] font-mono">
      <p className="font-bold text-slate-900 dark:text-white font-sans">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 mt-0.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.stroke }}
          />
          <span className="text-slate-500 dark:text-slate-400 capitalize">{p.dataKey}: </span>
          <strong className="text-slate-900 dark:text-white">{p.value}%</strong>
        </div>
      ))}
    </div>
  );
};

export const CardReadinessScore: React.FC<CardReadinessScoreProps> = ({
  onOpenSos,
  onTestPush,
}) => {
  return (
    <div className="bg-white dark:bg-[#141026] rounded-3xl p-6 border border-[#E9E3F5] dark:border-[#272044] shadow-sm flex flex-col justify-between transition-all duration-200">

      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Readiness & Coverage
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fleet readiness vs barangay coverage · Jan - Jun
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric */}
      <div className="my-1 text-center">
        <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
          Active Fleet Readiness
        </p>
        <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums mt-0.5">
          99.8<span className="text-2xl text-purple-600 dark:text-purple-400">%</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          24 Hero Units Armed across 6 Barangays
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-1 text-[11px] font-semibold">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
          Readiness
        </span>
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
          Coverage
        </span>
      </div>

      {/* Multiple Line Chart */}
      <div className="w-full h-[150px] my-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: -22, right: 12, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#8b86a3" strokeOpacity={0.18} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11, fontWeight: 600, fill: '#8b86a3' }}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#8b86a3' }}
              domain={[75, 100]}
              tickCount={4}
            />
            <Tooltip cursor={false} content={<LineTooltip />} />
            <Line
              dataKey="readiness"
              type="monotone"
              stroke="#7C3AED"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#fff', stroke: '#7C3AED', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
            <Line
              dataKey="coverage"
              type="monotone"
              stroke="#6366F1"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#fff', stroke: '#6366F1', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trending footer */}
      <div className="flex items-center gap-2 text-xs mb-3">
        <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
          Trending up by 5.2% this month <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
        </span>
        <span className="text-slate-400">· Last 6 months</span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-purple-50 dark:border-[#272044]">
        <button
          onClick={() => {
            soundEffects.playEmergencySiren(1.5);
            onOpenSos();
          }}
          className="w-full py-2.5 px-3 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-semibold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send SOS ↑</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playPushAlertPing();
            onTestPush();
          }}
          className="w-full py-2.5 px-3 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Push Alert ↓</span>
        </button>
      </div>

    </div>
  );
};
