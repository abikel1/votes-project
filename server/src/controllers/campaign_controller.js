// server/src/controllers/campaign_controller.js
const campaignService = require('../services/campaign_service');
const { generateCampaignPostForCandidate } = require('../services/ai_service');
const Group = require('../models/group_model'); // 👈 לוודא שיש כזה

async function getCampaign(req, res) {
  try {
    const currentUserId = req.user?._id;
    const { candidateId } = req.params;

    const campaign =
      await campaignService.getCampaignByCandidate(
        candidateId,
        currentUserId
      );

    const candidate = campaign.candidate;

    // מזהה הקבוצה של המועמד/ת
    const groupId = candidate.groupId || candidate.group;
    if (!groupId) {
      return res.status(500).json({
        message: 'לקמפיין אין קבוצה משויכת',
      });
    }

    const group = await Group.findById(groupId).lean();
    if (!group) {
      return res.status(404).json({ message: 'קבוצה לא נמצאה' });
    }

    // 🔒 האם הקבוצה נעולה
    const isLocked = !!group.isLocked;

    // 👥 האם המשתמש/ת חברה בקבוצה
    const isMember =
      Array.isArray(group.members) &&
      group.members.some((m) =>
        m.user
          ? String(m.user) === String(currentUserId)
          : String(m) === String(currentUserId)
      );

    // 👤 פרטי המשתמש/ת הנוכחית
    const myEmail = (req.user?.email || '').trim().toLowerCase();
    const myId = String(currentUserId || '');

    // 👑 פרטי בעלת הקבוצה (לפי כל האפשרויות במודל)
    const createdByEmail = (
      group.createdBy ??
      group.created_by ??
      group.createdByEmail ??
      group.ownerEmail ??
      group.owner ??
      ''
    )
      .trim()
      .toLowerCase();

    const createdById = String(group.createdById || '');

    // 👑 האם המשתמש/ת אדמין
    const isAdmin = req.user?.role === 'admin' || req.user?.isAdmin;

    // 👑 האם המשתמש/ת בעלת הקבוצה (או אדמין)
    const isOwner =
      isAdmin ||
      !!group.isOwner ||
      (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
      (!!myId && !!createdById && myId === createdById);

    // ❌ אם הקבוצה נעולה, ולא חברה, ולא בעלת הקבוצה → חוסמים
    if (isLocked && !isMember && !isOwner) {
      return res.status(403).json({
        ok: false,
        code: 'GROUP_LOCKED',
        message:
          'הקבוצה נעולה. כדי לצפות בקמפיין עליך לבקש להצטרף לקבוצה.',
        groupId: String(groupId),
      });
    }

    // ✅ מותר לצפות בקמפיין
    return res.json({
      success: true,
      campaign,
      candidate: campaign.candidate,
      campaignId: campaign._id,
    });
  } catch (err) {
    console.error('getCampaign error:', err);
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

// 🆕 ===== תגובות =====
async function addComment(req, res) {
  try {
    const { campaignId, postId } = req.params;
    const { content } = req.body;

    // ✅ הבאת ה-ID של המשתמש מהמ middleware
    const userId = req.user._id;

    const campaign = await campaignService.addCommentToPost(
      campaignId,
      postId,
      userId,
      content
    );

    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


async function deleteComment(req, res) {
  try {
    const { campaignId, postId, commentId } = req.params;

    const campaign = await campaignService.deleteComment(
      campaignId,
      postId,
      commentId
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

async function likeCampaign(req, res) {
  const userId = req.user._id;
  const { campaignId } = req.params;

  const updated = await campaignService.likeCampaign(campaignId, userId);
  res.json(updated);
}

async function unlikeCampaign(req, res) {
  const userId = req.user._id;
  const { campaignId } = req.params;

  const updated = await campaignService.unlikeCampaign(campaignId, userId);
  res.json(updated);
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
  addComment,    // 🆕
  deleteComment, // 🆕
  likeCampaign,
  unlikeCampaign
};