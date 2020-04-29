const fs = require('fs')
const multer = require('multer')
const { mkdirs } = require('./')
const config = require('config')

if (!fs.existsSync(config.path.upload)) {
	mkdirs(config.path.upload, function () {})
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
		cb(null, config.path.upload)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

module.exports = multer({
    storage,
    fileSize: 512 * 1024 * 1024,
}).fields([{
    name: 'file'
}])
