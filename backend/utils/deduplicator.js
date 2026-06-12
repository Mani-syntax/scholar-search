/**
 * Deduplicates and merges research papers from multiple sources.
 * Uses DOI as the primary key, fallback to normalized title.
 */
function deduplicatePapers(papers) {
  const paperMap = new Map();

  papers.forEach(paper => {
    // Generate a unique key: DOI (normalized) or lowercase title
    const doiKey = paper.doi ? paper.doi.toLowerCase().replace(/https?:\/\/doi\.org\//, '').trim() : null;
    const titleKey = (paper.title || 'Unknown Title').toLowerCase().replace(/[^\w]/g, '').trim();
    const key = doiKey || titleKey;

    if (paperMap.has(key)) {
      const existing = paperMap.get(key);
      
      // 1. Merge source names
      const allSources = new Set(existing.sources || [existing.sourceName]);
      allSources.add(paper.sourceName);
      existing.sources = Array.from(allSources);

      // 2. Prefer richer abstract
      if ((!existing.abstract || existing.abstract === 'No abstract available') && paper.abstract) {
        existing.abstract = paper.abstract;
      }

      // 3. Prefer PDF URL
      if (!existing.pdfUrl && paper.pdfUrl) {
        existing.pdfUrl = paper.pdfUrl;
      }

      // 4. Aggregate external IDs
      existing.externalIds = { 
        ...(existing.externalIds || {}), 
        ...(paper.externalIds || {}) 
      };

      // 5. Keep highest citation count
      if (paper.citations > (existing.citations || 0)) {
        existing.citations = paper.citations;
      }

      // 6. Access priority (Open Access preferred)
      if (paper.isFree) existing.isFree = true;
      
    } else {
      // First time seeing this paper
      paperMap.set(key, {
        ...paper,
        sources: [paper.sourceName]
      });
    }
  });

  return Array.from(paperMap.values());
}

module.exports = { deduplicatePapers };
