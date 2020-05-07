const path = require('path')
const fs = require('fs')
const config = require('config')
const models = require('../../config/db/model')
const { respondOrRedirect, respond, respEntity, validateRequestEntity, renderTagHtml } = require('../utils')

exports.create = function (req, res, next) {
	if (!validateRequestEntity({req, res})) {
		return
	}
	models.Category.create({
		user: req.user.id,
		name
	}).then(category => {
		if (category) {
			return renderCategoryHtml(category, req.user).then(html => {
				return respond(res, respEntity({
					category,
					html
				}), 200)
			})
		} else {
			return respond(res, respEntity(null, false, '分类创建失败'), 200)
		}
	}).catch(err => next(err))
}

exports.delete = function (req, res, next) {
	models.Category.destroy({
		where: {
			user: req.user.id,
			id: req.body.id
		}
	}).then(data => {
		let status = !!data
		return respond(res, respEntity(null, status, `删除${status ? '成功' : '失败'}`), 200)
	}).catch(err => next(err))
}
