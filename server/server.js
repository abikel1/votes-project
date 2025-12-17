// server/server.js
require('dotenv').config();
const app = require('./app');
app.set('etag', false);
const http = require('http');
const { Server } = require('socket.io');

(async () => {
  // מחבר למונגו דרך db.js (ESM) – לא משנים את db.js
  const { default: connectDB } = await import('./config/db.js');
  await connectDB();

  // יצירת HTTP server מעל האפליקציה של Express
  const server = http.createServer(app);

  // יצירת מופע Socket.IO
  const io = new Server(server, {
    cors: {
      origin: true,        // אפשר להקשיח ל־localhost:5173 וכו' אם תרצי
      credentials: true,
    },
  });

  // לשימוש עתידי אם תרצי לגשת ל־io מתוך app/middlewares
  app.set('io', io);

  // טעינת ה־socket handlers
  require('./src/socket_handlers')(io);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
