const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// שמירה לקבצים בשרת
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // תיקייה
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//i.test(file.mimetype || '');
    ok ? cb(null, true) : cb(new Error('Only image files allowed'));
  },
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({ url: fileUrl });
});

module.exports = router;
