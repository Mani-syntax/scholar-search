const express = require('express');
const router = express.Router();
const researcherController = require('../controllers/researcherController');

router.post('/analyze', researcherController.analyzeResearcher);

module.exports = router;
