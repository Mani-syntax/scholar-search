const mongoose = require('mongoose');

const GeneratedOutputSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paperId: String,
  type: { type: String, enum: ['explanation', 'implementation', 'gaps', 'writing', 'next_steps'] },
  content: mongoose.Schema.Types.Mixed,
  promptUsed: String
}, { timestamps: true });

module.exports = mongoose.model('GeneratedOutput', GeneratedOutputSchema);
