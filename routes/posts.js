const Post = require('../models/Post');
const User = require('../models/User');
const router = require('express').Router();
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload"); // Multer middleware

//  Create post with image upload
router.post("/", verifyToken, upload.single('img'), async (req, res) => {
  const newPost = new Post({
    userId: req.user.id,
    desc: req.body.desc,
    img: req.file ? req.file.filename : "", //  Save only the image filename
  });

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//  Update post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated!");
    } else {
      res.status(403).json("You can update only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The post has been deleted!");
    } else {
      res.status(403).json("You can delete only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like / Dislike post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/timeline/all", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID required in query." });
  }

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const userPosts = await Post.find({ userId }).sort({ createdAt: -1 });

    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) =>
        Post.find({ userId: friendId }).sort({ createdAt: -1 })
      )
    );

    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    console.error("Timeline fetch error:", err);
    res.status(500).json({ message: "Server error fetching timeline" });
  }
});


// Add comment to a post
router.post("/:id/comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = {
      userId: req.body.userId,
      username: req.body.username,
      text: req.body.text,
    };
    post.comments.push(comment);
    await post.save();
    res.status(200).json("Comment added");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all posts by a user (profile) - newest first
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
