const dayjs = require('dayjs')
const config = require('config')
const models = require('../../config/db/model')
const Sequelize = models.Sequelize
const sequelize = models.sequelize
const { readEmojis, renderCommentListHtml, respond, respEntity } = require('../utils/index')

exports.notFound = function (req, res, next) {
	return respond(res, respEntity(null, false, "未找到该资源"), '404.html', 404)
}

exports.noPermission = function (req, res, next) {
	return respond(res, respEntity(null, false, "抱歉，你不能访问该资源"), '403.html', 403)
}

exports.serverError = function (err, req, res, next) {
	if (err.message
		&& (~err.message.indexOf('not found')
		|| (~err.message.indexOf('Cast to ObjectId failed')))) {
		return next()
	}

	let env =  process.env.NODE_ENV
	return respond(res, respEntity(null, false, env === 'development' ? err.stack : '服务器错误'), '500.html', 500)
}

/**
 * 首页
 */
exports.index = function (req, res, next) {
	return respond(res, null, 'index.html')
}

/**
 * 登录界面
 */
exports.renderLogin = function (req, res, next) {
	if (req.user) {
		return res.redirect('/')
	}
	return respond(res, {
		apiPrefix: config.apiPrefix
	}, 'login.html')
}

/**
 * 注册
 */
exports.renderRegister = function (req, res, next) {
	if (req.user) {
		return res.redirect('/')
	}
	return respond(res, null, 'register.html')
}

/**
 * 用户主页
 */
exports.userHomePage = function (req, res, next) {
	models
		.User
		.findOne({
			where: {
				userName: req.params.userName,
				status: '1',
				provide: 'local'
			}
		})
		.then(user => {
			if (!user) return next()
			res.locals.member = user
			let pageNum = req.query.pageNum || 0
			let pageCount = req.query.pageCount || 10
			return Promise.all([
				models.Article.findAll(Object.assign({
					where: {
						status: '1',
						article_author: user.id
					},
					order: [
						['created_at', 'DESC']
					],
					include: [
						{
							model: models.Comment,
							attributes: ['id'],
						},
						{
							model: models.Heart,
							attributes: ['id']
						}
					]
				}, {
					offset: pageNum * pageCount,
					limit: pageCount
				})),
				models.Tag.findAll({
					where: {
						user: user.id,
					},
					attributes: [
						'id',
						'name'
					],
					include: [
						{
							model: models.Article,
							as: 'articles',
							through: {
								group: 'tag_id',
								attributes: [
									'tag_id',
									[Sequelize.fn('COUNT', 'article_id'), "articleCount"]
								]
							}
						}
					]
				}),
				models.Article.findAll({
					where: {
						status: '1',
						article_author: user.id
					},
					group: 'article_category',
					attributes: [
						'article_category',
						[Sequelize.fn('COUNT', 'article_category'), "categoryArticleCount"]
					],
					include: [
						{
							model: models.Category,
							as: 'categories',
							attributes: [
								'name', 'id'
							]
						}
					]
				}),
				sequelize.query(`
					SELECT DATE_FORMAT(created_at, "%Y-%m") as createMonth, COUNT(id) as monthCount
					FROM ws_article where article_author=${user.id} and status='1' GROUP BY
					createMonth;
				`)
			]).then(results => {
				user.articles = results[0]
				user.tags = results[1].sort((a, b) => b.articles.length - a.articles.length)
				user.categoryStatistic = results[2]
				user.createMonthStatistic = results[3][0]
				return user
			})
		})
		.then(data => {
			if (!data) {
				return next()
			}
			data.age = dayjs().diff(dayjs(data.created_at), 'day')
			return respond(res, { data }, 'user.html')
		})
		.catch(err => {
			return next(err)
		})
}

/**
 * 配置
 */
exports.setting = function (req, res, next) {
	Promise.all([
		models.Category.findAll({
			where: {
				user: req.user.id,
				status: '1'
			}
		}),
		models.Annex.findAll({
			where: {
				user: req.user.id,
			}
		}),
		models.Tag.findAll({
			where: {
				user: req.user.id,
			},
			attributes: ['id', 'name', 'desc']
		}),
	]).then(([category, annex, tags]) => {
		annex.forEach(el => {
			el.path = `/${process.env.ASSETS_PREFIX}/${process.env.UPLOAD_DIR}/${el.fileName}`
		})
		return respond(res, {
			category,
			annex,
			tags
		}, 'setting.html')
	}).catch(err => next(err))
}

