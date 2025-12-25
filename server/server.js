require('dotenv').config();
const app = require('./app');
app.set('etag', false);
const http = require('http');
const { Server } = require('socket.io');

(async () => {
  const { default: connectDB } = await import('./config/db.js');
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  app.set('io', io);

  require('./src/socket_handlers')(io);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
