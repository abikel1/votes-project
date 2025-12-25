const express = require('express');
const router = express.Router();
const {
  getCampaign,
  getCampaignBySlug,
  createCampaign,
  updateCampaign,
  addPost,
  updatePost,
  deletePost,
  addImage,
  deleteImage,
  incrementView,
  getAiPostSuggestion,
  addComment,
  deleteComment,
  likeCampaign,
  unlikeCampaign

} = require('../controllers/campaign_controller');
const auth = require('../middlewares/auth_middleware');

router.get('/candidate/:candidateId', auth, getCampaign);

router.get(
  '/by-slug/:groupSlug/:candidateSlug',
  auth,
  getCampaignBySlug
);

router.post('/candidate/:candidateId', createCampaign);
router.post('/candidate/:candidateId/ai-suggest-post', getAiPostSuggestion);
router.put('/:campaignId', updateCampaign);
router.put('/:campaignId/posts', addPost);
router.put('/:campaignId/posts/:postId', updatePost);
router.delete('/:campaignId/posts/:postId', deletePost);
router.post('/:campaignId/posts/:postId/comments', auth, addComment);
router.delete('/:campaignId/posts/:postId/comments/:commentId', auth, deleteComment);
router.put('/:campaignId/gallery', addImage);
router.delete('/:campaignId/gallery', deleteImage);
router.post('/:campaignId/view', incrementView);
router.post('/:campaignId/like', auth, likeCampaign);
router.post('/:campaignId/unlike', auth, unlikeCampaign);


module.exports = router;