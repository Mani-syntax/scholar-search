const mongoose = require('mongoose');

const SavedPaperSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paperDetails: {
    title: String,
    authors: [{ name: String, id: String }],
    abstract: String,
    year: Number,
    doi: String,
    sourceUrl: String,
    sourceName: String
  },
  collectionName: { type: String, default: 'Uncategorized' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('SavedPaper', SavedPaperSchema);
