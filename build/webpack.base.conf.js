const path = require("path");
const merge = require("webpack-merge");
const htmlWebpackPlugin = require("html-webpack-plugin");
const { getEntry } = require("./utils");
const cleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;

const entry = Object.create(null);
let htmlEntry = Object.create(null);
const htmlWebpackPlugins = [];

getEntry(
	path.join(__dirname, "../src/js"),
	{
		extname: ".js",
	},
	entry
);
getEntry(
	path.join(__dirname, "../src/page"),
	{
		extname: ".html",
		deep: true,
	},
	htmlEntry
);

for (let page in htmlEntry) {
	let chunkName = path.basename(page, path.extname(page));
	let chunks = Object.prototype.hasOwnProperty.call(entry, chunkName)
		? [chunkName]
		: [];
	let option = {
		template: htmlEntry[page],
		filename: path.join(__dirname, "../app/view", page + ".html"),
		chunks,
		minify: process.env.NODE_ENV !== "development",
	};
	htmlWebpackPlugins.push(new htmlWebpackPlugin(option));
}
const baseConf = merge({
	entry,
	output: {
		path: path.join(__dirname, "../public/static/js"),
		publicPath: "/assets/static/js/",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: path.join(__dirname, "../src/js/**/*"),
				loader: "babel-loader",
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				exclude: /node_modules/,
				include: [path.join(__dirname, "../src/image")],
				loader: "url-loader",
				options: {
					limit: 10000,
					name: "[name].[ext]",
					outputPath: "../image",
				},
			},
		],
	},
	plugins: [new cleanWebpackPlugin(), ...htmlWebpackPlugins],
});

module.exports = baseConf;
