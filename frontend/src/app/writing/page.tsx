'use client';
import { useState } from 'react';
import { getWritingAssist } from '@/utils/api';
import { PenTool, Loader2, Copy, Check } from 'lucide-react';

const TYPES = [
    { id: 'abstract', label: 'Abstract Generator', placeholder: 'Describe your research idea, method, and expected results...' },
    { id: 'literature_review', label: 'Literature Review', placeholder: 'Paste titles and brief notes about related papers you have read...' },
    { id: 'methodology', label: 'Methodology Section', placeholder: 'Describe your experimental setup or research method in bullet points...' },
    { id: 'grammar_improve', label: 'Grammar Improvement', placeholder: 'Paste your draft text here for grammar and clarity improvement...' },
    { id: 'academic_rewrite', label: 'Academic Rewriting', placeholder: 'Paste informal or rough text to rewrite in academic style...' },
];

function renderMarkdown(text: string) {
    return text
        .replace(/## (.+)/g, '<h2>$1</h2>')
        .replace(/### (.+)/g, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^- (.+)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>');
}

export default function WritingPage() {
    const [type, setType] = useState(TYPES[0].id);
    const [inputText, setInputText] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const currentType = TYPES.find(t => t.id === type)!;

    const generate = async () => {
        if (!inputText.trim()) return;
        setLoading(true);
        setOutput('');
        try {
            const result = await getWritingAssist(type, inputText);
            setOutput(result);
        } catch {
            setOutput('Failed to generate. Please try again in a moment.');
        } finally { setLoading(false); }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <PenTool className="text-indigo-600 w-6 h-6" /> Writing Assistant
                </h1>
                <p className="text-slate-500 mt-1 text-sm">AI-powered tool for academic writing — from abstracts to full sections.</p>
            </div>

            {/* Type selector */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
                {TYPES.map(t => (
                    <button key={t.id} onClick={() => setType(t.id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${type === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Input */}
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-slate-700">Your Input</p>
                    <textarea
                        value={inputText} onChange={e => setInputText(e.target.value)}
                        placeholder={currentType.placeholder}
                        rows={12}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none leading-relaxed"
                    />
                    <button onClick={generate} disabled={loading || !inputText.trim()}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : `Generate ${currentType.label}`}
                    </button>
                </div>

                {/* Output */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">AI Output</p>
                        {output && (
                            <button onClick={copyToClipboard}
                                className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors">
                                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        )}
                    </div>
                    <div className="flex-1 bg-white rounded-xl border border-slate-100 p-4 min-h-[300px] overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
                                <p className="text-sm">Writing for you…</p>
                            </div>
                        ) : output ? (
                            <div className="ai-output text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-200 py-10">
                                <PenTool className="w-10 h-10 mb-3" />
                                <p className="text-sm text-slate-400">Your generated text will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
