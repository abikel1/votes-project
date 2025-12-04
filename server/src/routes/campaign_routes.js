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
  addComment,    // 🆕
  deleteComment, // 🆕
  likeCampaign,
  unlikeCampaign

} = require('../controllers/campaign_controller');
const auth = require('../middlewares/auth_middleware');


// קמפיין של מועמד
router.get('/candidate/:candidateId', auth, getCampaign);

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

// 🆕 ===== תגובות =====
router.post('/:campaignId/posts/:postId/comments', auth, addComment);
router.delete('/:campaignId/posts/:postId/comments/:commentId', auth, deleteComment);

// ===== גלריית תמונות =====
router.put('/:campaignId/gallery', addImage);
router.delete('/:campaignId/gallery', deleteImage);

// ===== צפיות =====
router.post('/:campaignId/view', incrementView);
router.post('/:campaignId/like', auth, likeCampaign);
router.post('/:campaignId/unlike', auth, unlikeCampaign);


module.exports = router;