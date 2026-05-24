const axios = require('axios');

const OPENALEX_API = 'https://api.openalex.org/works';

const searchOpenAlex = async (query, email, searchType) => {
    try {
        const params = {
            mailto: email || 'your_email@example.com'
        };

        if (searchType === 'author') {
            // Search by author name using OpenAlex filter
            params.filter = `author.search:${query}`;
        } else {
            params.search = query;
        }

        const response = await axios.get(OPENALEX_API, { params });
        console.log(`OpenAlex found ${response.data.results.length} papers for "${query}"`);

        return response.data.results.map(work => ({
            title: work.display_name,
            authors: work.authorships.map(a => ({ name: a.author.display_name, id: a.author.id })),
            abstract: work.abstract_inverted_index ? reconstructAbstract(work.abstract_inverted_index) : 'No abstract available',
            journal: work.primary_location?.source?.display_name || 'Unknown',
            year: work.publication_year,
            doi: work.doi,
            sourceUrl: work.doi || work.primary_location?.landing_page_url,
            pdfUrl: work.open_access?.oa_url,
            sourceName: 'OpenAlex',
            isFree: work.open_access?.is_oa || false,
            paperType: determinePaperType(work),
            citations: work.cited_by_count || 0,
            externalIds: {
                pmid: work.ids?.pmid,
                doi: work.ids?.doi,
                scopus: work.ids?.scopus
            }
        }));
    } catch (error) {
        console.error('OpenAlex API Error:', error.message);
        return [];
    }
};

const reconstructAbstract = (invertedIndex) => {
    const words = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
        positions.forEach(pos => words[pos] = word);
    }
    return words.join(' ');
};

const determinePaperType = (work) => {
    const type_id = work.type;
    if (['review', 'survey-article', 'meta-analysis'].includes(type_id)) return 'Review';
    const titleLower = work.display_name.toLowerCase();
    if (titleLower.includes('review') || titleLower.includes('systematic review') || titleLower.includes('meta-analysis')) return 'Review';
    return 'Research';
};

module.exports = { searchOpenAlex };
