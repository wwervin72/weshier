const models = require('../../config/db/model')
const upload = require('../utils/upload')

/**
 * 上传附件
 */
exports.uploadAnnex = function (req, res, next) {
	try {
		upload(req, res, (err, fileName) => {
			if (err) return next(err)
			Promise.all(req.files.file.map(file => models.Annex.create({
				fileName: file.filename,
				user: req.user.id
			}))).then(result => {
				return res.status(200).json({
					result: true,
					code: 200,
					data: req.files.file.map(file => `/${process.env.ASSETS_PREFIX}/${process.env.UPLOAD_DIR}/${file.filename}`)
				})
			}).catch(err => next(err))
		})
	} catch (err) {
		return next(err)
	}
}
