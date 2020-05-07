const path = require('path')
const fs = require('fs')
const config = require('config')
const upload = require('../utils/upload')
const models = require('../../config/db/model')
const { saveRedisKey, verifyRedisKeyVal, expireRedisKey } = require('../../config/db/redis')
const { renderCommentListHtml, renderSubCommentListHtml, renderCategoryHtml, renderRegisterAuthCodeHtml,
	createAuthCode, respondOrRedirect, respond, respEntity } = require('../utils')
const { sendEmail } = require('./../../config/mailer/index')

/**
 * 登陆成功后跳转
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.loginRedirect = (req, res, next) => {
    const redirectTo = req.session.redirectTo || '/'
    delete req.session.redirectTo
    res.cookie('userName', req.user.userName, {
        expires: config.cookie.expires
	})
	respondOrRedirect({ res }, redirectTo, respEntity({ redirectTo }, '登录成功'))
}

/**
 * 登录失败返回
 */
exports.loginFailed = (req, res, next) => {
	return respond(res, respEntity(null, '用户名或密码不正确'), 200)
}

/**
 * 退出登录
 */
exports.logout = (req, res, next) => {
	req.logout()
    res.cookie('userName', '', {
        maxAge: -1
    })
    res.redirect('/')
}

exports.uploadFile = (req, res, next) => {
	try {
		upload(req, res, (err, fileName) => {
			if (err) return next(err)
			return respond(res,
				respEntity(req.files.file.map(file => `/${process.env.ASSETS_PREFIX}/${process.env.UPLOAD_DIR}/${file.filename}`)),
			200)
		})
	} catch (err) {
		return next(err)
	}
}

/**
 * 生成邀请码
 */
exports.generateInviteCode = function name() {
	saveRedisKey(config.registerInviteCodeKeyPrefix, createAuthCode()).then(result => {
		return respond(res, respEntity(null, '邀请码生成成功'), 200)
	}).catch(err => {
		return respond(res, respEntity(null, false, '邀请码生成失败'), 200)
	})
}

/**
 * 注册用户
 */
exports.register = (req, res, next) => {
	let key = config.registerAuthcodeKeyPrefix + req.body.email
	Promise.all([
		verifyRedisKeyVal(key, req.body.authCode),
		verifyRedisKeyVal(config.registerInviteCodeKeyPrefix, req.body.inviteCode)
	]).then(isValid => {
		let [authCodeValid, inviteCodeValid] = isValid
		if (authCodeValid && inviteCodeValid) {
			models
				.User
				.create(req.body)
				.then(user => {
					expireRedisKey(config.registerInviteCodeKeyPrefix)
					expireRedisKey(key)
					return respond(res, respEntity(user, '创建成功'), 200)
				})
				.catch(err => {
					if (err.name === 'SequelizeValidationError') {
						return respond(res, respEntity(null, false, err.errors.map(el => el.message).join(', ')), 200)
					} else {
						return next(err)
					}
				})
		} else {
			return respond(res, respEntity(null, false, `${authCodeValid ? '验证码错误' : ' '}${inviteCodeValid ? '邀请码错误' : ''}`), 200)
		}
	}).catch(err => next(err))
}

/**
 * 根据用户 id 查询用户分类目录
 */
exports.queryUserCategory = function (req, res, next) {
	models.Category.findAll({
		where: {
			user: req.user.id
		}
	}).then(data => {
		return respond(res, respEntity(data), 200)
	}).catch(err => {
		return next(err)
	})
}

/**
 * 创建分类目录
 */
