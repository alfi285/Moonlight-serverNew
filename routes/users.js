const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const verifyToken = require("../middleware/verifyToken"); // 

// UPDATE user
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

//  DELETE user
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

// GET a user by ID or username
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

// GET a user by ID only (e.g., /api/users/123)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//  FOLLOW a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id); // person to be followed
      const currentUser = await User.findById(req.body.userId); // person who follows

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

//  UNFOLLOW a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id); // person to be unfollowed
      const currentUser = await User.findById(req.body.userId); // person who unfollows

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

//  In your user route file (e.g. users.js)
router.get("/suggestions", verifyToken, async (req, res) => {
  try {
    console.log("🔐 Authenticated user:", req.user);
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json("User not found");

    const users = await User.find({
      _id: { $nin: [...currentUser.followings, req.user.id] },
    }).select("-password").limit(5);

    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Suggestion fetch failed:", err.message);
    res.status(500).json("Server Error");
  }
});



module.exports = router;
