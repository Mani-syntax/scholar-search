const axios = require('axios');

const searchCrossRef = async (query, searchType) => {
    try {
        const queryParam = searchType === 'author' 
            ? `query.author=${encodeURIComponent(query)}` 
            : `query=${encodeURIComponent(query)}`;
        const response = await axios.get(`https://api.crossref.org/works?${queryParam}&rows=15`);
        if (!response.data || !response.data.message || !response.data.message.items) return [];

        const items = response.data.message.items;

        return items.map(item => ({
            title: item.title?.[0] || 'Unknown Title',
            authors: item.author?.map(a => ({ 
                name: `${a.given || ''} ${a.family || ''}`.trim(),
                id: a.ORCID || null 
            })) || [],
            journal: item['container-title']?.[0] || 'Unknown Venue',
            year: item.created?.['date-parts']?.[0]?.[0] || 
                  (item.published && item.published['date-parts'] ? item.published['date-parts'][0][0] : null),
            doi: item.DOI ? `https://doi.org/${item.DOI}` : null,
            sourceUrl: item.resource?.primary?.URL || item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : null),
            sourceName: 'CrossRef',
            isFree: false, // CrossRef doesn't have a reliable single OA field like OpenAlex
            paperType: 'Research'
        }));
    } catch (error) {
        console.error('CrossRef API Error:', error.message);
        return [];
    }
};

module.exports = { searchCrossRef };
