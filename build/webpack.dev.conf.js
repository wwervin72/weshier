const merge = require("webpack-merge");
let baseConf = require("./webpack.base.conf");

process.env.NODE_ENV = "development";

const devConf = merge(baseConf, {
	mode: "development",
	module: {
		rules: [
			{
				test: /\.scss$/,
				loaders: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							sourceMap: true,
						},
					},
					{
						loader: "postcss-loader",
						options: {
							sourceMap: true,
						},
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: true,
						},
					},
				],
			},
		],
	},
});

module.exports = devConf;
