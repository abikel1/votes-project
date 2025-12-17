const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.voteapp.online'
    : 'http://localhost:5000';

const userRoutes = require('./src/routes/user_routes');
const candidateRoutes = require('./src/routes/candidate_routes');
const groupRoutes = require('./src/routes/group_routes');
const voteRoutes = require('./src/routes/vote_routes');
const passport = require('./config/google_auth');
const mailRoutes = require('./src/routes/mail_routes');
const authRoutes = require('./src/routes/auth_routes');
const uploadRouter = require('./src/routes/upload_routes');
const campaignRoutes = require('./src/routes/campaign_routes');

const app = express();
// import uploadRouter from "./routes/upload.js";

// ----------------------------------------------------------------------
// 1. CORS — חשוב מאוד! חייב להיות הדבר הראשון לפני כל ה־routes
// ----------------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'https://votes-client-qoux.onrender.com',
  'https://votes-project.onrender.com',

  // הדומיין החדש
  'https://voteapp.online',
  'https://www.voteapp.online',
  'https://api.voteapp.online',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);


// ----------------------------------------------------------------------
// 2. Upload route — חשוב שיבוא לפני express.json()
// ----------------------------------------------------------------------

app.use("/api/upload", uploadRouter);


const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// נתיב להעלאת תמונה
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // החזרת URL
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// אפשרות לגישה לתמונות
app.use("/uploads", express.static(uploadFolder));
// ----------------------------------------------------------------------
// 3. JSON parser
// ----------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----------------------------------------------------------------------
// 4. Google OAuth
// ----------------------------------------------------------------------
app.use(passport.initialize());

// ----------------------------------------------------------------------
// 5. All API routes
// ----------------------------------------------------------------------
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

// Root test
app.get('/', (req, res) => res.send('API is running...'));

module.exports = app;