/**
 * 文章
 */
exports.article = function (req, res, next) {
	models
		.Article
		.findOne({
			where: {
				status: '1',
				id: req.params.articleId
			},
			attributes: {
				exclude: ['thumbnail', 'status', 'topping']
			},
			include: [
				{
					model: models.User,
				},
				{
					model: models.Tag,
					as: 'tags'
				},
				{
					model: models.Heart,
					attributes: ['user']
				},
				{
					model: models.Comment
				}
			]
		})
		.then(article => {
			if (!article) {
				return next()
			}
			return models
						.Article
						.findAll({
							attributes: ['id', 'title', 'created_at'],
							where: {
								article_author: article.article_author,
								[Sequelize.Op.or]: [
									{
										created_at: {
											[Sequelize.Op.lt]: article.created_at
										}
									},
									{
										created_at: {
											[Sequelize.Op.gt]: article.created_at
										}
									},
								],
							},
							limit: 2
						}).then(prevNext => {
							// var data = prevNext.concat(article).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
							var data = prevNext.concat(article).sort((a, b) => a.id - b.id)
							if (data.length === 3) {
								// 包含三种情况
								// 1：有上一条和下一条
								// 2：有两条晚于该文章的
								// 3：有两条早于该文章的
								// 排序 如果该文章处于最后或者第一位
								// 则只取下标为1的
								// 否则刚好第一个为前一篇文章最后一个为后一篇文章

								if (data[0].id === article.id) {
									// 该文章在第一个
									article.prev = null
									article.next = data[1]
								} else if (data[2].id === article.id) {
									// 该文章在最后一个
									article.prev = data[1]
									article.next = null
								} else {
									article.prev = data[0]
									article.next = data[2]
								}

							} else if (data.length === 2) {
								if (data[0].id === article.id) {
									article.prev = null
									article.next = data[1]
								} else {
									article.prev = data[0]
									article.next = null
								}
							} else {
								article.prev = null
								article.next = null
							}
							return article
						})
		})
		.then(article => {
			return respond(res, {
				article,
				hearted: req.user && article.Hearts.some(heart => heart.user === req.user.id)
			}, 'article.html')
		})
		.catch(err => {
			return next(err)
		})
}


/**
 * 编辑器
 */
exports.editor = function (req, res, next) {
	Promise.all([
		models.Tag.findUserTags(req.user.id),
		models.Category.findAll({
			where: {
				user: req.user.id
			}
		}),
		models.Annex.findAll({
			where: {
				user: req.user.id
			}
		})
	]).then(result => {
		let [ tags, categories, annex ] = result
		annex.forEach(el => {
			el.path = `/${process.env.ASSETS_PREFIX}/${process.env.UPLOAD_DIR}/${el.fileName}`
		})
		return respond(res, {
			article: null,
			articleStr: null,
			category: categories,
			tags,
			annex
		}, 'editor.html')
	})
}

/**
 * 编辑文章
 */
exports.editArticle = function (req, res, next) {
	Promise.all([
		models.Tag.findUserTags(req.user.id),
		models.Article.queryArticleEditDetail(models, {
			id: req.params.articleId,
			status: "1",
			article_author: req.user.id,
		}),
		models.Category.findAll({
			where: {
				user: req.user.id
			}
		}),
		models.Annex.findAll({
			where: {
				user: req.user.id
			}
		})
	]).then(result => {
		let [tags, article, categories, annex] = result
		if (!article) {
			return next()
		}
		annex.forEach(el => {
			el.path = `/${process.env.ASSETS_PREFIX}/${process.env.UPLOAD_DIR}/${el.fileName}`
		})
		return respond(res, {
			article,
			articleStr: null,
			category: categories,
			tags,
			annex
		}, 'editor.html')
	}).catch(err => next(err))
}

/**
 * coding
 */
exports.isCoding = function (req, res, next) {
	return respond(res, null, 'coding.html')
}

/**
 * blog
 */
exports.blog = function (req, res, next) {
	models.Article.queryArticleList(models, {
		offset: 0,
		limit: 10
	}).then(articles => {
		return respond(res, { articles }, 'blog.html')
	}).catch(err => {
		return next(err)
	})
}

exports.blogArticlePagination = function (req, res, next) {
	let pageNum = req.query.pageNum || 0
	let pageCount = req.query.pageCount || 10

	models.Article.queryArticleListHtml(models, {
		offset: pageCount * pageNum,
		limit: pageCount,
		userName: req.query.userName
	}, req.user).then(data => {
		return respond(res, respEntity(data, true, '文章列表查询成功'), 200)
	}).catch(err => next(err))
}

