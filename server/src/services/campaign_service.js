// server/src/services/campaign_service.js
const Campaign = require('../models/campaign_model');

async function getCampaignByCandidate(candidateId) {
  let campaign = await Campaign.findOne({ candidate: candidateId })
    .populate("candidate")
    .populate("posts.comments.user", "name photoUrl") // 🆕 populate למשתמשים בתגובות
    .lean();

  if (!campaign) {
    const newCampaign = await Campaign.create({
      candidate: candidateId,
      description: "",
      posts: [],
      gallery: [],
      viewCount: 0,
    });

    campaign = await Campaign.findById(newCampaign._id)
      .populate("candidate")
      .populate("posts.comments.user", "name photoUrl")
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

// ===== פוסטים =====
async function addPostToCampaign(campaignId, post) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  campaign.posts.push({
    title: post.title,
    content: post.content,
    image: post.image,
    youtubeUrl: post.youtubeUrl || '', // 🆕
    comments: [], // 🆕
    createdAt: new Date()
  });

  await campaign.save();
  
  // 🆕 החזרת קמפיין עם populate
  return Campaign.findById(campaignId)
    .populate("candidate")
    .populate("posts.comments.user", "name photoUrl");
}

async function updatePost(campaignId, postId, postData) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  const post = campaign.posts.id(postId);
  if (!post) throw new Error("פוסט לא נמצא");

  post.title = postData.title ?? post.title;
  post.content = postData.content ?? post.content;
  post.image = postData.image ?? post.image;
  post.youtubeUrl = postData.youtubeUrl ?? post.youtubeUrl; // 🆕

  await campaign.save();
  
  return Campaign.findById(campaignId)
    .populate("candidate")
    .populate("posts.comments.user", "name photoUrl");
}

async function deletePost(campaignId, postId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  campaign.posts = campaign.posts.filter(p => p._id.toString() !== postId);
  await campaign.save();
  
  return Campaign.findById(campaignId)
    .populate("candidate")
    .populate("posts.comments.user", "name photoUrl");
}

// 🆕 ===== תגובות =====
async function addCommentToPost(campaignId, postId, userId, content) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  const post = campaign.posts.id(postId);
  if (!post) throw new Error("פוסט לא נמצא");

  post.comments.push({
    user: userId,
    content: content,
    createdAt: new Date()
  });

  await campaign.save();
  
  return Campaign.findById(campaignId)
    .populate("candidate")
    .populate("posts.comments.user", "name photoUrl");
}

async function deleteComment(campaignId, postId, commentId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  const post = campaign.posts.id(postId);
  if (!post) throw new Error("פוסט לא נמצא");

  post.comments = post.comments.filter(c => c._id.toString() !== commentId);
  
  await campaign.save();
  
  return Campaign.findById(campaignId)
    .populate("candidate")
    .populate("posts.comments.user", "name photoUrl");
}

// ===== גלריית תמונות =====
async function addImageToGallery(campaignId, imageUrl) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  campaign.gallery.push(imageUrl);
  await campaign.save();
  return campaign;
}

async function deleteImageFromGallery(campaignId, imageUrl) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  campaign.gallery = campaign.gallery.filter(img => img !== imageUrl);
  await campaign.save();
  return campaign;
}

// ===== צפיות =====
async function incrementViewCount(campaignId) {
  const campaign = await Campaign.findByIdAndUpdate(
    campaignId,
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate('candidate')
    .populate("posts.comments.user", "name photoUrl");

  if (!campaign) throw new Error('קמפיין לא נמצא');

  return campaign;
}

module.exports = {
  getCampaignByCandidate,
  createCampaign,
  updateCampaign,
  addPostToCampaign,
  updatePost,
  deletePost,
  addImageToGallery,
  deleteImageFromGallery,
  incrementViewCount,
  addCommentToPost, // 🆕
  deleteComment,    // 🆕
};