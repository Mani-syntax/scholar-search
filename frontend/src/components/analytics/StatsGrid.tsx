'use client';
import { Users, FileText, Quote, Award, Activity, TrendingUp } from 'lucide-react';

interface StatsProps {
  data: {
    totalWorks: number;
    totalCitations: number;
    hIndex: number;
    i10Index: number;
    avgCitations: string | number;
    recentCitations: number;
  };
}

export default function StatsGrid({ data }: StatsProps) {
  const stats = [
    { label: 'Publications', value: data.totalWorks, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Citations', value: data.totalCitations, icon: Quote, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'h-index', value: data.hIndex, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'i10-index', value: data.i10Index, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg citations', value: data.avgCitations, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Recent citations', value: data.recentCitations, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {stats.map((s, i) => (
        <div key={i} className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className={`${s.bg} ${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
            <s.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{s.value}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