exports.createCategory = function (req, res, next) {
	const name = req.body.name
	if (!name) return respond(res, respEntity(null, false, '分类名不能为空'), 200)
	models.Category.findOne({
		where: {
			user: req.user.id,
			name
		}
	}).then(category => {
		if (category) {
			return respond(res, respEntity(null, false, '该分类名已存在，请重新输入'), 200)
		}
		return models.Category.create({
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
	}).catch(err => next(err))
}

/**
 * 删除分类目录
 */
exports.delCategory = function (req, res, next) {
	models.Category.update({
		status: '0'
	}, {
		where: {
			status: '1',
			name: req.body.name.trim(),
			user: req.user.id
		}
	}).then(data => {
		let status = !!data
		return respond(res, respEntity(null, status, `删除${status ? '成功' : '失败'}`), 200)
	}).catch(err => next(err))
}

/**
 * 修改头像
 */
exports.alterAvatar = function (req, res, next) {
	try {
		upload(req, res, (err, fileName) => {
			if (err) return next(err)
			let avatar = req.files.file[0].filename
			models.User.update({
				avatar
			}, {
				where: {
					id: req.user.id
				}
			}).then(result => {
				let status = result[0] >= 1
				return respond(res, respEntity(
					`/${process.env.ASSETS_PREFIX}/${process.env.UPLOAD_DIR}/${avatar}`,
					status, '更新' + (status ? '成功' : '失败')), 200)
			})
		})
	} catch (error) {
		next(error)
	}
}

/**
 * 留言
 */
exports.leaveMsg = async function (req, res, next) {
	let content = req.body.content && req.body.content.trim()
	if (!content) {
		return respond(res, respEntity(null, false, '留言内容不能为空'), 200)
	}
	let article = await models.Article.findOne({
		where: {
			id: req.body.articleId,
			status: '1'
		},
		attributes: ['allow_comment']
	})
	if (!article) {
		return respond(res, respEntity(null, false, '评论文章不存在'), 200)
	}
	if (!article.allow_comment) {
		return respond(res, respEntity(null, false, '该文章已关闭了评论功能'), 200)
	}
	let reply = req.body.comment
	let atUser = req.body.atUser
	let p = []
	if (reply) {
		p.push(models.Comment.findOne({
			where: {
				id: reply,
				status: '1'
			},
			attributes: ['id']
		}))
	}
	if (atUser) {
		p.push(models.User.findOne({
			where: {
				id: atUser,
				status: '1'
			},
			attributes: ['id', 'nickName', 'userName']
		}))
	}
	let [replyEntity, atUserEntity] = await Promise.all(p)
	if ((reply && !replyEntity) || (atUser && !atUserEntity)) {
		return respond(res, respEntity(null, false, '回复失败'), 200)
	}

	models
		.Comment
		.create({
			content,
			comment_article: req.body.articleId,
			reply: reply,
			comment_author: req.user.id,
			replyComment: atUser && {
				reply_user: atUser
			}
		}, atUser && {
			include: [
				{
					association: models.Comment.ReplyComment,
					as: 'replyComment'
				}
			],
		})
		.then(async comment => {
			// 去掉 dataValues 属性，直接返回数据源
			// 查询里面 可以直接设置 raw: true
			comment = comment.get({ plain: true })
			comment.author = req.user
			if (atUser) {
				comment.replyComment.replyUser = atUserEntity
			}
			let p
			if (comment.reply) {
				// 回复 子评论
				p = renderSubCommentListHtml([comment])
			} else {
				p = renderCommentListHtml([comment])
			}
			p.then((html) => {
				const status = !!comment
				return respond(res, respEntity(
					status ? {
						comment,
						html
					} : null,
					status,
					'留言' + status ? '成功' : '失败'
				), 200)
			}).catch(err => next(err))
		})
		.catch(err => next(err))
}

/**
 * 查询留言列表
 */
exports.queryLeaveMsg = function (req, res, next) {
	models.Comment.queryCommentList({
		comment_article: null,
			reply: null
	}).then(data => {
		return respond(res, respEntity(data), 200)
	}).catch(err => next(err))
}

/**
 * 上传简历
 */
exports.uploadResume = function (req, res, next) {
	try {
		upload(req, res, (err, fileName) => {
			if (err) return next(err)
			let resume = req.files.file[0].filename
			models.User.update({
				resume
			}, {
				where: {
					id: req.user.id,
					status: '1'
				}
			}).then(result => {
				let status = result[0] > 0
				return respond(res, respEntity(resume, status, `简历更新${status ? '成功' : '失败'}`), 200)
			}).catch(err => next(err))
		})
	} catch (err) {
		return next(err)
	}
}

/**
 * 下载简历
 */
exports.downloadResume = function (req, res, next) {
	models.User.findOne({
		where: {
			userName: req.params.userName
		},
		attributes: ['resume']
	}).then(user => {
		if (!user) return next()
		const resumePath = path.join(__dirname, '../../', `/public/${process.env.UPLOAD_DIR}/${user.resume}`)
		if (!fs.existsSync(resumePath)) return next()
		let fileReadStream = fs.createReadStream(resumePath)
		// 这样下载下来的文件，文件名是混乱的，
		// 需要在报文里传入 Content-Disposition 告诉浏览器文件名( Content-type 可以不设置)
		res.set({
			"Content-type": "application/octet-stream",
			"Content-Disposition": "attachment;filename=" + encodeURI(user.resume)
		})
		fileReadStream.on('data', chunk => res.write(chunk, 'binary'))
		fileReadStream.on('end', () => res.end())
	}).catch(err => next(err))
}

exports.updateUserInfo = function (req, res, next) {
	models.User.update(req.body, {
		where: {
			id: req.user.id
		}
	}).then(([result]) => {
		const status = result >= 1
		return respond(res, respEntity(null, status, `个人信息更新${status ? '成功' : '失败'}`), 200)
	}).catch(err => {
		if (err.name === 'SequelizeValidationError') {
			return respond(res, respEntity(null, false, err.errors.map(el => el.message).join(', ')), 200)
		}
		return next(err)
	})
}

/**
 * 发送注册账号邮件
 */
exports.sendRegisterAuthcodeEmail = function (req, res, next) {
	let email = req.query.email
	models.User.findOne({
		where: {
			email
		}
	}).then(exist => {
		if (exist) return respond(res, respEntity(null, false, '该邮箱已被注册，请重新输入'), 200)
		let authCode = createAuthCode()
		renderRegisterAuthCodeHtml(authCode).then(html => {
			Promise.all([
				sendEmail({
					to: email,
					subject: '微识-账号注册验证码',
					html
				}),
				saveRedisKey(config.registerAuthcodeKeyPrefix + email, authCode)
			]).then(result => {
				return respond(res, respEntity(null, '验证码已发送到邮箱，30分钟内有效，请及时处理'), 200)
			}).catch(err => next(err))
		}).catch(err => next(err))
	}).catch(err => next(err))
}
