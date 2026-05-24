const axios = require('axios');

const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1/paper/search';

const searchSemanticScholar = async (query, apiKey) => {
    try {
        const response = await axios.get(SEMANTIC_SCHOLAR_API, {
            params: {
                query: query,
                fields: 'title,authors,abstract,venue,year,doi,url,isOpenAccess,publicationTypes',
                limit: 20
            },
            headers: apiKey ? { 'x-api-key': apiKey } : {}
        });

        if (!response.data.data) {
            console.log(`Semantic Scholar found 0 papers for "${query}"`);
            return [];
        }

        console.log(`Semantic Scholar found ${response.data.data.length} papers for "${query}"`);

        return response.data.data.map(paper => ({
            title: paper.title,
            authors: paper.authors.map(a => ({ name: a.name, id: a.authorId })),
            abstract: paper.abstract || 'No abstract available',
            journal: paper.venue || 'Unknown',
            year: paper.year,
            doi: paper.doi,
            sourceUrl: paper.url,
            sourceName: 'Semantic Scholar',
            isFree: paper.isOpenAccess || false,
            paperType: determinePaperType(paper)
        }));
    } catch (error) {
        console.error('Semantic Scholar API Error:', error.message);
        return [];
    }
};

const determinePaperType = (paper) => {
    const types = paper.publicationTypes || [];
    if (types.some(t => ['Review', 'MetaAnalysis', 'SystematicReview'].includes(t))) return 'Review';
    const titleLower = paper.title.toLowerCase();
    if (titleLower.includes('review') || titleLower.includes('systematic review') || titleLower.includes('meta-analysis')) return 'Review';
    return 'Research';
};

module.exports = { searchSemanticScholar };
