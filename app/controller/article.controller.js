const { validationResult } = require('express-validator')
const models = require('../../config/db/model')
const { renderCommentListHtml, respond, respEntity, validateRequestEntity } = require('../utils/index')
const sequelize = models.sequelize

/**
 * 获取文章列表
 */
exports.articleList = function (req, res, next) {
	return respond(res, respEntity([]), 200)
}

/**
 * 保存文章
 */
exports.saveArticle = function (req, res, next) {
	if (!validateRequestEntity({req, res})) {
		return
	}
	let data = req.body
	data.article_author = req.user.id
	if (data.category) {
		data.categories = {
			name: data.category,
			user: req.user.id
		}
	}
	models
		.Article
		.create(data)
		.then(article => {
			if (!article) {
				return next()
			}
			article.setCategories(data.category)
			article.setTags(data.tags)
			return respond(res, respEntity(article, '文章创建成功'), 200)
		})
		.catch(err => {
			if (/^Sequelize/.test(err.name)) {
				return respond(res, respEntity(null, false, err.errors[0].message), 200)
			} else {
				return next(err)
			}
		})
}

/**
 * 更新
 */
exports.updateArticle = function (req, res, next) {
	if (!validateRequestEntity({req, res})) {
		return
	}
	models.Article.findOne({
		where: {
			id: req.body.id,
			article_author: req.user.id
		}
	}).then(article => {
		if(!article) {
			next()
		} else {
			Promise.all([
				article.setTags(req.body.tags),
				article.update(req.body)
			])
			.then(([tagRes, result]) => respond(res, respEntity(req.body, true, '更新成功'), 200))
			.catch(err => next(err))
		}
	})
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
		return respond(res, respEntity(null, status, `删除${status ? '成功' : '失败'}`), 200)
	}).catch(err => next(err))
}

/**
 * 点赞文章
 */
exports.heartArticle = async function (req, res, next) {
	let [isHearted, article] = await Promise.all([
		models.Heart.findOne({
			where: {
				user: req.user.id,
				article_heart: req.params.articleId
			}
		}),
		models.Article.findOne({
			where: {
				id: req.params.articleId,
				status: "1"
			}
		})
	])
	if (isHearted) return respond(res, respEntity(null, false, '你已经点赞过该文章'), 200)
	if (!article) return respond(res, respEntity(null, false, '文章不存在'), 404)
	models.sequelize.transaction( async t => {
		await models.Heart.create({
			user: req.user.id,
			article_heart: req.params.articleId
		}, { transaction: t })
		// return await models.Article.update({
		// 	heart_count: models.sequelize.literal('heart_count + 1')
		// }, {
		// 	where: {
		// 		id: article.id
		// 	},
		// 	transaction: t
		// })
		return await article.increment('heart_count', {by: 1, transaction: t})
	})
	.then(result => {
		// result 的 heart_count 还未 +1
		result.dataValues.heart_count += 1
		respond(res, respEntity(result, true, '点赞成功'), 200)
	})
	.catch(err => next(err))
}

/**
 * 取消点赞文章
 */
exports.cancelHeartArticle = async function (req, res, next) {
	let [isHearted, article] = await Promise.all([
		models.Heart.findOne({
			where: {
				user: req.user.id,
				article_heart: req.params.articleId
			}
		}),
		models.Article.findOne({
			where: {
				id: req.params.articleId,
				status: "1"
			}
		})
	])
	if (!isHearted) return respond(res, respEntity(null, false, '你还未点赞该文章'), 200)
	if (!article) return respond(res, respEntity(null, false, '文章不存在'), 404)
	models.sequelize.transaction( async t => {
		await isHearted.destroy({ transaction: t })
		return await article.decrement('heart_count', {by: 1, transaction: t})
	})
	.then(result => {
		result.dataValues.heart_count -= 1
		respond(res, respEntity(result, true, '取消点赞成功'), 200)
	})
	.catch(err => next(err))
}

/**
 * 查询文章详情
 */
exports.fetchArticleEditDetail = function (req, res, next) {
	models.Article.queryArticleEditDetail(models, {
		id: req.params.articleId
	}).then(data => {
		if (!data) return next()
		return respond(res, respEntity(data), 200)
	}).catch(err => next(err))
}

/**
 * 查询文章评论列表
 */
exports.queryArticleComments = function (req, res, next) {
	let allowComment = req.query.allowComment === '1'
	models.Comment.queryCommentList(models, {
		comment_article: req.params.articleId,
		reply: null
	}).then(comments => {
		renderCommentListHtml(comments, allowComment).then(html => {
			return respond(res, respEntity({
				comments,
				html
			}), 200)
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
			Article.allow_comment,
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
		return respond(res, respEntity(data[0][0]), 200)
	}).catch(err => next(err))
}
