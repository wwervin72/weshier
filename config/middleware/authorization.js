const { respondOrRedirect } = require('../../app/utils/')
const { noPermission } = require('./../../app/controller/page.controller')

/**
 * 需要登录
 */
exports.requireSignIn = (req, res, next) => {
	if (req.isAuthenticated()) return next()
	respondOrRedirect({ res }, '/login', {
        status: false,
        msg: '请先登录'
    }, 401)
}

/**
 * 检测是否拥有管理员才拥有的功能
 */
exports.privilegeVerify = async (req, res, next) => {
	let hasPrivilege = true
	if (req.url === '/join' || req.url === '/register') {
		// 不允许注册账号
		hasPrivilege = false
	} else if (req.user) {
		// 管理员
		hasPrivilege = req.user.role === '1';
	}
	if (!hasPrivilege) {
		respondOrRedirect({ res }, '/coding', {
			msg: '抱歉，功能暂未开放'
		})
	} else {
		return next()
	}
}

/**
 * 检测是否是管理员账号
 */
exports.verifyIsManager = function (req, res, next) {
	if (req.user.role === '1') next()
	res.format({
		html: function () {
			req.session.redirectTo = req.originalUrl
		}
	})
	return noPermission()
}

exports.verifyLocalAccount = function (req, res, next) {
	if (req.user && req.user.provide === 'local') {
		return next()
	}
	noPermission(req, res, next)
}
