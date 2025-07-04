// middleware/upload.js
const multer = require("multer");
const path = require("path");

// Set storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName); // e.g., 16234234234.jpg
  },
});

// Configure multer instance
const upload = multer({ storage });

module.exports = upload;
