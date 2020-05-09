const Sequelize = require('Sequelize')
const models = require('../../config/db/model')
const { respond, respEntity, validateRequestEntity, renderTagHtml } = require('../utils')

exports.delete = function (req, res, next) {
	models.Comment.findOne({
		where: {
			id: req.params.id,
			comment_author: req.user.id
		},
		include: [
			{
				model: models.Comment,
				as: 'replies'
			}
		]
	}).then(comment => {
		if (!comment) return next()
		return models.sequelize.transaction( async t => {
			await Promise.all(comment.replies.map(reply => (
				reply.destroy({transaction: t})
			)))
			return await comment.destroy({transaction: t})
		}).then(result => {
			return respond(res, respEntity(comment, true, `删除成功}`), 200)
		})
	}).catch(err => next(err))
}
