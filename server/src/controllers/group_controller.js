const { createGroupService } = require('../services/group_service');

async function createGroup(req, res) {
  try {
    const groupData = req.body;
    const group = await createGroupService(groupData);
    res.status(201).json(group);
  } catch (err) {
    console.error('❌ Error creating group:', err);
    res.status(500).json({ message: 'Error creating group' });
  }
}

module.exports = { createGroup };
