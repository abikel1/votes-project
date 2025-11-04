const { createGroupWithCandidates } = require('../services/groupService');

async function createGroup(req, res) {
  try {
    const { groupData, candidatesData } = req.body;
    const group = await createGroupWithCandidates(groupData, candidatesData);
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating group' });
  }
}

module.exports = {
  createGroup
};

