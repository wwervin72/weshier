const dayjs = require('dayjs')
const emojiReg = /:([\d\w_+-]+):/ig
module.exports = (sequelize, DataTypes) => {
	const Comment = sequelize.define('Comment', {
		content: {
			type: DataTypes.TEXT,
			validate: {
				len: {
					args: [[1, 300]],
					msg: '评论应该是1到300个字'
				}
			},
			get() {
				let content = this.getDataValue('content')
				while (emojiReg.test(content)) {
					content = content.replace(emojiReg, `<img src="/${process.env.ASSETS_PREFIX}/image/emoji/$1.png">`)
				}
				return content
			}
		},
		status: {
			type: DataTypes.ENUM,
			// 0：删除 1：正常 2：审核
			values: ['0', '1', '2'],
			defaultValue: '1'
		},
		createdAt: {
			type: DataTypes.DATE,
			get() {
				return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss')
			}
		},
		updatedAt: {
			type: DataTypes.DATE,
			get() {
				return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss')
			}
		}
	}, {
		tableName: 'ws_comment'
	})

	Comment.associate = function (models) {
		Comment.User = Comment.belongsTo(models.User, {
			foreignKey: 'comment_author',
			as: 'author'
		})
		Comment.Article = Comment.belongsTo(models.Article, {
			foreignKey: 'comment_article',
			as: 'article'
		})
		Comment.Heart = Comment.hasMany(models.Heart, {
			foreignKey: 'comment_heart',
			as: 'commentHeart'
		})
		// 评论下的回复
		Comment.Reply = Comment.hasMany(Comment, {
			foreignKey: 'reply',
			as: 'replies'
		})
		// 一条评论回复一人 hasOne
		Comment.ReplyComment = Comment.hasOne(models.Reply, {
			foreignKey: 'reply_comment',
			as: 'replyComment'
		})
	}

	Comment.queryCommentList = function (models, params) {
		let userAttrs = ['id', 'userName', 'avatar', 'nickName']
		return new Promise((resolve, reject) => {
			Comment.findAll({
				where: Object.assign({
					status: '1'
				}, params),
				order: [
					['createdAt', 'ASC'],
					[Comment.Reply, 'createdAt', 'ASC']
				],
				include: [
					{
						model: models.User,
						attributes: userAttrs,
						as: 'author'
					},
					{
						model: models.Comment,
						as: 'replies',
						required: false,
						where: {
							status: '1',
						},
						include: [
							{
								model: models.User,
								attributes: userAttrs,
								as: 'author'
							},
							{
								model: models.Reply,
								as: 'replyComment',
								attributes: ['createdAt'],
								include: [
									{
										model: models.User,
										attributes: userAttrs,
										as: 'replyUser'
									},
								]
							}
						]
					}
				]
			}).then(data => {
				resolve(data)
			}).catch(err => reject(err))
		})
	}

	return Comment
}
