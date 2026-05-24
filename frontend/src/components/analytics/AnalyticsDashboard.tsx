'use client';
import { Mail, MapPin, Building, Globe, Share2, Download, Printer } from 'lucide-react';
import StatsGrid from './StatsGrid';
import TrendsChart from './TrendsChart';
import DistributionCharts from './DistributionCharts';
import PublicationsTable from './PublicationsTable';

export default function AnalyticsDashboard({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Profile Header */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 mb-8 shadow-xl shadow-indigo-50/20">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200 ring-4 ring-white">
            {data.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{data.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100">
                <Building className="w-4 h-4 text-indigo-400" /> {data.affiliation}
              </div>
              {data.orcid && (
                <div className="flex items-center gap-1.5 bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100">
                  <Globe className="w-4 h-4 text-emerald-400" /> ORCID: {data.orcid}
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100">
                <MapPin className="w-4 h-4 text-rose-400" /> Global Research Impact
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.topics.map((t: string, i: number) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-widest bg-white text-indigo-600 border border-indigo-50 px-2 py-0.5 rounded-md shadow-sm">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <button className="flex-1 md:flex-none p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Share2 className="w-5 h-5 mx-auto" />
             </button>
             <button className="flex-1 md:flex-none p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Download className="w-5 h-5 mx-auto" />
             </button>
             <button className="flex-1 md:flex-none p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Printer className="w-5 h-5 mx-auto" />
             </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <StatsGrid data={{
        totalWorks: data.totalWorks,
        totalCitations: data.totalCitations,
        hIndex: data.hIndex,
        i10Index: data.i10Index,
        avgCitations: data.summaryStats.avgCitations,
        recentCitations: data.summaryStats.recentCitations
      }} />

      {/* Trends & Charts */}
      <TrendsChart data={data.yearlyStats} />
      
      <DistributionCharts topics={data.topics} journals={data.topJournals} />

      {/* Publications List */}
      <PublicationsTable works={data.works} />
    </div>
  );
}
