/**
 * Text Similarity Service
 * Uses TF-IDF + Cosine Similarity to compare user content against paper abstracts.
 */

/**
 * Tokenize and normalize text: lowercase, remove punctuation, split into words, remove stopwords.
 */
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall',
    'can', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'we', 'you', 'he', 'she',
    'they', 'me', 'him', 'her', 'us', 'them', 'my', 'our', 'your', 'his', 'their',
    'not', 'no', 'nor', 'as', 'if', 'then', 'than', 'so', 'such', 'both', 'each',
    'all', 'any', 'few', 'more', 'most', 'other', 'some', 'only', 'own', 'same',
    'also', 'about', 'up', 'out', 'into', 'over', 'after', 'before', 'between',
    'under', 'above', 'very', 'just', 'because', 'through', 'during', 'while'
]);

const tokenize = (text) => {
    if (!text || typeof text !== 'string') return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && !STOP_WORDS.has(word));
};

/**
 * Compute term frequency for a list of tokens.
 */
const computeTF = (tokens) => {
    const tf = {};
    tokens.forEach(token => {
        tf[token] = (tf[token] || 0) + 1;
    });
    const total = tokens.length || 1;
    for (const term in tf) {
        tf[term] /= total;
    }
    return tf;
};

/**
 * Compute inverse document frequency across all documents.
 */
const computeIDF = (documents) => {
    const idf = {};
    const N = documents.length;
    documents.forEach(tokens => {
        const uniqueTokens = new Set(tokens);
        uniqueTokens.forEach(token => {
            idf[token] = (idf[token] || 0) + 1;
        });
    });
    for (const term in idf) {
        idf[term] = Math.log((N + 1) / (idf[term] + 1)) + 1; // smoothed IDF
    }
    return idf;
};

/**
 * Compute cosine similarity between two TF-IDF vectors.
 */
const cosineSimilarity = (vecA, vecB) => {
    const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    allTerms.forEach(term => {
        const a = vecA[term] || 0;
        const b = vecB[term] || 0;
        dotProduct += a * b;
        magnitudeA += a * a;
        magnitudeB += b * b;
    });

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Calculate similarity scores between user content and an array of papers.
 * Returns papers with an added `similarityScore` field (0-100%).
 */
const calculateSimilarity = (userContent, papers) => {
    if (!userContent || papers.length === 0) return papers;

    const userTokens = tokenize(userContent);
    if (userTokens.length === 0) return papers;

    // Build combined text for each paper (title + abstract)
    const paperTexts = papers.map(paper => {
        const text = `${paper.title || ''} ${paper.abstract || ''}`;
        return tokenize(text);
    });

    // All documents = user content + all paper texts
    const allDocuments = [userTokens, ...paperTexts];
    const idf = computeIDF(allDocuments);

    // Compute TF-IDF for user content
    const userTF = computeTF(userTokens);
    const userTFIDF = {};
    for (const term in userTF) {
        userTFIDF[term] = userTF[term] * (idf[term] || 0);
    }

    // Compute TF-IDF and similarity for each paper
    const scoredPapers = papers.map((paper, index) => {
        const paperTF = computeTF(paperTexts[index]);
        const paperTFIDF = {};
        for (const term in paperTF) {
            paperTFIDF[term] = paperTF[term] * (idf[term] || 0);
        }

        const similarity = cosineSimilarity(userTFIDF, paperTFIDF);
        const similarityScore = Math.round(similarity * 100);

        return {
            ...( paper.toObject ? paper.toObject() : paper ),
            similarityScore
        };
    });

    // Sort by similarity score (highest first)
    scoredPapers.sort((a, b) => b.similarityScore - a.similarityScore);

    return scoredPapers;
};

module.exports = { calculateSimilarity, tokenize };
