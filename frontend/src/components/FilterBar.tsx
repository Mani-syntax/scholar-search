'use client';

import { Filters } from '@/utils/api';

interface FilterBarProps {
    filters: Filters;
    onFilterChange: (newFilters: Filters) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
    const years = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - i).toString());

    return (
        <div className="flex flex-wrap gap-4 mb-8 items-center bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Year:</label>
                <select
                    value={filters.year || ''}
                    onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                >
                    <option value="">All Years</option>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Type:</label>
                <select
                    value={filters.type || ''}
                    onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                >
                    <option value="">All Types</option>
                    <option value="Research">Research Paper</option>
                    <option value="Review">Review Paper</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-700">Source:</label>
                <select
                    value={filters.source || ''}
                    onChange={(e) => onFilterChange({ ...filters, source: e.target.value })}
                    className="bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 p-2.5 outline-none"
                >
                    <option value="">All Indexes</option>
                    <option value="scopus">In Scopus</option>
                    <option value="wos">In Web of Science</option>
                    <option value="scholar">In Google Scholar</option>
                    <option value="OpenAlex">OpenAlex</option>
                    <option value="Semantic Scholar">Semantic Scholar</option>
                    <option value="CrossRef">CrossRef</option>
                </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-700">Sort:</label>
                <select
                    onChange={(e) => {
                        // Assuming fetchPapers takes a sort parameter eventually, 
                        // for now we'll rely on the URL search params if needed
                        // or just trigger re-fetch with a new filter field
                        onFilterChange({ ...filters, sort: e.target.value } as any);
                    }}
                    className="bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 p-2.5 outline-none"
                >
                    <option value="relevance">Relevance</option>
                    <option value="citations">Most Cited</option>
                    <option value="newest">Newest First</option>
                </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.isFree || false}
                        onChange={(e) => onFilterChange({ ...filters, isFree: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-xs font-bold text-slate-700 uppercase tracking-wider">Free Access Only</span>
                </label>
            </div>
        </div>
    );
}
