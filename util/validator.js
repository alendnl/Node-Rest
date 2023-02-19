const { body } = require("express-validator");
const User = require("../models/user");

exports.basicPostValidator = [
	body("title").trim().isLength({ min: 5 }),
	body("content").trim().isLength({ min: 5 }),
];

exports.signupUserValidator = [
	body("email")
		.isEmail()
		.withMessage("Please enter a valid email.")
		.custom((value, { request }) => {
			return User.findOne({ email: value }).then((userDoc) => {
				if (userDoc) {
					return Promise.reject("E-Mail address already exists!");
				}
			});
		})
		.normalizeEmail(),
	body("password").trim().isLength({ min: 5 }),
	body("name").trim().not().isEmpty(),
];
