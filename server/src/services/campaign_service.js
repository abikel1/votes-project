// src/services/campaignService.js
const Campaign = require('../models/campaign_model');

async function getCampaignByCandidate(candidateId) {
  return Campaign.findOne({ candidate: candidateId });
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
