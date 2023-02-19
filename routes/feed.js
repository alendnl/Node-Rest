const express = require("express");

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");
const { basicPostValidator } = require("../util/validator");

const router = express.Router();

// GET "/feed/posts"
router.get("/posts", isAuth, feedController.getPosts);

// POST "/feed/post"
router.post("/post", isAuth, basicPostValidator, feedController.createPost);

// GET "/feed/post/:postId"
router.get("/post/:postId", isAuth, feedController.getPost);

// PUT "/feed/post/:postId"
router.put(
	"/post/:postId",
	isAuth,
	basicPostValidator,
	feedController.updatePost
);

// DELETE "/feed/post/:postId"
router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
