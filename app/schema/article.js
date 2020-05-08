const models = require('../../config/db/model')
const Sequelize = require('sequelize')

exports.create = {
	title: {
		in: ['body'],
		isString: {
			errorMessage: "文章标题必须是字符串"
		},
		notEmpty: {
			errorMessage: "文章标题不能为空"
		},
	},
	allow_comment: {
		in: ['body'],
		custom: {
			options: (val, {req}) => {
				if (val !== '0' && val !== '1') {
					throw new Error('是否允许评论参数错误')
				}
				return true
			}
		}
	},
	content: {
		in: ['body'],
		isString: {
			errorMessage: "文章内容必须是字符串"
		},
		notEmpty: {
			errorMessage: "文章内容不能为空"
		},
	},
	abstract: {
		in: ['body'],
		isString: {
			errorMessage: "文章摘要必须是字符串"
		},
		notEmpty: {
			errorMessage: "文章摘要不能为空"
		},
	},
	password: {

	},
	thumbnail: {
		in: ['body'],
		isString: {
			errorMessage: "文章密码必须是字符串"
		}
	},
	category: {
		in: ['body'],
		custom: {
			options: (val, {req}) => {
				if (val) {
					return models.Category.findOne({
						where: {
							user: req.user.id,
							id: val
						}
					}).then(category => {
						if (!category) {
							return Promise.reject(`分类${category}不存在`)
						} else {
							return true
						}
					})
				}
				return true
			}
		}
	},
	'tags': {
		in: ['body'],
		isArray: {
			errorMessage: "文章标签必须是标签数组"
		},
		custom: {
			options: (val, {req}) => {
				if (val.length) {
					return models.Tag.findAll({
						where: {
							user: req.user.id,
							id: {
								[Sequelize.Op.in]: val
							}
						},
						attributes: ['id', 'name', 'desc']
					}).then(tags => {
						let unExistedTags = val.filter(el => tags.findIndex(t => t.id === el) === -1)
						if (unExistedTags.length) {
							return Promise.reject(`标签${unExistedTags.join(',')}不存在`)
						} else {
							return true
						}
					})
				}
				return true
			}
		}
	},
}

exports.update = {
	...exports.create,
	id: {
		in: ['body'],
		custom: {
			options: (val, {req}) => {
				if (val) {
					return models.Article.queryUserArticle(req.user.id, val)
					.then(a => {
						if (!a) {
							return Promise.reject(`文章不存在`)
						} else {
							return true
						}
					})
				}
				throw new Error('请传入文章 id')
			}
		}
	}
}
