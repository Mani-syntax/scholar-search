'use client';
import { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, Link2, AlertCircle, TrendingUp, Sparkles, BrainCircuit } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function ResearchAnalytics() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState('');

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setStatus('Analyzing profile link...');
    
    try {
      const startTime = Date.now();
      
      // Artificial delay for smooth UX transition if it's too fast
      const response = await axios.post('http://localhost:5000/api/researcher/analyze', { profileUrl: url });
      
      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) await new Promise(resolve => setTimeout(resolve, 1500 - elapsed));
      
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze researcher. Please verify the link is a public Scopus or Web of Science profile.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <section className="w-full min-h-[600px] flex flex-col items-center">
      {/* Input Section - Only shown when no data or loading */}
      {(!data || loading) && (
        <div className={`w-full max-w-3xl mx-auto px-4 transition-all duration-700 ${data ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="text-center mb-10">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mb-6 shadow-sm shadow-indigo-100/50">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">New: Research Intelligence</span>
             </div>
             <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Analyze <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Researcher Profiles</span>
             </h2>
             <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                Paste a Web of Science or Scopus profile link to instantly generate a comprehensive 
                analytics dashboard of their scholarly impact and trends.
             </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition duration-1000"></div>
            <div className="relative flex flex-col md:flex-row gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-xl shadow-indigo-50/50">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Paste Scopus or Web of Science profile link..."
                  className="block w-full pl-11 pr-4 py-4 text-slate-900 border-none rounded-xl focus:ring-0 placeholder:text-slate-400 font-medium"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !url}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 group min-w-[180px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Analyze Researcher</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-100">
                <BrainCircuit className="w-4 h-4 text-emerald-400" /> Powered by OpenAlex Intelligence
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-100">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Live Citations & h-index
             </div>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {loading && (
            <div className="mt-12 flex flex-col items-center gap-4 animate-pulse">
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{status}</p>
            </div>
          )}
        </div>
      )}

      {/* Main Dashboard - Shown on data */}
      {data && !loading && (
        <div className="w-full">
            <div className="flex justify-center mb-8">
                <button 
                  onClick={() => setData(null)} 
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm"
                >
                    ← Back to Analysis Center
                </button>
            </div>
            <AnalyticsDashboard data={data} />
        </div>
      )}
    </section>
  );
}
