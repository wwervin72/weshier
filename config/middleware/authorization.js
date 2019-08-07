const { respondOrRedirect, respond } = require('../../app/utils/')
const { notFound } = require('./../../app/controller/page.controller')

/**
 * 需要登录
 */
exports.requireSignIn = (req, res, next) => {
	if (req.isAuthenticated()) return next()
	res.format({
		html: function () {
			req.session.redirectTo = req.originalUrl
		}
	})
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
	respondOrRedirect({ res }, '/', {
        status: false,
        msg: '抱歉，你不能访问该资源'
    }, 403)
}

exports.verifyLocalAccount = function (req, res, next) {
	if (req.user.provide === 'local') return next()
	notFound(req, res, next)
}

exports.verifyLoginPrams = (req, res, next) => {
	if (!req.body.userName) {
		return res.status(200).json({
			status: false,
			msg: '请输入用户名'
		})
	}
	if (!req.body.passWord) {
		return res.status(200).json({
			status: false,
			msg: '请输入密码'
		})
	}
    next()
}
