// src/services/campaignService.js
const Campaign = require('../models/campaign_model');
const Candidate = require('../models/candidate_model');

async function getCampaignByCandidate(candidateId) {
  let campaign = await Campaign.findOne({ candidate: candidateId })
    .populate("candidate") // ← מחזיר את פרטי המועמד
    .lean();

  if (!campaign) {
    const newCampaign = await Campaign.create({
      candidate: candidateId,
      description: "",
      posts: [],
      polls: []
    });

    campaign = await Campaign.findById(newCampaign._id)
      .populate("candidate")
      .lean();
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
