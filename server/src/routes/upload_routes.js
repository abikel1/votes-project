const express = require('express');
const router = express.Router();
const multer = require('multer');

// 🔹 שמירה בזיכרון (לא בדיסק)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // עד 10MB
  fileFilter: (req, file, cb) => {
    const ok = /^image\//i.test(file.mimetype || '');
    if (ok) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// 🔹 POST /api/upload – מחזיר data URL
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file' });
    }

    const mime = req.file.mimetype || 'image/jpeg';
    const base64 = req.file.buffer.toString('base64');

    const dataUrl = `data:${mime};base64,${base64}`;

    return res.status(201).json({ url: dataUrl });
  } catch (err) {
    console.error('Upload failed:', err);
    return res.status(500).json({
      message: 'Upload failed',
      error: err?.message || String(err),
    });
  }
});

// טיפול בשגיאות multer
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
