'use client';
import { useState } from 'react';
import { Paper, savePaper, unsavePaper, isPaperSaved } from '@/utils/api';
import { 
    BookmarkPlus, BookmarkCheck, ExternalLink, ChevronDown, ChevronUp, 
    FileText, Quote, Globe, Search 
} from 'lucide-react';
import Link from 'next/link';

export default function PaperCard({ paper }: { paper: Paper }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [saved, setSaved] = useState<boolean>(() => isPaperSaved(paper));

    const handleSave = () => {
        if (saved) { unsavePaper(paper); setSaved(false); }
        else { savePaper(paper); setSaved(true); }
    };

    const doiValue = paper.doi?.replace('https://doi.org/', '') || '';
    const encodedTitle = encodeURIComponent(paper.title);
    
    const scholarUrl = `https://scholar.google.com/scholar?q=${doiValue || encodedTitle}`;
    const scopusUrl = paper.externalIds?.scopus || `https://www.scopus.com/results/results.uri?searchTerm=DOI(${doiValue})&src=s`;
    const wosUrl = `https://www.webofscience.com/wos/woscc/summary/${doiValue}/1`;

    const paperQuery = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(paper)))));

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col gap-4 group">
            {/* Top Source Badges */}
            <div className="flex flex-wrap gap-2 mb-1">
                {paper.sources?.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100">
                        {s}
                    </span>
                ))}
                {paper.citations !== undefined && (
                   <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 ml-auto">
                       <Quote className="w-2.5 h-2.5" />
                       {paper.citations} Citations
                   </div>
                )}
            </div>

            {/* Header */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{paper.title}</h3>
                </div>
                <button
                    onClick={handleSave}
                    className={`shrink-0 p-2 rounded-xl transition-all ${saved ? 'text-indigo-600 bg-indigo-50 shadow-inner' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-sm'}`}
                >
                    {saved ? <BookmarkCheck className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
                </button>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${paper.paperType === 'Review' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                    {paper.paperType}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${paper.isFree ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                    {paper.isFree ? 'Open Access' : 'Subscription required'}
                </span>
                {paper.pdfUrl && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Free PDF
                    </span>
                )}
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-50 text-slate-500 border border-slate-200">{paper.year}</span>
            </div>

            {/* Authors & Journal */}
            <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-600/80 truncate">
                    {paper.authors.map(a => a.name).join(', ')}
                </p>
                <p className="text-[11px] font-medium text-slate-400 italic truncate">
                    {paper.journal}
                </p>
            </div>

            {/* Abstract */}
            <div>
                <p className={`text-sm text-slate-500 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>{paper.abstract}</p>
                {paper.abstract && paper.abstract.length > 150 && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="mt-2 text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 uppercase tracking-wider">
                        {isExpanded ? <><ChevronUp className="w-3 h-3" />Collapse</> : <><ChevronDown className="w-3 h-3" />Read Abstract</>}
                    </button>
                )}
            </div>

            {/* Action Buttons Grid */}
            <div className="mt-auto pt-4 grid grid-cols-2 lg:grid-cols-3 gap-2">
                {paper.pdfUrl ? (
                    <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="col-span-2 lg:col-span-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                        <FileText className="w-3.5 h-3.5" /> View PDF
                    </a>
                ) : (
                    <a href={paper.sourceUrl} target="_blank" rel="noopener noreferrer" className="col-span-2 lg:col-span-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all">
                        <Globe className="w-3.5 h-3.5" /> Publisher
                    </a>
                )}
                
                <a href={scopusUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold border border-orange-100 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all">
                    Scopus
                </a>
                
                <a href={wosUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold border border-purple-100 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all">
                    WoS
                </a>
                
                <a href={scholarUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold border border-blue-100 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all">
                    Scholar
                </a>

                <Link href={`/paper?data=${paperQuery}`} className="flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all">
                    Intelligence →
                </Link>
            </div>
        </div>
    );
}
