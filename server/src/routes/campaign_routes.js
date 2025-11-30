// server/src/routes/campaign_routes.js
const express = require('express');
const router = express.Router();
const {
  getCampaign,
  createCampaign,
  updateCampaign,
  addPost,
  updatePost,
  deletePost,
  addImage,
  deleteImage,
  incrementView,
  getAiPostSuggestion,
} = require('../controllers/campaign_controller');

// קמפיין של מועמד
router.get('/candidate/:candidateId', getCampaign);

// יצירת קמפיין למועמד
router.post('/candidate/:candidateId', createCampaign);

// ✨ הצעת פוסט בעזרת AI
router.post('/candidate/:candidateId/ai-suggest-post', getAiPostSuggestion);

// עדכון קמפיין
router.put('/:campaignId', updateCampaign);

// ===== פוסטים =====
router.put('/:campaignId/posts', addPost);
router.put('/:campaignId/posts/:postId', updatePost);
router.delete('/:campaignId/posts/:postId', deletePost);

// ===== גלריית תמונות =====
router.put('/:campaignId/gallery', addImage);
router.delete('/:campaignId/gallery', deleteImage);

// ===== צפיות =====
router.post('/:campaignId/view', incrementView);

module.exports = router;
