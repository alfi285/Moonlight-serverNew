const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts'); // ✅ Add this
const upload = require('./middleware/upload');
const path = require('path');
const fs = require('fs');
const app = express();
const uploadRoute = require('./routes/upload');
const userRoute = require('./routes/users');
const suggestionsRoute = require('./routes/users/suggestions'); // ✅ correct relative path


dotenv.config();

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Connected to MongoDB..!"))
.catch((err) => console.log(err));

// middleware
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// routes
app.use("/api/auth", authRoute);     // ✅ Auth route
app.use("/api/posts", postRoute);    // ✅ Posts route
app.use('/api/upload', uploadRoute);
app.use("/api/users", userRoute); // ✅ Add this line
app.use("/api/suggestions", suggestionsRoute); // ✅ route is fine






app.listen(3000, () => {
  console.log("Server is running..!");
});
