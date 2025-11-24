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

async function addPostToCampaign(campaignId, post) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  // הפוסט שאת מוסיפה
  campaign.posts.push({
    title: post.title,
    content: post.content,
    createdAt: new Date()
  });

  await campaign.save();
  return campaign;
}

module.exports = {
  getCampaignByCandidate,
  createCampaign,
  updateCampaign,
  addPostToCampaign
};
