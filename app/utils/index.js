const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

exports.respond = function (res, tpl, renderObj, returnObj, status) {
	res.format({
		html: () => res.render(tpl, renderObj),
		json: () => {
		  if (status) return res.status(status).json(returnObj);
		  res.json(returnObj);
		}
	});
}

exports.respondOrRedirect = function ({ req, res }, url = '/', obj = {}, status = 200) {
	res.format({
		html: () => {
		  res.redirect(url);
		},
		json: () => res.status(status).json(obj)
	});
}

exports.createNickname = () => {
	const str = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	// nickname的长度为5-10
	let nickNameLen = Math.floor(Math.random() * (10 - 5 + 1) + 5);
	let nickName = [];
	while (nickNameLen) {
		nickName[nickName.length] = str.substr(Math.floor(Math.random() * 62), 1);
		nickNameLen--;
	}
	return nickName.join('');
}

exports.makeSalt = () => {
	return Math.round((new Date().valueOf() * Math.random())) + ''
}

/**
 * 异步递归生成目录
 * @param {*} dirname string 目录名称
 * @param {*} cb function 回调函数
 */
exports.mkdirs = (dirname, cb) => {
    fs.exists(dirname, exists => {
        if (exists) {
            if (cb && typeof cb === 'function') {
                cb()
            }
        } else {
            exports.mkdirs(path.dirname(dirname), () => {
                fs.mkdir(dirname, cb)
            })
        }
    });
}

exports.readEmojis = function () {
	let emojiPath = path.join(__dirname, '../../public/image/emoji')
	if (!fs.existsSync(emojiPath)) return
	return new Promise((resolve, reject) => {
		fs.readdir(emojiPath, function (err, files) {
			if (err) return reject(err)
			let result = []
			for(let i = 0, len = files.length; i < len; i++) {
				let j = Math.floor(i / 50)
				let file = files[i]
				if (!result[j]) {
					result[j] = []
				}
				result[j].push({
					name: path.basename(file, path.extname(file)),
					src: `/${process.env.ASSETS_PREFIX}/image/emoji/${file}`
				})
			}
			resolve(result)
		})
	})
}

/**
 * 渲染表情面板
 * @param emoji Array emoji array
 */
exports.renderEmojiPanelHtml = function (emoji) {
	return new Promise((resolve, reject) => {
		ejs.renderFile(path.join(__dirname, '../view/common/emojiPanel.html'), {
			emojiTabs: emoji
		}, (err, str) => {
			if (err) return reject(err)
			resolve(str)
		})
	})
}

exports.renderCommentListHtml = function (comments) {
	return ejs.renderFile(
		path.join(__dirname, '../../', process.env.VIEW_PATH, 'common/comment.html'),
		{ comments }
	)
}

exports.renderSubCommentListHtml = function (subComments) {
	return ejs.renderFile(
		path.join(__dirname, '../../', process.env.VIEW_PATH, 'common/subComment.html'),
		{
			replies: subComments
		}
	)
}

exports.renderArticleListHtml = function (articles, user) {
	return ejs.renderFile(
		path.join(__dirname, '../../', process.env.VIEW_PATH, 'common/article.list.html'),
		{
			articles,
			user
		}
	)
}

exports.renderCategoryHtml = function (categoryName, user) {
	return ejs.renderFile(
		path.join(__dirname, '../../', process.env.VIEW_PATH, 'common/category.html'),
		{
			categoryName, user
		}
	)
}

exports.renderRegisterAuthCodeHtml = function (authCode) {
	return ejs.renderFile(
		path.join(__dirname, '../../', process.env.VIEW_PATH, 'common/registerAuthCode.html'),
		{
			authCode
		}
	)

}

/**
 * 生成验证码
 */
exports.createAuthCode = (len = 6) => {
    let result = ''
    while (len > 0) {
        result += Math.floor(Math.random() * 10)
        len--
    }
    return result
}
