const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Reply = sequelize.define('Reply', {
		created_at: {
			type: DataTypes.DATE,
			get() {
				return dayjs(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm:ss')
			}
		},
	}, {
		tableName: 'ws_reply',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
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
