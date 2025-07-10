const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const verifyToken = require("../middleware/verifyToken");

// ✅ 1. UPDATE user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.user?.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }

    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

// ✅ 2. DELETE user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.user?.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

// ✅ 3. GET user by username or userId (query params)
router.get("/", async (req, res) => {
  const { username, userId } = req.query;
  try {
    const user = username
      ? await User.findOne({ username })
      : await User.findById(userId);
    if (!user) return res.status(404).json("User not found");

    const { password, updatedAt, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ 4. SUGGESTIONS route (must come BEFORE "/:id")
router.get("/suggestions", verifyToken, async (req, res) => {
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

// ✅ 5. GET user by ID ("/:id" must come AFTER /suggestions)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ 6. FOLLOW a user
router.put("/:id/follow",verifyToken, async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

// ✅ 7. UNFOLLOW a user
router.put("/:id/unfollow",verifyToken, async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You don't follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't unfollow yourself");
  }
});

module.exports = router;
