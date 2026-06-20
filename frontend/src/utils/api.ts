// Keep the API on the same Vercel deployment by default.  A relative URL works
// in production and in local development, while an explicit URL can still be
// supplied when a separate backend is intentionally deployed.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export type SearchType = 'topic' | 'author' | 'content';

export interface Paper {
    _id?: string;
    title: string;
    authors: { name: string; id?: string }[];
    abstract: string;
    journal: string;
    year: number;
    doi?: string;
    sourceUrl?: string;
    pdfUrl?: string;
    sourceName: string;
    sources?: string[]; // Multiple sources if merged
    paperType: 'Review' | 'Research' | 'Unknown';
    isFree: boolean;
    citations?: number;
    externalIds?: {
        pmid?: string;
        doi?: string;
        scopus?: string;
    };
    similarityScore?: number;
}

export interface Filters {
    year?: string;
    type?: string;
    source?: string;
    isFree?: boolean;
    sort?: string;
}

// ─── Search ────────────────────────────────────────────────────
export const fetchPapers = async (query: string, filters: Filters = {}, searchType: SearchType = 'topic'): Promise<Paper[]> => {
    const queryParams: Record<string, string> = { q: query };
    if (filters.year) queryParams.year = filters.year;
    if (filters.type) queryParams.type = filters.type;
    if (filters.source) queryParams.source = filters.source;
    if (filters.isFree !== undefined) queryParams.isFree = filters.isFree.toString();
    if (filters.sort) queryParams.sort = filters.sort;
    if (searchType === 'author') queryParams.searchType = 'author';
    const params = new URLSearchParams(queryParams);
    const response = await fetch(`${API_BASE_URL}/search?${params}`);
    if (!response.ok) throw new Error('Failed to fetch papers');
    return response.json();
};

export const fetchSimilarPapers = async (content: string): Promise<Paper[]> => {
    const response = await fetch(`${API_BASE_URL}/search/similarity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to fetch similar papers');
    return response.json();
};

// ─── AI Endpoints ──────────────────────────────────────────────
const aiPost = async (endpoint: string, body: object): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`AI request failed: ${endpoint}`);
    const data = await response.json();
    return data.result as string;
};

export const summarizePaper = (abstract: string, paperId?: string) =>
    aiPost('summarize', { abstract, paperId });

export const getNextSteps = (abstract: string, paperId?: string) =>
    aiPost('next-steps', { abstract, paperId });

export const getImplementation = (abstract: string, paperId?: string) =>
    aiPost('implementation', { abstract, paperId });

export const getGapAnalysis = (content: string, paperId?: string) =>
    aiPost('gap-analysis', { content, paperId });

export const getWritingAssist = (writingType: string, content: string) =>
    aiPost('writing', { writingType, content });

// ─── Saved Papers (localStorage) ──────────────────────────────
export const getSavedPapers = (): Paper[] => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('savedPapers') || '[]'); } catch { return []; }
};
export const savePaper = (paper: Paper) => {
    const saved = getSavedPapers();
    const exists = saved.some(p => p.doi === paper.doi && p.title === paper.title);
    if (!exists) localStorage.setItem('savedPapers', JSON.stringify([...saved, paper]));
};
export const unsavePaper = (paper: Paper) => {
    const saved = getSavedPapers().filter(p => !(p.doi === paper.doi && p.title === paper.title));
    localStorage.setItem('savedPapers', JSON.stringify(saved));
};
export const isPaperSaved = (paper: Paper): boolean =>
    getSavedPapers().some(p => p.doi === paper.doi && p.title === paper.title);
