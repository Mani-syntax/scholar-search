const mongoose = require('mongoose');
const Paper = require('../models/Paper');
const { searchOpenAlex } = require('../services/openalex');
const { searchSemanticScholar } = require('../services/semanticScholar');
const { calculateSimilarity, tokenize } = require('../services/similarity');

const getSearchResults = async (req, res) => {
    const { q, year, type, source, isFree, searchType } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const isDbConnected = mongoose.connection.readyState === 1;
        let cachedPapers = [];

        // 1. Check Cache if DB is connected
        if (isDbConnected) {
            try {
                cachedPapers = await Paper.find({ searchQuery: q.toLowerCase() });
            } catch (dbError) {
                console.error('DB Find Error, skipping cache:', dbError.message);
            }
        }

        if (cachedPapers.length === 0) {
            console.log(isDbConnected ? 'Cache miss for query:' : 'DB offline, skipping cache for query:', q);
            // 2. Fetch from APIs in parallel
            const { searchCrossRef } = require('../services/crossref');
            const { deduplicatePapers } = require('../utils/deduplicator');

            const [openAlexResults, semanticScholarResults, crossRefResults] = await Promise.all([
                searchOpenAlex(q, process.env.OPENALEX_EMAIL, searchType),
                searchSemanticScholar(q, process.env.SEMANTIC_SCHOLAR_API_KEY),
                searchCrossRef(q, searchType)
            ]);

            const allResults = [...openAlexResults, ...semanticScholarResults, ...crossRefResults];
            
            // 3. Deduplicate
            const uniqueResults = deduplicatePapers(allResults);

            // 4. Save to Cache if DB is connected
            if (isDbConnected && uniqueResults.length > 0) {
                const papersToSave = uniqueResults.map(p => ({
                    ...p,
                    searchQuery: q.toLowerCase()
                }));

                await Paper.insertMany(papersToSave, { ordered: false }).catch(err => {
                    console.error('Error saving to cache:', err.message);
                });
                cachedPapers = papersToSave;
            } else {
                cachedPapers = uniqueResults;
            }
        } else {
            console.log('Cache hit for query:', q);
        }

        // 4. Filter Results
        let filteredResults = cachedPapers;

        if (searchType === 'author') {
            const qLower = q.toLowerCase();
            filteredResults = filteredResults.filter(p => 
                p.authors && p.authors.some(a => a.name && a.name.toLowerCase().includes(qLower))
            );
        }

        if (year) {
            filteredResults = filteredResults.filter(p => p.year === parseInt(year));
        }
        if (type) {
            filteredResults = filteredResults.filter(p => p.paperType === type);
        }
        if (source) {
            filteredResults = filteredResults.filter(p => {
                const s = source.toLowerCase();
                if (s === 'scopus') return p.externalIds?.scopus || p.sources?.includes('Scopus');
                if (s === 'wos') return p.externalIds?.doi && p.sources?.includes('OpenAlex'); // Proxy check
                if (s === 'scholar') return true; // Most papers are in Scholar
                return p.sourceName === source || p.sources?.includes(source);
            });
        }
        if (isFree === 'true') {
            filteredResults = filteredResults.filter(p => p.isFree === true || p.pdfUrl);
        }

        // Sort by Citations if requested (Newest by default or if specified)
        const sortBy = req.query.sort || 'relevance';
        if (sortBy === 'citations') {
            filteredResults.sort((a, b) => (b.citations || 0) - (a.citations || 0));
        } else if (sortBy === 'newest') {
            filteredResults.sort((a, b) => (b.year || 0) - (a.year || 0));
        }

        res.json(filteredResults);
    } catch (error) {
        console.error('Search Controller Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Content similarity endpoint
const getSimilarityResults = async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required for similarity matching' });
    }

    try {
        // Extract key terms from the content for searching
        const tokens = tokenize(content);
        if (tokens.length === 0) {
            return res.status(400).json({ error: 'Content does not contain enough meaningful words' });
        }
        const searchTerms = tokens.slice(0, 8).join(' ');

        // Fetch papers using the extracted terms
        const [openAlexResults, semanticScholarResults] = await Promise.all([
            searchOpenAlex(searchTerms, process.env.OPENALEX_EMAIL),
            searchSemanticScholar(searchTerms, process.env.SEMANTIC_SCHOLAR_API_KEY)
        ]);

        const allResults = [...openAlexResults, ...semanticScholarResults];

        // Calculate similarity scores
        let scoredResults = calculateSimilarity(content, allResults);
        
        // Filter out zero similarity to ensure high accuracy
        scoredResults = scoredResults.filter(r => r.similarityScore > 0);

        res.json(scoredResults);
    } catch (error) {
        console.error('Similarity Controller Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getSearchResults, getSimilarityResults };
