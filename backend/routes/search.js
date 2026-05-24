const express = require('express');
const router = express.Router();
const { getSearchResults, getSimilarityResults } = require('../controllers/searchController');

router.get('/', getSearchResults);
router.post('/similarity', getSimilarityResults);

module.exports = router;
