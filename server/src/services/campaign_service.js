const Campaign = require('../models/campaign_model');

async function getCampaignByCandidate(candidateId) {
  let campaign = await Campaign.findOne({ candidate: candidateId })
    .populate("candidate")
    .lean();

  if (!campaign) {
    const newCampaign = await Campaign.create({
      candidate: candidateId,
      description: "",
      posts: [],
      gallery: []
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

// ===== פוסטים =====
async function addPostToCampaign(campaignId, post) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  campaign.posts.push({
    title: post.title,
    content: post.content,
    image: post.image,
    createdAt: new Date()
  });

  await campaign.save();
  return campaign;
}

async function updatePost(campaignId, postId, postData) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  const post = campaign.posts.id(postId);
  if (!post) throw new Error("פוסט לא נמצא");

  post.title = postData.title ?? post.title;
  post.content = postData.content ?? post.content;
  post.image = postData.image ?? post.image;

  await campaign.save();
  return campaign;
}

async function deletePost(campaignId, postId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("קמפיין לא נמצא");

  console.log("Posts in campaign:", campaign.posts.map(p => p._id.toString()));
  const post = campaign.posts.id(postId);
  if (!post) throw new Error("פוסט לא נמצא בקמפיין");

 campaign.posts = campaign.posts.filter(p => p._id.toString() !== postId);
await campaign.save();
return campaign;

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

module.exports = {
  getCampaignByCandidate,
  createCampaign,
  updateCampaign,
  addPostToCampaign,
  updatePost,
  deletePost,
  addImageToGallery,
  deleteImageFromGallery
};
