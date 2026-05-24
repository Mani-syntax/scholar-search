const axios = require('axios');
const ResearcherProfile = require('../models/ResearcherProfile');

/**
 * Detects source and extracts ID from a researcher profile link.
 */
function parseProfileUrl(url) {
  if (url.includes('scopus.com')) {
    const match = url.match(/authorId=(\d+)/);
    return { source: 'scopus', externalId: match ? match[1] : null };
  }
  if (url.includes('webofscience.com')) {
    const parts = url.split('/');
    // WoS links often end with ResearcherID or a name string
    return { source: 'wos', externalId: parts[parts.length - 1] };
  }
  return { source: null, externalId: null };
}

/**
 * Process raw OpenAlex data into structured analytics.
 */
function processResearcherData(author, works, source, externalId) {
  const yearlyStatsMap = {};
  const topJournalsMap = {};
  const topics = author.x_concepts ? author.x_concepts.slice(0, 5).map(c => c.display_name) : [];

  works.forEach(work => {
    const year = work.publication_year;
    if (year) {
      if (!yearlyStatsMap[year]) {
        yearlyStatsMap[year] = { year, worksCount: 0, citationsCount: 0 };
      }
      yearlyStatsMap[year].worksCount += 1;
      yearlyStatsMap[year].citationsCount += (work.cited_by_count || 0);
    }

    const journal = work.primary_location?.source?.display_name || 'Other';
    topJournalsMap[journal] = (topJournalsMap[journal] || 0) + 1;
  });

  const yearlyStats = Object.values(yearlyStatsMap).sort((a, b) => a.year - b.year);
  const topJournals = Object.entries(topJournalsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const processedWorks = works.map(work => ({
    title: work.title,
    year: work.publication_year,
    citations: work.cited_by_count,
    journal: work.primary_location?.source?.display_name || 'Other',
    doi: work.doi,
    type: work.type,
    isOpenAccess: work.open_access?.is_oa || false
  }));

  const totalCitations = author.cited_by_count || 0;
  const totalWorks = author.works_count || 0;

  return {
    externalId,
    source,
    name: author.display_name,
    affiliation: author.last_known_institutions?.[0]?.display_name || 'Unknown',
    orcid: author.orcid ? author.orcid.split('/').pop() : '',
    hIndex: author.summary_stats?.h_index || 0,
    i10Index: author.summary_stats?.i10_index || 0,
    totalCitations,
    totalWorks,
    firstYear: yearlyStats[0]?.year,
    lastYear: yearlyStats[yearlyStats.length - 1]?.year,
    topics,
    summaryStats: {
      avgCitations: totalWorks > 0 ? (totalCitations / totalWorks).toFixed(2) : 0,
      recentCitations: author.counts_by_year?.filter(y => y.year >= new Date().getFullYear() - 2).reduce((sum, y) => sum + y.cited_by_count, 0) || 0
    },
    yearlyStats,
    topJournals,
    works: processedWorks.slice(0, 50) // Cache top 50 works for efficiency
  };
}

exports.analyzeResearcher = async (req, res) => {
  const { profileUrl } = req.body;
  console.log('Analyzing researcher profile:', profileUrl);

  try {
    const { source, externalId } = parseProfileUrl(profileUrl);
    console.log('Parsed URL:', { source, externalId });

    if (!externalId) {
      return res.status(400).json({ error: 'Invalid or unsupported profile URL' });
    }

    // 1. Check Cache (only if DB is connected)
    const isDbConnected = require('mongoose').connection.readyState === 1;
    if (isDbConnected) {
      console.log('Checking database cache...');
      const cached = await ResearcherProfile.findOne({ externalId, source });
      if (cached) {
        const diff = Date.now() - cached.updatedAt.getTime();
        if (diff < 7 * 24 * 60 * 60 * 1000) { // 7 days cache
          console.log('Cache hit found');
          return res.json(cached);
        }
      }
    }

    // 2. Fetch from OpenAlex
    let filter = '';
    if (source === 'scopus') {
      filter = `scopus:https://www.scopus.com/authid/detail.uri?authorId=${externalId}`;
    } else if (source === 'wos') {
        // Handle WoS ResearcherID (format: XXX-XXXX-XXXX) vs ORCID
        if (/^[A-Z]{3}-\d{4}-\d{4}$/.test(externalId)) {
            filter = `ids.researcher_id:${externalId}`;
        } else if (/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(externalId)) {
            filter = `orcid:https://orcid.org/${externalId}`;
        } else {
            // Fallback to name search or simple RID check
            filter = `ids.researcher_id:${externalId}`;
        }
    } else {
        if (/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(externalId)) {
            filter = `orcid:https://orcid.org/${externalId}`;
        } else {
             console.log('Performing name search for:', externalId);
             const searchRes = await axios.get(`https://api.openalex.org/authors?search=${encodeURIComponent(externalId)}`);
             if (searchRes.data.results && searchRes.data.results.length > 0) {
                 return fetchFullProfile(searchRes.data.results[0], source, externalId, res);
             }
             return res.status(404).json({ error: 'Researcher not found in OpenAlex database.' });
        }
    }

    console.log('Fetching from OpenAlex with filter:', filter);
    const authorRes = await axios.get(`https://api.openalex.org/authors?filter=${filter}`);
    console.log(`OpenAlex returned ${authorRes.data.results.length} author results`);

    if (!authorRes.data.results || authorRes.data.results.length === 0) {
      return res.status(404).json({ error: 'Researcher not found. Ensure the link is a public profile.' });
    }

    return fetchFullProfile(authorRes.data.results[0], source, externalId, res);

  } catch (error) {
    console.error('Error analyzing researcher:', error.message);
    res.status(500).json({ error: 'Internal server error while analyzing profile.' });
  }
};

async function fetchFullProfile(authorData, source, externalId, res) {
  try {
    const worksUrl = authorData.works_api_url;
    console.log('Fetching works from:', worksUrl);
    const worksRes = await axios.get(`${worksUrl}&per-page=100&sort=cited_by_count:desc`);
    const worksData = worksRes.data.results;
    console.log(`Fetched ${worksData.length} works`);

    const processedData = processResearcherData(authorData, worksData, source, externalId);
    console.log('Data processing complete');

    const isDbConnected = require('mongoose').connection.readyState === 1;
    if (isDbConnected) {
      console.log('Attempting to save to database...');
      await ResearcherProfile.findOneAndUpdate(
        { externalId, source },
        processedData,
        { upsert: true, new: true }
      ).catch(e => console.error('DB Save error:', e.message));
    }

    return res.json(processedData);
  } catch (err) {
    console.error('fetchFullProfile Error:', err.message);
    return res.status(500).json({ error: 'Failed to process researcher profile data.' });
  }
}
