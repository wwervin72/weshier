const Sequelize = require('Sequelize')
const models = require('../../config/db/model')
const { respond, respEntity, validateRequestEntity, renderTagHtml } = require('../utils')

exports.create = function (req, res, next) {
	if (!validateRequestEntity({req, res})) {
		return
	}
	models.Tag.create({
		user: req.user.id,
		name: req.body.name
	}).then(tag => {
		if (tag) {
			return renderTagHtml(tag, req.user).then(html => {
				return respond(res, respEntity({
					tag,
					html
				}), 200)
			})
		} else {
			return respond(res, respEntity(null, false, '标签创建失败'), 200)
		}
	}).catch(err => next(err))
}

exports.delete = function (req, res, next) {
	models.Tag.destroy({
		where: {
			user: req.user.id,
			id: req.body.id
		}
	}).then(data => {
		let status = !!data
		return respond(res, respEntity(null, status, `删除${status ? '成功' : '失败'}`), 200)
	}).catch(err => next(err))
}

exports.getTagList = function (req, res, next) {
	models.Tag.findAll({
		attributes: [
			'id', 'name', 'desc',
		],
		include: [
			{
				model: models.User
			},
			{
				model: models.Article,
				as: 'articles',
				attributes: ['id']
			}
		],
		limit: 100,
	}).then(tags => {
		console.log(tags);

		return respond(res, respEntity({tags}, true, null), 200)
	})
}
