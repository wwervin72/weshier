const express = require('express')
const { checkSchema } = require('express-validator')
const pageRouter = express.Router()
const apiRouter = express.Router()

const config = require('config')
const { apiRequestLogger, apiResponseLogger } = require('./middleware/logger')
const userCtrl = require('../app/controller/user.controller')
const articleCtrl = require('../app/controller/article.controller')
const pageCtrl = require('../app/controller/page.controller')
const annexCtrl = require('../app/controller/annex.controller')
const tagCtrl = require('../app/controller/tag.controller')
const categoryCtrl = require('../app/controller/category.controller')
const { requireSignIn, verifyIsManager, verifyLocalAccount } = require('./middleware/authorization.js')
const articleSchema = require('../app/schema/article')
const tagSchema = require('../app/schema/tag')
const categorySchema = require('../app/schema/category')
const userSchema = require('../app/schema/user')

module.exports = function (app, passport) {
	const pauth = passport.authenticate.bind(passport)

	// 首页
	pageRouter.get('/', pageCtrl.index)
	// 登录
	pageRouter.get('/login', pageCtrl.renderLogin)
	// 注册
	pageRouter.get('/coding', pageCtrl.isCoding)
	// 注册
	pageRouter.get('/join', pageCtrl.renderRegister)
	// 重置密码
	pageRouter.get('/pwd_reset', pageCtrl.renderResetPwdHtml)
	// blog 列表界面
	pageRouter.get('/blog', pageCtrl.blog)
	// 写作
	pageRouter.get('/write', requireSignIn, verifyLocalAccount, pageCtrl.editor)
	// 编辑
	pageRouter.get('/write/:articleId', requireSignIn, pageCtrl.editor)
	// 用户主页
	pageRouter.get('/u/:userName', pageCtrl.userHomePage)
	// 用户实验室
	pageRouter.get('/practice/:userName', pageCtrl.practicePages)
	// 用户标签文章页
	pageRouter.get('/u/:userName/tag/:tagName', pageCtrl.tagArticles)
	// 用户分类文章页
	pageRouter.get('/u/:userName/category/:categoryName', pageCtrl.categoryArticles)
	// 用户文章按时间统计
	pageRouter.get('/u/:userName/archive/:year/:month', pageCtrl.articleStatisticByDate)
	// 设置界面
	pageRouter.get('/setting', requireSignIn, verifyLocalAccount, pageCtrl.setting)
	// 附件管理
	pageRouter.get('/annex', requireSignIn, verifyLocalAccount, pageCtrl.annex)
	// 文章界面
	pageRouter.get('/a/:articleId', pageCtrl.article)
	// 编辑文章
	pageRouter.get('/a/edit/:articleId', requireSignIn, verifyLocalAccount, pageCtrl.editArticle)
	// 留言
	pageRouter.get('/message/leave', requireSignIn, pageCtrl.renderLeaveMsg)

	// api
	apiRouter.post('/login',
		pauth('local', {
			failureRedirect: '/api/login/failed'
		}), userCtrl.loginRedirect)
	apiRouter.get('/auth/github', passport.authenticate('github'))
	apiRouter.get('/auth/github/callback', passport.authenticate('github', {
			failureRedirect: '/login'
		}), userCtrl.loginRedirect)
	apiRouter.get('/login/failed', userCtrl.loginFailed)
	// 退出登录
	apiRouter.get('/logout', userCtrl.logout)
	// 上传图片
	apiRouter.post('/upload', requireSignIn, verifyLocalAccount, userCtrl.uploadFile)
	// 更新信息
	apiRouter.put('/personal/info', requireSignIn, verifyLocalAccount, userCtrl.updateUserInfo)
	// 上传简历
	apiRouter.post('/upload/resume', requireSignIn, verifyLocalAccount, userCtrl.uploadResume)
	// 下载简历
	apiRouter.get('/resume/:userName', userCtrl.downloadResume)
	// 更换头像
	apiRouter.post('/alterAvatar', requireSignIn, verifyLocalAccount, userCtrl.alterAvatar)
	// 上传附件
	apiRouter.post('/uploadAnnex', requireSignIn, verifyLocalAccount, annexCtrl.uploadAnnex)
	// 保存文章
	apiRouter.post('/article', requireSignIn, verifyLocalAccount, checkSchema(articleSchema.create), articleCtrl.saveArticle)
	// 获取 emoji 面板html
	apiRouter.get('/emoji/html', pageCtrl.generateEmojiPanelHtml)
	// 获取文章详情
	apiRouter.get('/article/edit/:articleId', articleCtrl.fetchArticleEditDetail)
	// 获取文章展示详情
	apiRouter.get('/article/show/:articleId', articleCtrl.fetchArticleShowDetail)
	// 获取文章评论列表
	apiRouter.get('/article/:articleId/comments', articleCtrl.queryArticleComments)
	// 点赞文章
	apiRouter.get('/article/:articleId/heart', requireSignIn, articleCtrl.heartArticle)
	// 取消点赞文章
	apiRouter.delete('/article/:articleId/heart', requireSignIn, articleCtrl.cancelHeartArticle)
	// 更新文章
	apiRouter.put('/article', requireSignIn, verifyLocalAccount, checkSchema(articleSchema.update), articleCtrl.updateArticle)
	// 删除
	apiRouter.delete('/article', requireSignIn, verifyLocalAccount, articleCtrl.delArticle)
	// blog 文章分页
	apiRouter.get('/article/pagination', pageCtrl.blogArticlePagination)
	// 生成邀请码
	apiRouter.get('/register/inviteCode', requireSignIn, verifyIsManager, userCtrl.generateInviteCode)
	// 发送邮件 注册验证码
	apiRouter.get('/register/authCode', userCtrl.sendRegisterAuthcodeEmail)
	// 注册
	apiRouter.post('/register', checkSchema(userSchema.create), userCtrl.register)

	// 根据用户 id 获取用户分类目录
	apiRouter.get('/category', requireSignIn, verifyLocalAccount, userCtrl.queryUserCategory)
	// 创建分类目录
	apiRouter.post('/category', requireSignIn, verifyLocalAccount, checkSchema(categorySchema.create), categoryCtrl.create)
	// 删除分类目录
	apiRouter.delete('/category', requireSignIn, verifyLocalAccount, categoryCtrl.delete)

	apiRouter.post('/tag', requireSignIn, verifyLocalAccount, checkSchema(tagSchema.create), tagCtrl.create)
	apiRouter.delete('/tag', requireSignIn, verifyLocalAccount, tagCtrl.delete)
	// 获取 tags 列表
	apiRouter.get('/tags', tagCtrl.getTagList)

	// 用户留言
	apiRouter.post('/message/leave', requireSignIn, userCtrl.leaveMsg)
	// 获取留言列表
	apiRouter.get('/message/leave', userCtrl.queryLeaveMsg)
	// 获取留言列表
	apiRouter.get('/message/leave/html', pageCtrl.renderLeaveMsgCommentsHtml)

	app.use(apiRequestLogger)
	app.use(function (req, res, next) {
		res.locals.user = req.user
		res.locals.member = null
		return next()
	})

	app.use(pageRouter)
	app.use(config.apiPrefix, apiRouter)
	app.use(apiResponseLogger)

	app.use(pageCtrl.serverError)
	app.use(pageCtrl.notFound)
}
