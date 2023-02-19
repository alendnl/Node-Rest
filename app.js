const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const { defaultHeaders } = require("./util/headers");
const { errorHandler } = require("./util/errorHandler");
const { multerImageFileHandler } = require("./util/fileHandler");

const app = express();

app.use(defaultHeaders);
app.use(bodyParser.json());
app.use(multerImageFileHandler);

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use(errorHandler);

mongoose
	.connect(
		"mongodb+srv://alen:alen@cluster0.iaqgc1z.mongodb.net/messages?retryWrites=true&w=majority"
	)
	.then((result) => {
		console.log("DB Connected");

		const server = app.listen(8080);
		console.log("Server Connected");

		const io = require("./socket").init(server);
		io.on("connection", (socket) => {
			console.log("Client Connected");
		});
	})
	.catch((error) => {
		console.log("DB Error: ", error);
	});
