const models = require('../../config/db/model')
const Sequelize = require('sequelize')

exports.create = {
	name: {
		in: ['body'],
		isString: {
			errorMessage: "标签名必须是字符串"
		},
		notEmpty: {
			errorMessage: "标签名不能为空"
		},
		custom: {
			options: (val, {req}) => {
				return models.Tag.findOne({
					where: {
						name: val,
						user: req.user.id
					}
				}).then(t => {
					if (t) {
						return Promise.reject(`标签名${val}已存在，请重新输入`)
					}
					return true
				})
			}
		}
	},
}
