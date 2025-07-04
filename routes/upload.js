const express = require('express');
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Create uploads folder if not exists
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload route
router.post('/', verifyToken, upload.single('file'), (req, res) => {
  try {
    return res.status(200).json({ filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
