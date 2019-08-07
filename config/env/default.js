const path = require('path')

exports.apiPrefix = '/api'

module.exports = {
	apiPrefix: exports.apiPrefix,
	mysql: {
		username: 'root',
		host: 'localhost',
		database: 'weshier',
		password: 'ervin',
		dialect: 'mysql',
		port: 3306,
		operatorsAliases: false,
		logging: false,
		raw: true
	},
	redis: {
		url: 'redis://localhost:6379',
		sessPrefix: 'ws-sess:'
	},
	cookie: {
		secret: 'weshier'
	},
	session: {
		secret: 'ervin_ws',
		maxAge: 1000 * 3600 * 24 * 7
	},
	path: {
		upload: path.join(__dirname, '../../public', 'upload')
	},
	log: path.join(__dirname, '../../log'),
	registerAuthcodeKeyPrefix: 'joinAuthCode-',
	registerInviteCodeKeyPrefix: 'joinInviteCode'
}
