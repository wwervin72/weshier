const merge = require('webpack-merge')
let baseConf = require('./webpack.base.conf')

process.env.NODE_ENV = 'development'

const devConf = merge(baseConf, {
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.scss$/,
				loaders: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			},
		]
	}
})

module.exports = devConf
