const config = require('config')
const models = require('../../config/db/model')
const { userNameReg, userNameTips, passWordReg, passWordTips} = require('../utils/variables')
const Sequelize = require('sequelize')
exports.create = {
	userName: {
		in: ['body'],
		isString: {
			errorMessage: "用户名必须是字符串"
		},
		custom: {
			options: (val, {req}) => {
				if (!userNameReg.test(val)) {
					throw new Error(userNameTips)
				}
				return models.User.findOne({
					where: {
						userName: val
					}
				}).then(u => {
					if (u) {
						return Promise.reject('用户名已被占用，请更换')
					}
					return true
				})
			}
		}
	},
	passWord: {
		in: ['body'],
		isString: {
			errorMessage: "密码必须是字符串"
		},
		custom: {
			options: (val, {req}) => {
				if (!passWordReg.test(val)) {
					throw new Error(passWordTips)
				}
				return true
			}
		}
	},
	email: {
		in: ['body'],
		isEmail: {
			errorMessage: "邮箱格式不正确"
		},
		notEmpty: {
			errorMessage: "邮箱不能为空"
		},
		custom: {
			options: (val, {req}) => {
				return models.User.findOne({
					where: {
						email: val
					}
				}).then(u => {
					if (u) {
						return Promise.reject('邮箱已被占用，请更换')
					}
					return true
				})
			}
		}
	},
	nickName: {
		in: ['body'],
		isString: {
			errorMessage: "昵称必须是字符串"
		}
	},
}
