const models = require('../../config/db/model')
const Sequelize = require('sequelize')

exports.create = {
	name: {
		in: ['body'],
		isString: {
			errorMessage: "分类名必须是字符串"
		},
		notEmpty: {
			errorMessage: "分类名不能为空"
		},
		custom: {
			options: (val, {req}) => {
				return models.Category.findOne({
					where: {
						name: val,
						user: req.user.id
					}
				}).then(t => {
					if (t) {
						return Promise.reject(`分类名${val}已存在，请重新输入`)
					}
					return true
				})
			}
		}
	},
}
