const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const redisStore = require("connect-redis")(session);
const bodyParser = require("body-parser");
const cors = require("cors");
const ejs = require("ejs");
const config = require("config");
const { client } = require("./db/redis.js");
const path = require("path");

module.exports = function (app, passport) {
	app.use(
		compression({
			threshold: 512,
		})
	);
	app.use(
		cors({
			origin: [],
			optionsSuccessStatus: 200,
			credentials: true,
		})
	);

	ejs.delimiter = "?";
	app.set("views", path.join(__dirname, "../app/view"));
	app.engine("html", ejs.renderFile);

	app.use(
		`/${process.env.ASSETS_PREFIX}`,
		express.static(path.join(__dirname, "../public"))
	);

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.use(cookieParser());
	app.use(
		session({
			name: "ws_session",
			resave: false,
			saveUninitialized: true,
			cookie: {
				secret: config.cookie.secret,
				maxAge: config.session.maxAge,
			},
			rolling: true,
			secret: config.session.secret,
			store: new redisStore({
				client,
				ttl: config.session.maxAge,
				// disableTTL: true, // 永久存储 session
				prefix: config.redis.sessPrefix,
			}),
		})
	);

	app.use(passport.initialize());
	app.use(passport.session());
};
