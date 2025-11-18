const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// 📌 נתיב לתיקיית uploads
const ROOT = path.join(__dirname, '..', '..');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// 📌 בסיס URL ציבורי שמוחזר לקליינט
const PUBLIC_BASE =
  process.env.UPLOAD_PUBLIC_BASE ||
  `http://localhost:${process.env.PORT || 3000}`;

// 📌 הגדרת multer (שמירת קבצים)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const orig = (file.originalname || 'img')
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/g, '');
    const ext = path.extname(orig) || '.jpg';
    const base = orig.replace(ext, '').slice(0, 40) || 'img';
    cb(null, `cand_${Date.now()}_${base}${ext.toLowerCase()}`);
  },
});

// 📌 קבלה רק של תמונות
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//i.test(file.mimetype || '');
    if (ok) {
      cb(null, true);   // ← תקין
    } else {
      cb(new Error('Only image files are allowed'), false); // ← תקין
    }
  },
});


// 📌 מחיקת תמונה ישנה
function safeDeleteOld(oldVal) {
  if (!oldVal) return;

  try {
    let rel = String(oldVal);
    try { rel = decodeURIComponent(rel); } catch { }

    const idx = rel.indexOf('/uploads/');
    if (idx !== -1) rel = rel.slice(idx + '/uploads/'.length);

    rel = path.basename(rel);
    if (!rel) return;

    const abs = path.join(UPLOADS_DIR, rel);
    if (abs.startsWith(UPLOADS_DIR) && fs.existsSync(abs)) {
      fs.unlinkSync(abs);
    }
  } catch (err) {
    console.warn("Failed to delete old file:", err.message);
  }
}

// 📌 POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  console.log("=== /api/upload called ===");
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);

  // מקבל oldUrl מכל שיטה אפשרית
  const oldUrl =
    req.query.old ||
    req.body.old ||
    req.body.oldUrl ||
    req.body["old"] ||
    '';

  if (oldUrl) {
    safeDeleteOld(oldUrl);
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file" });
  }

  const url = `${PUBLIC_BASE}/uploads/${req.file.filename}`;

  return res.status(201).json({
    url,
    filename: req.file.filename
  });
});

// 📌 טיפול בשגיאות Multer
router.use((err, req, res, _next) => {
  if (err && (err.name === 'MulterError' || /Only image files/.test(err.message))) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({
    message: 'Upload failed',
    error: err?.message || String(err),
  });
});

module.exports = router;
