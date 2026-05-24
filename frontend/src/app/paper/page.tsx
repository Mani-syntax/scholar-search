'use client';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { summarizePaper, getNextSteps, getImplementation, getGapAnalysis, Paper } from '@/utils/api';
import { Sparkles, Lightbulb, Code2, SearchX, Loader2 } from 'lucide-react';

type Tab = 'explanation' | 'next_steps' | 'implementation' | 'gaps';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'explanation', label: 'AI Explanation', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'next_steps', label: 'Next Steps', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'implementation', label: 'Implementation', icon: <Code2 className="w-4 h-4" /> },
    { id: 'gaps', label: 'Research Gaps', icon: <SearchX className="w-4 h-4" /> },
];

function renderMarkdown(text: string) {
    // Simple markdown-to-HTML renderer
    const html = text
        .replace(/## (.+)/g, '<h2>$1</h2>')
        .replace(/### (.+)/g, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^- (.+)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^([^<\n].+)$/gm, '<p>$1</p>');
    return html;
}

function PaperPageContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<Tab>('explanation');
    const [results, setResults] = useState<Record<Tab, string>>({
        explanation: '', next_steps: '', implementation: '', gaps: ''
    });
    const [loading, setLoading] = useState<Tab | null>(null);
    const [errors, setErrors] = useState<Record<Tab, string>>({ explanation: '', next_steps: '', implementation: '', gaps: '' });

    // Decode paper from URL param
    let paper: Paper | null = null;
    try {
        const raw = searchParams.get('data');
        if (raw) paper = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(raw)))));
    } catch { paper = null; }

    if (!paper) return (
        <div className="flex flex-col items-center justify-center h-full py-32 text-slate-400">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="font-semibold text-slate-600">Invalid paper data</p>
            <p className="text-sm mt-1">Please go back and select a paper from the search results.</p>
        </div>
    );

    const generate = async (tab: Tab) => {
        if (results[tab] || loading) return;
        setLoading(tab);
        setErrors(prev => ({ ...prev, [tab]: '' }));
        try {
            let result = '';
            if (tab === 'explanation') result = await summarizePaper(paper!.abstract);
            else if (tab === 'next_steps') result = await getNextSteps(paper!.abstract);
            else if (tab === 'implementation') result = await getImplementation(paper!.abstract);
            else if (tab === 'gaps') result = await getGapAnalysis(paper!.abstract);
            setResults(prev => ({ ...prev, [tab]: result }));
        } catch {
            setErrors(prev => ({ ...prev, [tab]: 'Failed to generate content. Ensure OpenAI API key is set in the backend .env file.' }));
        } finally {
            setLoading(null);
        }
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        generate(tab);
    };

    // Auto-generate explanation on first render
    useState(() => { generate('explanation'); });

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Paper Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${paper.paperType === 'Review' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                        {paper.paperType}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${paper.isFree ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {paper.isFree ? 'Open Access' : 'Subscription'}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs rounded-full bg-slate-50 text-slate-500 border border-slate-100">{paper.year}</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">{paper.title}</h1>
                {paper.authors.length > 0 && (
                    <p className="text-sm text-slate-500 mb-4">{paper.authors.map(a => a.name).join(', ')}</p>
                )}
                <details className="group">
                    <summary className="cursor-pointer text-sm text-indigo-600 hover:underline">Show abstract</summary>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{paper.abstract}</p>
                </details>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* AI Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[300px]">
                {loading === activeTab ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                        <p className="text-sm font-medium">AI is analyzing the paper…</p>
                    </div>
                ) : errors[activeTab] ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm">{errors[activeTab]}</div>
                ) : results[activeTab] ? (
                    <div
                        className="ai-output text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(results[activeTab]) }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                        <Sparkles className="w-8 h-8 mb-3" />
                        <p className="text-sm">Click the tab above to generate AI insights</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaperPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
            <PaperPageContent />
        </Suspense>
    );
}
