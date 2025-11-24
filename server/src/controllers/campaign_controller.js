// src/controllers/campaignController.js
const campaignService = require('../services/campaign_service');

async function getCampaign(req, res) {
  const { candidateId } = req.params;
  try {
    const campaign = await campaignService.getCampaignByCandidate(candidateId);
    if (!campaign) return res.status(404).json({ message: 'קמפיין לא נמצא' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createCampaign(req, res) {
  const { candidateId } = req.params;
  const data = req.body;
  try {
    const campaign = await campaignService.createCampaign(candidateId, data);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateCampaign(req, res) {
  const { campaignId } = req.params;
  const data = req.body;
  try {
    const campaign = await campaignService.updateCampaign(campaignId, data);
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getCampaign,
  createCampaign,
  updateCampaign,
};
