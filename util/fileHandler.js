const fs = require("fs");
const path = require("path");

const multer = require("multer");

exports.multerImageFileHandler = multer({
	storage: multer.diskStorage({
		destination: (request, file, callback) => {
			callback(null, "images");
		},
		filename: (request, file, callback) => {
			callback(null, file.originalname);
		},
	}),
	fileFilter: (request, file, callback) => {
		if (
			file.mimetype === "image/png" ||
			file.mimetype === "image/jpg" ||
			file.mimetype === "image/jpeg"
		) {
			callback(null, true);
		} else {
			callback(null, false);
		}
	},
}).single("image");

exports.clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (error) => console.log("unlink error: ", error));
};
