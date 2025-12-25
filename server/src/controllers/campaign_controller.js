const campaignService = require('../services/campaign_service');
const { generateCampaignPostForCandidate } = require('../services/ai_service');
const Group = require('../models/group_model');
const Candidate = require('../models/candidate_model');

function makeCandidateSlugFromName(name = '') {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

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

    const groupSlug =
      group.slug ||
      group.slugName ||
      (group.name
        ? String(group.name).trim().toLowerCase().replace(/\s+/g, '-')
        : '');

    const isLocked = !!group.isLocked;

    const isMember =
      Array.isArray(group.members) &&
      group.members.some((m) =>
        m.user
          ? String(m.user) === String(currentUserId)
          : String(m) === String(currentUserId)
      );

    const myEmail = (req.user?.email || '').trim().toLowerCase();
    const myId = String(currentUserId || '');

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

    const isAdmin = req.user?.role === 'admin' || req.user?.isAdmin;

    const isOwner =
      isAdmin ||
      !!group.isOwner ||
      (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
      (!!myId && !!createdById && myId === createdById);

    if (isLocked && !isMember && !isOwner) {
      return res.status(403).json({
        ok: false,
        code: 'GROUP_LOCKED',
        message:
          'הקבוצה נעולה. כדי לצפות בקמפיין עליך לבקש להצטרף לקבוצה.',
        groupId: String(groupId),
      });
    }

    return res.json({
      success: true,
      campaign,
      candidate: campaign.candidate,
      campaignId: campaign._id,
      groupSlug,

    });
  } catch (err) {
    console.error('getCampaign error:', err);
    res.status(500).json({ message: err.message });
  }
}

async function getCampaignBySlug(req, res) {
  try {
    const currentUserId = req.user?._id;
    const { groupSlug, candidateSlug } = req.params;

    const rawGroupSlug = String(groupSlug || '').trim().toLowerCase();
    const encGroupSlug = encodeURIComponent(rawGroupSlug);

    let group = await Group.findOne({
      $or: [
        { slug: rawGroupSlug },
        { slug: encGroupSlug },
        { slugName: rawGroupSlug },
        { slugName: encGroupSlug },
      ],
    }).lean();

    if (!group) {
      const allGroups = await Group.find({}).lean();
      group = allGroups.find((g) => {
        const fromName =
          g.name
            ? String(g.name).trim().toLowerCase().replace(/\s+/g, '-')
            : '';

        return (
          fromName === rawGroupSlug ||
          fromName === encGroupSlug
        );
      });
    }

    if (!group) {
      return res.status(404).json({ message: 'קבוצה לא נמצאה' });
    }

    const groupId = group._id;
    const rawCandidateSlug = String(candidateSlug || '')
      .trim()
      .toLowerCase();
    const encCandidateSlug = encodeURIComponent(rawCandidateSlug);
    let candidate = await Candidate.findOne({
      groupId: group._id,
      slug: candidateSlug,
    }).lean();

    if (!candidate) {
      const candidates = await Candidate.find({ groupId: group._id }).lean();

      candidate = candidates.find((c) => {
        const cSlug =
          c.slug ||
          makeCandidateSlugFromName(c.name || '');
        return cSlug === candidateSlug;
      });
    }

    if (!candidate) {
      return res
        .status(404)
        .json({ message: 'מועמד/ת לא נמצא/ה' });
    }

    const campaign =
      await campaignService.getCampaignByCandidate(
        candidate._id,
        currentUserId
      );
    const isLocked = !!group.isLocked;
    const isMember =
      Array.isArray(group.members) &&
      group.members.some((m) =>
        m.user
          ? String(m.user) === String(currentUserId)
          : String(m) === String(currentUserId)
      );

    const myEmail = (req.user?.email || '').trim().toLowerCase();
    const myId = String(currentUserId || '');

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

    const isAdmin = req.user?.role === 'admin' || req.user?.isAdmin;

    const isOwner =
      isAdmin ||
      !!group.isOwner ||
      (!!myEmail && !!createdByEmail && myEmail === createdByEmail) ||
      (!!myId && !!createdById && myId === createdById);

    if (isLocked && !isMember && !isOwner) {
      return res.status(403).json({
        ok: false,
        code: 'GROUP_LOCKED',
        message:
          'הקבוצה נעולה. כדי לצפות בקמפיין עליך לבקש להצטרף לקבוצה.',
        groupId: String(groupId),
      });
    }
    return res.json({
      success: true,
      campaign,
      candidate,
      campaignId: campaign._id,
    });
  } catch (err) {
    console.error('getCampaignBySlug error:', err);
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

async function addComment(req, res) {
  try {
    const { campaignId, postId } = req.params;
    const { content } = req.body;
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

async function incrementView(req, res) {
  try {
    const campaign = await campaignService.incrementViewCount(req.params.campaignId);
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

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
};