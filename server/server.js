// server/server.js
require('dotenv').config();
const app = require('./app');
const passport = require('passport');
app.use(passport.initialize());


(async () => {
  // מחבר למונגו דרך db.js (ESM) – לא משנים את db.js
  const { default: connectDB } = await import('./config/db.js');
  await connectDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
