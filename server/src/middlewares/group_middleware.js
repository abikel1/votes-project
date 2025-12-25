module.exports = async function handleGroupDependencies(req, res, next) {
  try {
    console.log('[MIDDLEWARE] Checking group dependencies for group ID:', req.params.id);
    next();
  } catch (err) {
    console.error('❌ Error in handleGroupDependencies middleware:', err);
    res.status(500).json({ message: 'Error while checking group dependencies', error: err.message });
  }
};
