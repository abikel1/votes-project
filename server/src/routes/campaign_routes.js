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
  deleteImage
} = require('../controllers/campaign_controller');

// קמפיין של מועמד
router.get('/candidate/:candidateId', getCampaign);

// יצירת קמפיין למועמד
router.post('/candidate/:candidateId', createCampaign);

// עדכון קמפיין
router.put('/:campaignId', updateCampaign);

// ===== פוסטים =====
router.put('/:campaignId/posts', addPost);
router.put('/:campaignId/posts/:postId', updatePost);
router.delete('/:campaignId/posts/:postId', deletePost);

// ===== גלריית תמונות =====
router.put('/:campaignId/gallery', addImage);
router.delete('/:campaignId/gallery', deleteImage);

module.exports = router;
