const models = require('../../config/db/model')
const { renderCommentListHtml } = require('../utils/index')
const Sequelize = require('sequelize')
const sequelize = models.sequelize
const Op = Sequelize.Op

/**
 * 获取文章列表
 */
exports.articleList = function (req, res, next) {
	return res.status(200).json({
		status: true,
		data: []
	})
}

/**
 * 保存文章
 */
exports.saveArticle = function (req, res, next) {
	let data = req.body
	data.article_author = req.user.id
	data.tags = data.tags && data.tags.map(name => ({
		name,
		user: req.user.id
	}))
	if (data.category) {
		data.categories = {
			name: data.category,
			user: req.user.id
		}
	}
	models
		.Article
		.create(data, {
			include: [
				{
					association: models.Article.Tag,
					as: 'tags'
				},
				models.Article.Category
			],
		})
		.then(article => {
			if (!article) {
				return next()
			}
			return res.status(200).json({
				status: true,
				data: article,
				msg: '文章创建成功'
			})
		})
		.catch(err => {
			if (/^Sequelize/.test(err.name)) {
				return res.status(200).json({
					status: false,
					msg: err.errors[0].message
				})
			} else {
				return next(err)
			}
		})
}

/**
 * 更新
 */
exports.updateArticle = function (req, res, next) {
	models.Article.update(req.body, {
		where: {
			id: req.body.id,
			article_author: req.user.id
		}
	}).then(result => {
		let status = result[0] >= 1
		return res.status(200).json({
			status,
			msg: '更新' + (status ? '成功' : '失败'),
			data: req.body
		})
	}).catch(err => next(err))
}

/**
 * 删除
 */
exports.delArticle = function (req, res, next) {
	models.Article.update({
		status: '0'
	}, {
		where: {
			id: req.body.id,
			article_author: req.user.id
		}
	}).then(result => {
		let status = result[0] >= 1
		return res.status(200).json({
			status,
			msg: `删除${status ? '成功' : '失败'}`
		})
	}).catch(err => next(err))
}

/**
 * 点赞文章
 */
exports.heartArticle = function (req, res, next) {
	models.Article.findOne({
		where: {
			id: req.params.articleId,
			status: '1'
		},
		include: [
			{
				model: models.Heart,
				attributes: ['id'],
				required: false,
				where: {
					article_heart: req.params.articleId,
					user: req.user.id
				}
			}
		]
	}).then(article => {
		if (!article) return next()
		if (article.Hearts && article.Hearts.length) {
			return res.status(200).json({
				status: false,
				msg: '你已经点赞了该文章，不能重复点赞！'
			})
		}
		return models.Heart.create({
			user: req.user.id,
			article_heart: article.id
		}).then(heart => {
			if (heart) {
				return res.status(200).json({
					data: article,
					status: true,
					msg: '点赞成功'
				})
			} else {
				return res.status(200).json({
					status: false,
					msg: '点赞失败'
				})

			}
		})
	}).catch(err => next(err))
}

/**
 * 取消点赞文章
 */
exports.cancelHeartArticle = function (req, res, next) {
	models.Article.findOne({
		where: {
			id: req.params.articleId,
			status: '1'
		},
		include: [
			{
				model: models.Heart,
				attributes: ['id'],
				required: false,
				where: {
					article_heart:  req.params.articleId,
					user: req.user.id
				}
			}
		]
	}).then(article => {
		if (!article) return next()
		if (!article.Hearts.length) {
			return res.status(200).json({
				status: false,
				msg: '你还没有点赞该文章!'
			})
		}
		return models.Heart.destroy({
			where: {
				id: article.Hearts[0].id
			}
		}).then(heart => {
			return res.status(200).json({
				status: !!heart,
				msg: `点赞取消${heart ? '成功' : '失败'}`
			})
		})
	}).catch(err => next(err))
}

/**
 * 查询文章详情
 */
exports.fetchArticleEditDetail = function (req, res, next) {
	models.Article.queryArticleEditDetail(models, {
		id: req.params.articleId
	}).then(data => {
		if (!data) return next()
		return res.status(200).json({
			status: true,
			data
		})
	}).catch(err => next(err))
}

/**
 * 查询文章评论列表
 */
exports.queryArticleComments = function (req, res, next) {
	models.Comment.queryCommentList(models, {
		comment_article: req.params.articleId,
		reply: null
	}).then(comments => {
		renderCommentListHtml(comments).then(html => {
			return res.status(200).json({
				status: true,
				data: {
					comments,
					html
				}
			})
		}).catch(err => next(err))
	}).catch(err => next(err))
}

/**
 * 文章展示详情
 */
exports.fetchArticleShowDetail = function (req, res, next) {
	sequelize.query(`
		SELECT
			Article.content,
			Article.id,
			COUNT(user) AS 'heartCount'
		FROM
			ws_article AS Article
		LEFT OUTER JOIN ws_heart AS Hearts ON Article.id = Hearts.article_heart
		AND Hearts.comment_heart IS NULL
		WHERE
			Article.id = '${req.params.articleId}'
		AND Article.status = '1';
	`)
	.then(data => {
		if (!data || !data[0]) return next()
		return res.status(200).json({
			status: true,
			data: data[0][0]
		})
	}).catch(err => next(err))
}
