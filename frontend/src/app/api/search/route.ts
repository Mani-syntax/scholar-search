import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Paper = {
  title: string;
  authors: { name: string; id?: string }[];
  abstract: string;
  journal: string;
  year: number;
  doi?: string;
  sourceUrl?: string;
  pdfUrl?: string;
  sourceName: string;
  sources?: string[];
  paperType: 'Review' | 'Research' | 'Unknown';
  isFree: boolean;
  citations?: number;
};

const requestJson = async (url: string) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Research-Scholar/1.0 (academic search)' },
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Upstream request failed: ${response.status}`);
  return response.json();
};

const paperType = (title: string, type?: string) =>
  ['review', 'survey-article', 'meta-analysis'].includes(type || '') || /\b(review|systematic review|meta-analysis)\b/i.test(title)
    ? 'Review'
    : 'Research';

const openAlexPapers = async (query: string, authorSearch: boolean): Promise<Paper[]> => {
  const params = new URLSearchParams({ per_page: '25', mailto: 'research-scholar@vercel.app' });
  if (authorSearch) params.set('filter', `author.search:${query}`);
  else params.set('search', query);
  const data = await requestJson(`https://api.openalex.org/works?${params}`);

  return (data.results || []).map((work: any) => ({
    title: work.display_name || 'Untitled',
    authors: (work.authorships || []).map((authorship: any) => ({
      name: authorship.author?.display_name || 'Unknown author',
      id: authorship.author?.id,
    })),
    abstract: 'No abstract available',
    journal: work.primary_location?.source?.display_name || 'Unknown venue',
    year: work.publication_year || 0,
    doi: work.doi || undefined,
    sourceUrl: work.doi || work.primary_location?.landing_page_url || undefined,
    pdfUrl: work.open_access?.oa_url || undefined,
    sourceName: 'OpenAlex',
    sources: ['OpenAlex'],
    paperType: paperType(work.display_name || '', work.type),
    isFree: Boolean(work.open_access?.is_oa),
    citations: work.cited_by_count || 0,
  }));
};

const crossrefPapers = async (query: string, authorSearch: boolean): Promise<Paper[]> => {
  const params = new URLSearchParams({ rows: '15' });
  params.set(authorSearch ? 'query.author' : 'query', query);
  const data = await requestJson(`https://api.crossref.org/works?${params}`);

  return (data.message?.items || []).map((item: any) => {
    const title = item.title?.[0] || 'Untitled';
    const doi = item.DOI ? `https://doi.org/${item.DOI}` : undefined;
    return {
      title,
      authors: (item.author || []).map((author: any) => ({ name: `${author.given || ''} ${author.family || ''}`.trim() || 'Unknown author' })),
      abstract: 'No abstract available',
      journal: item['container-title']?.[0] || 'Unknown venue',
      year: item.published?.['date-parts']?.[0]?.[0] || item.created?.['date-parts']?.[0]?.[0] || 0,
      doi,
      sourceUrl: item.resource?.primary?.URL || item.URL || doi,
      sourceName: 'Crossref',
      sources: ['Crossref'],
      paperType: paperType(title),
      isFree: false,
      citations: item['is-referenced-by-count'] || 0,
    };
  });
};

const deduplicate = (papers: Paper[]) => {
  const seen = new Set<string>();
  return papers.filter((paper) => {
    const key = (paper.doi || paper.title).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q')?.trim();
  if (!query) return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });

  const authorSearch = searchParams.get('searchType') === 'author';
  const [openAlex, crossref] = await Promise.allSettled([
    openAlexPapers(query, authorSearch),
    crossrefPapers(query, authorSearch),
  ]);
  const papers = deduplicate([
    ...(openAlex.status === 'fulfilled' ? openAlex.value : []),
    ...(crossref.status === 'fulfilled' ? crossref.value : []),
  ]);

  // Report an upstream outage only when every provider failed; an empty result
  // is a valid search result and should not look like an application failure.
  if (openAlex.status === 'rejected' && crossref.status === 'rejected') {
    return NextResponse.json({ error: 'Research providers are temporarily unavailable' }, { status: 502 });
  }

  const year = searchParams.get('year');
  const type = searchParams.get('type');
  const source = searchParams.get('source');
  const isFree = searchParams.get('isFree') === 'true';
  let filtered = papers.filter((paper) =>
    (!year || paper.year === Number(year)) &&
    (!type || paper.paperType === type) &&
    (!source || paper.sourceName.toLowerCase() === source.toLowerCase()) &&
    (!isFree || paper.isFree || Boolean(paper.pdfUrl)),
  );
  if (searchParams.get('sort') === 'citations') filtered = filtered.sort((a, b) => (b.citations || 0) - (a.citations || 0));
  if (searchParams.get('sort') === 'newest') filtered = filtered.sort((a, b) => b.year - a.year);

  return NextResponse.json(filtered);
}
