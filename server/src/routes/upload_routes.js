// server/src/routes/upload_routes.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinaryConfig"); // אם ב-CJS: require
const { Readable } = require("stream");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const stream = cloudinary.uploader.upload_stream(
    { folder: "votes-project" },
    (err, uploaded) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ url: uploaded.secure_url });
    }
  );

  // סיום הזרימה
  const bufferStream = new Readable();
  bufferStream.push(req.file.buffer);
  bufferStream.push(null);
  bufferStream.pipe(stream);
});

module.exports = router; // ✅ חובה: export router
