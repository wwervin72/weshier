const path = require("path");
const expressWinston = require("express-winston");
const winston = require("winston");
const dailyRotateFile = require("winston-daily-rotate-file");
const config = require("config");

exports.dailyRotateFileTransport = function (filename) {
	return new dailyRotateFile({
		filename: path.join(config.log, `${filename}-%DATE%.log`),
		datePattern: "YYYY-MM-DD",
		maxSize: "20m",
		maxFiles: "28d",
	});
};

exports.apiRequestLogger = function (req, res, next) {
	let send = res.send,
		content = "",
		query = JSON.stringify(req.query || {});

	res.send = function () {
		content = JSON.stringify(arguments[0]);
		send.apply(res, arguments);
	};

	expressWinston.logger({
		transports: [exports.dailyRotateFileTransport("apiRequest")],
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.json()
		),
		msg() {
			return `HTTP ${req.method} ${req.url} query: ${query} resData: ${content}`;
		},
		colorize: true,
	})(req, res, next);
};

exports.apiResponseLogger = function (err, req, res, next) {
	let send = res.send,
		content = "",
		query = JSON.stringify(req.query || {});

	res.send = function () {
		content = JSON.stringify(arguments[0]);
		send.apply(res, arguments);
	};

	expressWinston.errorLogger({
		transports: [exports.dailyRotateFileTransport("apiErrorResponse")],
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.json()
		),
		msg() {
			return `HTTP ${req.method} ${req.url} query: ${query} resData: ${content}`;
		},
		colorize: true,
	})(err, req, res, next);
};
