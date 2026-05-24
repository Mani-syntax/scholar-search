'use client';
import { useState } from 'react';
import { SearchType } from '@/utils/api';

interface SearchBarProps {
    onSearch: (query: string, searchType: SearchType) => void;
    onContentMatch: (content: string) => void;
    isLoading: boolean;
}

const searchModes: { key: SearchType; label: string; icon: string; description: string }[] = [
    { key: 'topic', label: 'Topic', icon: '📚', description: 'Search by research topic or keyword' },
    { key: 'author', label: 'Author', icon: '👤', description: 'Search papers by author name' },
    { key: 'content', label: 'Content Match', icon: '📊', description: 'Paste text to find similar papers' },
];

export default function SearchBar({ onSearch, onContentMatch, isLoading }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [content, setContent] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('topic');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchType === 'content') {
            if (content.trim()) {
                onContentMatch(content);
            }
        } else {
            if (query.trim()) {
                onSearch(query, searchType);
            }
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8 px-2 md:px-0">
            {/* Search Mode Tabs */}
            <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 p-1 rounded-xl justify-center">
                {searchModes.map((mode) => (
                    <button
                        key={mode.key}
                        onClick={() => setSearchType(mode.key)}
                        className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${
                            searchType === mode.key
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span>{mode.icon}</span>
                        <span>{mode.label}</span>
                    </button>
                ))}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 text-center mb-3">
                {searchModes.find(m => m.key === searchType)?.description}
            </p>

            {/* Search Form */}
            <form onSubmit={handleSubmit}>
                {searchType === 'content' ? (
                    <div className="flex flex-col gap-3">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your abstract, paragraph, or any research content here to find matching papers..."
                            className="w-full px-5 py-4 text-base text-gray-900 placeholder-gray-400 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 shadow-sm resize-none"
                            rows={5}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !content.trim()}
                            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Finding Matches...
                                </div>
                            ) : (
                                '📊 Find Similar Papers'
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="relative flex flex-col md:block gap-3">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={
                                searchType === 'author'
                                    ? "Search by author name..."
                                    : "Search for research topics..."
                            }
                            className="w-full px-5 md:px-6 py-3.5 md:py-4 md:pr-36 text-base md:text-lg text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 shadow-sm"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto md:absolute md:right-3 md:top-3 px-6 py-3.5 md:py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Searching...
                                </div>
                            ) : (
                                'Search'
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