exports.annex = function (req, res, next) {
	return respond(res, null, 'annex.html')
}

/**
 * 用户 tag 下所有文章
 */
exports.tagArticles = function (req, res, next) {
	models.Tag.findAll({
		where: {
			name: req.params.tagName
		},
		order: [
			['created_at', 'DESC']
		],
		include: [
			{
				model: models.User,
				where: {
					userName: req.params.userName
				},
			},
			{
				model: models.Article,
				as: 'articles',
				include: [
					{
						model: models.Comment,
						attributes: ['id']
					},
					{
						model: models.Heart,
						attributes: ['id']
					}
				]
			}
		]
	}).then(data => {
		if (!data || !data.length) return next()
		return respond(res, { data }, 'tagArticles.html')
	}).catch(err => next(err))
}

/**
 * 用户分类下所有文章
 */
exports.categoryArticles = function (req, res, next) {
	models.Category.findOne({
		where: {
			name: req.params.categoryName
		},
		order: [
			[models.Article, 'created_at', 'DESC']
		],
		include: [
			{
				model: models.User,
				where: {
					userName: req.params.userName,
					provide: 'local'
				}
			},
			{
				model: models.Article,
				include: [
					{
						model: models.Comment,
						attributes: ['id']
					},
					{
						model: models.Heart,
						attributes: ['id']
					}
				]
			}
		]
	}).then(data => {
		if (!data) return next()
		return respond(res, { data }, 'categoryArticles.html')
	}).catch(err => next(err))
}

/**
 * 按时间统计文章
 */
exports.articleStatisticByDate = function (req, res, next) {
	models.User.findOne({
		where: {
			userName: req.params.userName
		},
	}).then(user => {
		if (!user) return next()
		let month = req.params.month
		if (month < 10 && month.length < 2) {
			month = '0' + month
		}
		return models.Article.findAll({
			where: [
				{
					status: '1',
					article_author: user.id,
				},
				sequelize.where(
					sequelize.fn('DATE_FORMAT', sequelize.col('Article.created_at'),  '%Y%m'),
					req.params.year + month
				)
			],
			include: [
				{
					model: models.Comment,
					attributes: ['id']
				},
				{
					model: models.Heart,
					attributes: ['id']
				}
			]
		}).then(result => {
			user.articles = result
			return respond(res, { data: user }, 'dateStatisticArticles.html')
		})
	}).catch(err => next(err))
}

/**
 * practice list 页面
 */
exports.practicePages = function (req, res, next) {
	models.User.findOne({
		where: {
			userName: req.params.userName,
			status: '1',
			provide: 'local'
		},
		include: [
			{
				model: models.Practice
			}
		]
	}).then(data => {
		if (!data) return next()
		return respond(res, { member: data }, 'practiceList.html')
	}).catch(err => next(err))
}

/**
 * 单个 practice 界面
 */
exports.practice = function (req, res, next) {
	model.User.findOne({
		where: {
			userName: req.params.userName,
			status: '1',
			provide: 'local'
		},
		include: [
			{
				model: models.Practice,
				where: {
					id: req.params.practiceId
				}
			}
		]
	}).then(data => {
		if (!data || !data.Practices.length) return next()
		return respond(res, { data }, 'practiceList.html')
	}).catch(err => next(err))
}

exports.generateEmojiPanelHtml = function (req, res, next) {
	readEmojis()
		.then(emoji => {
			return respond(res, { emojiTabs: emoji }, 'common/emojiPanel.html')
		})
		.catch(err => next(err))
}

exports.renderLeaveMsg = function (req, res, next) {
	readEmojis().then(emoji => {
		return respond(res, { emojiTabs: emoji }, 'leaveMsg.html')
	}).catch(err => next(err))
}

/**
 * 渲染留言列表 html 代码
 */
exports.renderLeaveMsgCommentsHtml = function (req, res, next) {
	models.Comment.queryCommentList(models, {
		comment_article: null,
		reply: null
	}).then(comments => {
		renderCommentListHtml(comments).then((html) => {
			return respond(res, respEntity({
				comments,
				html
			}), 200)
		})
	}).catch(err => next(err))
}

exports.renderResetPwdHtml = function (req, res, next) {
	return respond(res, null, 'pwdReset.html')
}
