const { userNameReg } = require('../../../app/utils/variables')
const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Heart = sequelize.define('Heart', {
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
		tableName: 'ws_heart'
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
