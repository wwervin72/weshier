const path = require('path')
const fs = require('fs')
const config = require('config')
const models = require('../../config/db/model')
const { respondOrRedirect, respond, respEntity, validateRequestEntity, renderTagHtml } = require('../utils')

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
