const {
  createGroupService,
  updateGroupService,
  deleteGroupService,
  getGroupByIdService,
  getAllGroupsService,
  getUserGroupsService,
} = require('../services/group_service');

// יצירת קבוצה
async function createGroup(req, res) {
  try {
    const group = await createGroupService(req.body, req.user); // מעבירים את המשתמש מה-auth
    res.status(201).json(group);
  } catch (err) {
    console.error('❌ Error creating group:', err);
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
}

// עדכון קבוצה
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

// קבלת קבוצה לפי מזהה
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

// כל הקבוצות
async function getAllGroups(req, res) {
  try {
    const groups = await getAllGroupsService();
    res.json(groups);
  } catch (err) {
    console.error('❌ Error getting groups:', err);
    res.status(500).json({ message: 'Error getting groups', error: err.message });
  }
}

async function getUserGroups(req, res) {
  try {
    const email = req.user.email; // ← auth מבטיח שיש req.user
    const groups = await getUserGroupsService(email);
    res.json(groups); // { created: [...], joined: [...] }
  } catch (err) {
    console.error('❌ Error getting user groups:', err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  getAllGroups,
  getUserGroups,  // ← ודאי שמייצאים
};



