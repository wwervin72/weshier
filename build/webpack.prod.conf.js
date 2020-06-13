const merge = require("webpack-merge");
let baseConf = require("./webpack.base.conf");
// const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

process.env.NODE_ENV = "development";

const devConf = merge(baseConf, {
	mode: "production",
	devtool: "cheap-module-souce-map",
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
		],
	},
	// optimization: {
	// 	minimizer: [
	// 		new TerserJSPlugin({
	// 			cache: path.resolve(".cache"),
	// 			parallel: 4, // 开启多进程压缩
	// 			// sourceMap,
	// 			terserOptions: {
	// 				compress: {
	// 					// 删除所有的 `console` 语句
	// 					drop_console: true,
	// 				},
	// 			},
	// 		}),
	// 	],
	// },
	plugins: [
		new MiniCssExtractPlugin({
			filename: "../css/[name].css",
		}),
	],
});

module.exports = devConf;
