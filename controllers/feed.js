const { validationResult } = require("express-validator");

const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");
const { clearImage } = require("../util/fileHandler");

exports.getPosts = async (request, response, next) => {
	const currentPage = request.query.page || 1;
	const perPage = 2;
	try {
		const totalItems = await Post.find().countDocuments();
		const posts = await Post.find()
			.populate("creator")
			.sort({ createdAt: -1 })
			.skip((currentPage - 1) * perPage)
			.limit(perPage);

		response.status(200).json({
			message: "Fetched posts successfully.",
			posts: posts,
			totalItems: totalItems,
		});
	} catch (error) {
		next(error);
	}
};

exports.createPost = async (request, response, next) => {
	const errors = validationResult(request);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed, entered data is incorrect");
		error.statusCode = 422;
		throw error;
	}
	if (!request.file) {
		const error = new Error("No image provided.");
		error.statusCode = 422;
		throw error;
	}

	const title = request.body.title;
	const content = request.body.content;
	const imageUrl = request.file.path;

	const post = new Post({
		title: title,
		imageUrl: imageUrl,
		content: content,
		creator: request.userId,
	});

	try {
		await post.save();
		const user = await User.findById(request.userId);
		user.posts.push(post);
		await user.save();

		io.getIO().emit("posts", {
			action: "create",
			post: {
				...post._doc,
				creator: { _id: request.userId, name: user.name },
			},
		});
		response.status(201).json({
			message: "Post created successfully!",
			post: post,
			creator: { _id: user._id, name: user.name },
		});
	} catch (error) {
		next(error);
	}
};

exports.getPost = async (request, response, next) => {
	const postId = request.params.postId;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			const error = new Error("Could not find post.");
			error.statusCode = 404;
			throw error;
		}
		response.status(200).json({ message: "Post fetched.", post: post });
	} catch (error) {
		next(error);
	}
};

exports.updatePost = async (request, response, next) => {
	const postId = request.params.postId;

	const errors = validationResult(request);
	if (!errors.isEmpty()) {
		const error = new Error(
			"Validation failed, entered data is incorrect."
		);
		error.statusCode = 422;
		throw error;
	}

	const title = request.body.title;
	const content = request.body.content;
	let imageUrl = request.body.image;

	if (request.file) {
		imageUrl = request.file.path;
	}
	if (!imageUrl) {
		const error = new Error("No file picked.");
		error.statusCode = 422;
		throw error;
	}

	try {
		const post = await Post.findById(postId).populate("creator");
		if (!post) {
			const error = new Error("Could not find post.");
			error.statusCode = 404;
			throw error;
		}
		if (post.creator._id.toString() !== request.userId) {
			const error = new Error("Not authorized!");
			error.statusCode = 403;
			throw error;
		}
		if (imageUrl !== post.imageUrl) {
			clearImage(post.imageUrl);
		}
		post.title = title;
		post.imageUrl = imageUrl;
		post.content = content;
		const result = await post.save();

		io.getIO().emit("posts", { action: "update", post: result });
		response.status(200).json({ message: "Post updated!", post: result });
	} catch (error) {
		next(error);
	}
};

exports.deletePost = async (request, response, next) => {
	const postId = request.params.postId;

	try {
		const post = await Post.findById(postId);

		if (!post) {
			const error = new Error("Could not find post.");
			error.statusCode = 404;
			throw error;
		}
		if (post.creator.toString() !== request.userId) {
			const error = new Error("Not authorized!");
			error.statusCode = 403;
			throw error;
		}

		clearImage(post.imageUrl);
		await Post.findByIdAndRemove(postId);
		const user = await User.findById(request.userId);
		user.posts.pull(postId);
		await user.save();

		io.getIO().emit("posts", { action: "delete", post: postId });
		response.status(200).json({ message: "Deleted post." });
	} catch (error) {
		next(error);
	}
};
