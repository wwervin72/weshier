require("dotenv").config();

const express = require("express");
const passport = require("passport");
const models = require("./config/db/model");
const port = process.env.PORT;

const app = express();

require("./config/passport")(passport);
require("./config/express")(app, passport);
require("./config/routes")(app, passport);

models.sequelize.sync().then(() => {
	app.listen(port, () => {
		console.log(`Server is running at port ${port}`);
	});
});

module.exports = app;
