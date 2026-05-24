'use client';
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import PaperCard from '@/components/PaperCard';
import { fetchPapers, fetchSimilarPapers, Paper, Filters, SearchType } from '@/utils/api';
import { Sparkles, BookOpen, Code2, Search, BrainCircuit } from 'lucide-react';
import ResearchAnalytics from '@/components/analytics/ResearchAnalytics';

const FEATURES = [
  { icon: <Search className="w-5 h-5" />, title: 'Smart Search', desc: 'Find papers via topic, author or content similarity' },
  { icon: <Sparkles className="w-5 h-5" />, title: 'AI Explanation', desc: 'Understand any research paper in plain language' },
  { icon: <Code2 className="w-5 h-5" />, title: 'Implementation', desc: 'Get step-by-step code plans from abstract to prototype' },
  { icon: <BookOpen className="w-5 h-5" />, title: 'Writing Assistant', desc: 'Generate abstracts, literature reviews & more' },
];

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [currentSearchType, setCurrentSearchType] = useState<SearchType>('topic');
  const [filters, setFilters] = useState<Filters>({ year: '', type: '', source: '', isFree: false });

  const handleSearch = async (newQuery: string, searchType: SearchType = 'topic') => {
    setQuery(newQuery);
    setCurrentSearchType(searchType);
    setIsLoading(true);
    setError(null);
    try {
      const results = await fetchPapers(newQuery, filters, searchType);
      setPapers(results);
    } catch {
      setError('Something went wrong while fetching papers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentMatch = async (content: string) => {
    setQuery('__content_match__');
    setCurrentSearchType('content');
    setIsLoading(true);
    setError(null);
    try {
      const results = await fetchSimilarPapers(content);
      setPapers(results);
    } catch {
      setError('Something went wrong while finding similar papers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-search on filter change
  useEffect(() => {
    if (query && query !== '__content_match__') {
      handleSearch(query, currentSearchType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 pt-16 pb-12 px-6 text-center border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Research Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
            Research <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Scholar</span>
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
            A research mentor. From abstract to implementation — guiding you through the full research lifecycle.
          </p>
          <SearchBar onSearch={handleSearch} onContentMatch={handleContentMatch} isLoading={isLoading} />
        </div>

        {/* Feature Pills */}
        {!query && (
          <div className="relative mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white/80 backdrop-blur border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">{f.icon}</div>
                <p className="text-sm font-semibold text-slate-800 mb-1">{f.title}</p>
                <p className="text-xs text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Research Analytics Section */}
        {!query && !isLoading && (
          <div className="mb-24">
            <ResearchAnalytics />
          </div>
        )}

        {query && currentSearchType !== 'content' && (
          <FilterBar filters={filters} onFilterChange={setFilters} />
        )}

        {!isLoading && papers.length > 0 && (
          <div className="mb-5 flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Found <span className="font-bold text-slate-800">{papers.length}</span> papers
            </span>
            {currentSearchType === 'content' && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Sorted by similarity
              </span>
            )}
            {currentSearchType === 'author' && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                Author Search
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-8 text-center text-sm font-medium">{error}</div>
        )}

        {/* Skeleton grid while loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-5" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && papers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {papers.map((paper, index) => (
              <PaperCard key={index} paper={paper} />
            ))}
          </div>
        )}

        {!isLoading && query && papers.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No papers found</h3>
            <p className="text-slate-500">Try adjusting your keywords or filters.</p>
          </div>
        )}

        {!query && !isLoading && (
          <div className="text-center py-24 text-slate-300">
            <div className="text-7xl mb-4">📚</div>
            <p className="text-xl font-medium">Enter a topic above to start searching</p>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-100 py-8 text-center text-slate-400 text-xs">
        © 2026 Research Scholar — Built by Mani
      </footer>
    </div>
  );
}
