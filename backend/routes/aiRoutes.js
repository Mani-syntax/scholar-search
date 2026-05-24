const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const GeneratedOutput = require('../models/GeneratedOutput');
const auth = require('../middleware/auth'); // If we want to secure it, but for now we'll allow an optional user

// Generic handler for AI generation to handle caching in DB
const handleAIGeneration = async (req, res, generateFn, type) => {
    try {
        const { paperId, abstract, content, writingType } = req.body;
        const pId = paperId || 'custom';
        
        const inputContent = abstract || content;
        if (!inputContent) {
            return res.status(400).json({ error: 'Input content (abstract or content) is required' });
        }

        let result;
        if (type === 'writing') {
            result = await generateFn(writingType || 'general', inputContent);
        } else {
            result = await generateFn(inputContent);
        }
        
        // Save to DB asynchronously
        try {
            const output = new GeneratedOutput({
                paperId: pId,
                type: type,
                content: result,
                promptUsed: type,
                // user: req.user?.id // Set if using auth middleware
            });
            await output.save();
        } catch (dbErr) {
            console.error('Failed to save AI output to DB', dbErr);
        }

        res.json({ result });
    } catch (error) {
        console.error(`AI ${type} Error:`, error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
};

router.post('/summarize', (req, res) => handleAIGeneration(req, res, aiService.generateExplanation, 'explanation'));
router.post('/next-steps', (req, res) => handleAIGeneration(req, res, aiService.generateNextSteps, 'next_steps'));
router.post('/implementation', (req, res) => handleAIGeneration(req, res, aiService.generateImplementation, 'implementation'));
router.post('/gap-analysis', (req, res) => handleAIGeneration(req, res, aiService.generateGapAnalysis, 'gaps'));
router.post('/writing', (req, res) => handleAIGeneration(req, res, aiService.generateWritingAssist, 'writing'));

// Dummy route for fetching paper details by ID for now 
router.get('/paper-details/:id', (req, res) => {
    res.json({ status: 'ok', id: req.params.id, message: 'Paper details fetching from semantic/openalex mock' });
});

module.exports = router;
