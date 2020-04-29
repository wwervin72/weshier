const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Heart = sequelize.define('Heart', {
		created_at: {
			type: DataTypes.DATE,
			get() {
				return dayjs(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm:ss')
			}
		},
		updated_at: {
			type: DataTypes.DATE,
			get() {
				return dayjs(this.getDataValue('updated_at')).format('YYYY-MM-DD HH:mm:ss')
			}
		}
	}, {
		tableName: 'ws_heart',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	})

	Heart.associate = function (models) {
		Heart.User = Heart.belongsTo(models.User, {
			foreignKey: 'user'
		})
		Heart.Article = Heart.belongsTo(models.Article, {
			foreignKey: 'article_heart'
		})
		Heart.Comment = Heart.belongsTo(models.Comment, {
			foreignKey: 'comment_heart',
			as: 'commentHeart'
		})
	}
	return Heart
}
