const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Reply = sequelize.define('Reply', {
		createdAt: {
			type: DataTypes.DATE,
			get() {
				return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss')
			}
		},
	}, {
		tableName: 'ws_reply'
	})

	Reply.associate = function (models) {
		Reply.ReplyComment = Reply.belongsTo(models.Comment, {
			foreignKey: 'reply_comment',
			as: 'replyComment'
		})
		Reply.ReplyUser = Reply.belongsTo(models.User, {
			foreignKey: 'reply_user',
			as: 'replyUser'
		})
	}

	return Reply
}
