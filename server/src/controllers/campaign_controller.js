const campaignService = require('../services/campaign_service');
const { generateCampaignPostForCandidate } = require('../services/ai_service');

async function getCampaign(req, res) {
  try {
    const campaign =
      await campaignService.getCampaignByCandidate(req.params.candidateId);
    return res.json({
      success: true,
      campaign,
      candidate: campaign.candidate
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createCampaign(req, res) {
  try {
    const campaign = await campaignService.createCampaign(req.params.candidateId, req.body);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateCampaign(req, res) {
  try {
    const campaign = await campaignService.updateCampaign(req.params.campaignId, req.body);
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ===== פוסטים =====
async function addPost(req, res) {
  try {
    const campaign = await campaignService.addPostToCampaign(
      req.params.campaignId,
      req.body
    );
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updatePost(req, res) {
  try {
    const campaign = await campaignService.updatePost(
      req.params.campaignId,
      req.params.postId,
      req.body
    );
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deletePost(req, res) {
  try {
    const campaign = await campaignService.deletePost(
      req.params.campaignId,
      req.params.postId
    );
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// ===== גלריית תמונות =====
async function addImage(req, res) {
  try {
    const campaign = await campaignService.addImageToGallery(
      req.params.campaignId,
      req.body.imageUrl
    );
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteImage(req, res) {
  try {
    const campaign = await campaignService.deleteImageFromGallery(
      req.params.campaignId,
      req.body.imageUrl
    );
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// ===== צפיות =====
async function incrementView(req, res) {
  try {
    const campaign = await campaignService.incrementViewCount(req.params.campaignId);
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// ===== AI =====
async function getAiPostSuggestion(req, res) {
  try {
    const { candidateId } = req.params;
    const { titleHint, note } = req.body || {};

    const suggestion = await generateCampaignPostForCandidate(candidateId, {
      titleHint,
      note,
    });

    res.json({ ok: true, suggestion });
  } catch (err) {
    console.error('❌ AI error:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
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
};
