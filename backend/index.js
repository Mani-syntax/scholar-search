require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/search', searchRoutes);
app.use('/api/researcher', require('./routes/researcherRoutes'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        // Continue even if DB fails (for initial testing without DB)
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (DB offline)`);
        });
    });

module.exports = app;
