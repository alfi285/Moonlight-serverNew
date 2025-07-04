const router = require('express').Router();
const User = require('../../models/User');
const verifyToken = require('../../middleware/verifyToken');

router.get("/", verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const users = await User.find({
      _id: { $nin: [...currentUser.followings, req.user.id] },
    }).select("-password").limit(20);

    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Suggestion fetch failed:", err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
