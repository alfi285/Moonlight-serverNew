// middleware
const multer = require("multer");
const path = require("path");

// Set storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 'uploads' folder 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName); 
  },
});

// Configure multer instance
const upload = multer({ storage });

module.exports = upload;
