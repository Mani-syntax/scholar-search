'use client';
import { useState } from 'react';
import { fetchPapers, getGapAnalysis, Paper } from '@/utils/api';
import { Layers, X, Plus, Loader2, Search } from 'lucide-react';

export default function ComparePage() {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Paper[]>([]);
    const [selected, setSelected] = useState<Paper[]>([]);
    const [comparison, setComparison] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    const search = async () => {
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res = await fetchPapers(query.trim());
            setSearchResults(res.slice(0, 10));
        } catch { /* noop */ } finally { setSearching(false); }
    };

    const addPaper = (paper: Paper) => {
        if (selected.length >= 3) return;
        if (!selected.some(p => p.title === paper.title)) setSelected(prev => [...prev, paper]);
    };

    const removePaper = (paper: Paper) => setSelected(prev => prev.filter(p => p.title !== paper.title));

    const compare = async () => {
        if (selected.length < 2) return;
        setLoading(true);
        setComparison('');
        const combinedAbstracts = selected.map((p, i) =>
            `Paper ${i + 1}: "${p.title}"\n${p.abstract}`
        ).join('\n\n---\n\n');
        try {
            const result = await getGapAnalysis(combinedAbstracts);
            setComparison(result);
        } catch { setComparison('Failed to generate comparison.'); }
        finally { setLoading(false); }
    };

    const renderMarkdown = (text: string) =>
        text
            .replace(/## (.+)/g, '<h2>$1</h2>')
            .replace(/### (.+)/g, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/^- (.+)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>');

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="text-indigo-600 w-6 h-6" /> Compare Papers
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Select 2–3 papers and get an AI-powered comparative analysis.</p>
            </div>

            {/* Search to add papers */}
            <div className="flex gap-2 mb-4">
                <input
                    value={query} onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && search()}
                    placeholder="Search for papers to compare…"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button onClick={search}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2">
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                </button>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
                <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {searchResults.map((paper, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{paper.title}</p>
                                <p className="text-xs text-slate-400">{paper.year} · {paper.sourceName}</p>
                            </div>
                            <button onClick={() => addPaper(paper)}
                                disabled={selected.some(p => p.title === paper.title) || selected.length >= 3}
                                className="shrink-0 p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-30">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Selected papers */}
            {selected.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Selected ({selected.length}/3)</p>
                    <div className="flex flex-wrap gap-2">
                        {selected.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-lg px-3 py-1.5 text-xs font-medium">
                                <span className="max-w-[200px] truncate">{p.title}</span>
                                <button onClick={() => removePaper(p)} className="text-indigo-400 hover:text-red-500">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button onClick={compare} disabled={selected.length < 2 || loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2 mb-6">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : 'Generate Comparison'}
            </button>

            {comparison && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-slate-800 mb-4">AI Comparison Result</h2>
                    <div className="ai-output text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(comparison) }} />
                </div>
            )}
        </div>
    );
}
