const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
const uploadRoute = require('./routes/upload');
const userRoute = require('./routes/users');
const suggestionsRoute = require('./routes/users/suggestions');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/users", userRoute);
app.use("/api/suggestions", suggestionsRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
