// src/services/campaignService.js
const Campaign = require('../models/campaign_model');

async function getCampaignByCandidate(candidateId) {
  let campaign = await Campaign.findOne({ candidateId });

  // אם אין קמפיין — ניצור חדש
  if (!campaign) {
campaign = await Campaign.create({
  candidate: candidateId,
  description: "",
  posts: [],
  polls: []
});

  }

  return campaign;
}

async function createCampaign(candidateId, data) {
  const campaign = new Campaign({ candidate: candidateId, ...data });
  return campaign.save();
}

async function updateCampaign(campaignId, data) {
  return Campaign.findByIdAndUpdate(campaignId, data, { new: true });
}

module.exports = {
  getCampaignByCandidate,
  createCampaign,
  updateCampaign,
};
