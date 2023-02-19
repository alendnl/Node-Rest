exports.errorHandler = (error, request, response, next) => {
	console.log("Error Handler:", error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	response.status(status).json({ message: message, data: data });
};
