const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: [{ name: String, id: String }],
  abstract: String,
  journal: String,
  year: Number,
  doi: String,
  sourceUrl: String,
  sourceName: String,
  paperType: { type: String, enum: ['Review', 'Research', 'Unknown'], default: 'Unknown' },
  isFree: { type: Boolean, default: false },
  classificationConfidence: Number,
  searchQuery: String,
  createdAt: { type: Date, default: Date.now, expires: 86400 * 7 } // Cache for 7 days
});

module.exports = mongoose.model('Paper', PaperSchema);
