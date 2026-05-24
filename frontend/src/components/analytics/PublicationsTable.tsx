'use client';
import { ExternalLink, FileText, Lock, Unlock, Quote } from 'lucide-react';

export default function PublicationsTable({ works }: { works: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Research Portfolio</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Top 50 Works</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Title</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Year</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Journal</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Citations</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {works.map((w, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 max-w-md lg:max-w-xl">
                    <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{w.title}</p>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{w.type ? w.type.replace('-', ' ') : 'Paper'}</span>
                        {w.doi && (
                        <a href={w.doi} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-[10px] font-bold group">
                            DOI Link <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                        )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-600">{w.year}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-slate-500 line-clamp-1">{w.journal}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Quote className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-sm font-bold text-slate-900">{w.citations}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {w.isOpenAccess ? (
                    <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100 w-fit flex items-center gap-1.5">
                      <Unlock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Open Access</span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 text-slate-400 px-2 py-1 rounded-lg border border-slate-100 w-fit flex items-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Closed</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
