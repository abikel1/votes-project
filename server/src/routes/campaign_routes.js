// src/routes/campaign_routes.js
const express = require('express');
const router = express.Router();
// const campaignController = require('../controllers/campaign_controller');

const {
  getCampaign,
  createCampaign,
  updateCampaign,
} = require('../controllers/campaign_controller');

// קמפיין של מועמד
router.get('/candidate/:candidateId', getCampaign);

// יצירת קמפיין למועמד
router.post('/candidate/:candidateId', createCampaign);

// עדכון קמפיין
router.put('/:campaignId', updateCampaign);

router.put('/:campaignId/posts', campaignController.addPost);


module.exports = router;
