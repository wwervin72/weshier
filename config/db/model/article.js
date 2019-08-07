const dayjs = require('dayjs')
const { renderArticleListHtml } = require('./../../../app/utils/index')

module.exports = (sequelize, DataTypes) => {
	const Article = sequelize.define('Article', {
		allow_comment: {
			type: DataTypes.ENUM,
			// 默认为 1 允许评论 0：不允许评论
			values: ['0', '1'],
			defaultValue: 1
		},
		title: {
			type: DataTypes.STRING,
			len: {
				args: [[1, 30]],
				msg: '标题的长度应该是1到30'
			}
		},
		abstract: {
			type: DataTypes.TEXT,
			len: {
				args: [[60, 120]],
				msg: '摘要的长度应该是60到120'
			}
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: {
				msg: '文章内容不能为空'
			},
			validate: {
				notEmpty: {
					msg: '文章内容不能为空'
				}
			}
		},
		password: {
			type: DataTypes.STRING
		},
		status: {
			type: DataTypes.ENUM,
			// 默认为 1 正常值，0：已删除 2：草稿
			values: ['0', '1', '2'],
			defaultValue: '1'
		},
		thumbnail: {
			type: DataTypes.STRING
		},
		view: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		topping: {
			type: DataTypes.ENUM,
			// 0: 正常 1：置顶
			values: ['0', '1'],
			defaultValue: '0'
		},
		createdAt: {
			type: DataTypes.DATE,
			get() {
				return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss')
			}
		},
		updatedAt: {
			type: DataTypes.DATE,
			get() {
				return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss')
			}
		}
	}, {
		tableName: 'ws_article'
	})

	Article.associate = function (models) {
		Article.User = Article.belongsTo(models.User, {
			foreignKey: 'article_author'
		})
		Article.Category = Article.belongsTo(models.Category, {
			foreignKey: 'article_category',
			as: 'categories'
		})
		Article.Heart = Article.hasMany(models.Heart, {
			foreignKey: 'article_heart'
		})
		Article.Comment = Article.hasMany(models.Comment, {
			foreignKey: 'comment_article'
		})
		Article.Tag = Article.belongsToMany(models.Tag, {
			as: 'tags',
			through: 'ws_article_tag',
			foreignKey: 'article_tag'
		})
	}

	Article.queryArticleList = function (models, params = {}) {
		let queryParams = {
			where: Object.assign(params.where || {}, {
				status: '1'
			}),
			order: [
				['createdAt', 'DESC']
			],
			attributes: ['id', 'title', 'abstract', 'createdAt', 'password', 'thumbnail', 'view', 'article_author'],
			include: [
				{
					model: models.Tag,
					as: 'tags'
				},
				{
					model: models.Heart
				},
				{
					model: models.Comment
				},
				Object.assign({
					model: models.User,
					attributes: ['id', 'userName', 'nickName']
				}, params.userName && {
					where: {
						userName: params.userName
					},
					required: true
				})
			]
		}
		if (!isNaN(params.offset)) {
			queryParams.offset = params.offset - 0
		}
		if (!isNaN(params.limit)) {
			queryParams.limit = params.limit - 0
		}

		return models
			.Article
			.findAll(queryParams).then(data => {
				return data
			}).catch(err => Promise.reject(err))
	}

	Article.queryArticleListHtml = function (models, params, user) {
		if (!user) {
			let temp = user
			user = params
			params = temp
		}
		return Article.queryArticleList(models, params)
			.then(async list => {
				let html = await renderArticleListHtml(list, user)
				return {
					html,
					hasMore: params.limit ? list.length == params.limit : true
				}
			})
			.catch(err => Promise.reject(err))
	}

	Article.queryArticleEditDetail = function (models, params) {
		return new Promise((resolve, reject) => {
			models.Article.findOne({
				where: Object.assign({
					status: '1'
				}, params),
				attributes: ['id', 'content', 'title', 'password', 'thumbnail', 'article_category', 'allow_comment'],
				include: [
					{
						model: models.Tag,
						as: 'tags'
					}
				]
			}).then(data => {
				resolve(data)
			}).catch(err => reject(err))
		})
	}

	return Article
}
