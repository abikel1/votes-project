const {
  createGroupService,
  updateGroupService,
  deleteGroupService,
  getGroupByIdService,
  getAllGroupsService
} = require('../services/group_service');

// יצירת קבוצה
async function createGroup(req, res) {
  try {
    const group = await createGroupService(req.body);
    res.status(201).json(group);
  } catch (err) {
    console.error('❌ Error creating group:', err);
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
}

// עריכת קבוצה
async function updateGroup(req, res) {
  try {
    const group = await updateGroupService(req.params.id, req.body);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    console.error('❌ Error updating group:', err);
    res.status(500).json({ message: 'Error updating group', error: err.message });
  }
}

// מחיקת קבוצה
async function deleteGroup(req, res) {
  try {
    const group = await deleteGroupService(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting group:', err);
    res.status(500).json({ message: 'Error deleting group', error: err.message });
  }
}

// קבלת קבוצה לפי ID
async function getGroupById(req, res) {
  try {
    const group = await getGroupByIdService(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    console.error('❌ Error getting group:', err);
    res.status(500).json({ message: 'Error getting group', error: err.message });
  }
}

// קבלת כל הקבוצות
async function getAllGroups(req, res) {
  try {
    const groups = await getAllGroupsService();
    res.json(groups);
  } catch (err) {
    console.error('❌ Error getting groups:', err);
    res.status(500).json({ message: 'Error getting groups', error: err.message });
  }
}

module.exports = {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  getAllGroups
};
