const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Route imports
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
const uploadRoute = require('./routes/upload');
const userRoute = require('./routes/users');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://moonlight-client-new.vercel.app';

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ CORS Configuration
const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// ✅ Handle preflight (OPTIONS) requests
app.options('*', cors());

// ✅ Middleware
app.use(express.json());

// ✅ Serve static files (image uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/users", userRoute);


// ✅ Server Listener
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
