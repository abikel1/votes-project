// src/routes/upload_routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// --- הגדרות נתיבים ---
const ROOT = path.join(__dirname, '..', '..');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// קונפיג שמחזיר בסיס ציבורי נכון ל-URL שמוחזר ללקוח.
// אפשר לקבוע משתנה סביבה UPLOAD_PUBLIC_BASE, אחרת fallback ל-3000.
const PUBLIC_BASE =
  process.env.UPLOAD_PUBLIC_BASE ||
  `http://localhost:${process.env.PORT || 3000}`;

// --- Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const orig = (file.originalname || 'img').replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
    const ext = path.extname(orig) || '.jpg';
    const base = orig.replace(ext, '').slice(0, 40) || 'img';
    cb(null, `cand_${Date.now()}_${base}${ext.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpe?g|png|gif|webp)/i.test(file.mimetype || '');
    cb(ok ? null : new Error('Only image files are allowed'));
  },
});

// --- מחיקת קובץ ישן בצורה חסינה ---
function safeDeleteOld(oldVal) {
  if (!oldVal) return;

  try {
    // תתמכי בשלושה פורמטים: URL מלא, נתיב יחסי ("/uploads/xxx"), או שם קובץ בלבד.
    let rel = String(oldVal);

    // אם הגיע URL מקודד – נפרק אותו.
    try { rel = decodeURIComponent(rel); } catch {}

    // אם יש "/uploads/..." נוציא את החלק שאחריו
    const idx = rel.indexOf('/uploads/');
    if (idx !== -1) {
      rel = rel.slice(idx + '/uploads/'.length);
    }

    // השאירי רק את הקובץ (למנוע ../)
    rel = path.basename(rel);

    if (!rel) return;

    const abs = path.join(UPLOADS_DIR, rel);
    if (abs.startsWith(UPLOADS_DIR) && fs.existsSync(abs)) {
      fs.unlinkSync(abs);
    }
  } catch (e) {
    console.warn('delete old upload failed:', e.message);
  }
}

// --- המסלול עצמו ---
// תומך בפרמטר old בקוורי או בגוף form-data (oldUrl/old)
router.post('/', upload.single('image'), (req, res) => {
  try {
    const oldUrl = req.query.old || req.body.old || req.body.oldUrl || '';
    if (oldUrl) safeDeleteOld(oldUrl);

    if (!req.file) return res.status(400).json({ message: 'No file' });

    const url = `${PUBLIC_BASE}/uploads/${req.file.filename}`;
    return res.status(201).json({ url, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// ממיר שגיאות Multer לתשובת 400 במקום 500
router.use((err, req, res, _next) => {
  if (err && (err.name === 'MulterError' || /Only image files/.test(err.message))) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Upload failed', error: err?.message || String(err) });
});

module.exports = router;
