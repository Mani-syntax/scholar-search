const mongoose = require('mongoose');

const ResearcherProfileSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true }, // Scopus ID or WoS ID
  source: { type: String, enum: ['scopus', 'wos'], required: true },
  name: String,
  affiliation: String,
  orcid: String,
  hIndex: Number,
  i10Index: Number,
  totalCitations: Number,
  totalWorks: Number,
  firstYear: Number,
  lastYear: Number,
  topics: [String],
  summaryStats: {
    avgCitations: Number,
    recentCitations: Number
  },
  yearlyStats: [{
    year: Number,
    worksCount: Number,
    citationsCount: Number
  }],
  topJournals: [{
    name: String,
    count: Number
  }],
  works: [{
    title: String,
    year: Number,
    citations: Number,
    journal: String,
    doi: String,
    type: String,
    isOpenAccess: Boolean
  }]
}, { timestamps: true });

module.exports = mongoose.model('ResearcherProfile', ResearcherProfileSchema);
