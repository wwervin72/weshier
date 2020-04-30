const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const ArticleTag = sequelize.define('ArticleTag', {
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
		tableName: 'ws_article_tag',
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	})
	return ArticleTag
}
