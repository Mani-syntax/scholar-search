'use client';
import { useEffect, useState } from 'react';
import { getSavedPapers, unsavePaper, Paper } from '@/utils/api';
import { Bookmark, BookmarkX, ExternalLink, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>('All');

    useEffect(() => {
        setPapers(getSavedPapers());
    }, []);

    const handleRemove = (paper: Paper) => {
        unsavePaper(paper);
        setPapers(getSavedPapers());
    };

    const collections = ['All', ...Array.from(new Set(papers.map(() => 'General')))];
    const filtered = selectedCollection === 'All' ? papers : papers;

    const paperQuery = (paper: Paper) =>
        encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(paper)))));

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Bookmark className="text-indigo-600 w-6 h-6" /> My Dashboard
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Your saved papers, organized in one place.</p>
            </div>

            {papers.length === 0 ? (
                <div className="text-center py-24 text-slate-300">
                    <FolderOpen className="w-14 h-14 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-500">No saved papers yet</p>
                    <p className="text-sm text-slate-400 mt-1">Search for papers and click the bookmark icon to save them here.</p>
                    <Link href="/" className="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
                        Start Searching →
                    </Link>
                </div>
            ) : (
                <>
                    {/* Collection tabs */}
                    <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                        {collections.map(c => (
                            <button key={c} onClick={() => setSelectedCollection(c)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCollection === c ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                {c} {c === 'All' ? `(${papers.length})` : ''}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((paper, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
                                <div className="flex-1">
                                    <div className="flex gap-1.5 mb-2">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${paper.isFree ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            {paper.isFree ? 'Open Access' : 'Subscription'}
                                        </span>
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-50 text-slate-500 border border-slate-100">{paper.year}</span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">{paper.title}</h3>
                                    <p className="text-xs text-slate-400">
                                        {paper.authors.slice(0, 2).map(a => a.name).join(', ')}{paper.authors.length > 2 ? ' ...' : ''} — {paper.sourceName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                    <Link href={`/paper?data=${paperQuery(paper)}`}
                                        className="flex-1 text-center py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                                        Analyze
                                    </Link>
                                    {paper.sourceUrl && (
                                        <a href={paper.sourceUrl} target="_blank" rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                    <button onClick={() => handleRemove(paper)}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                        <BookmarkX className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
