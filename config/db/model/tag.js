const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Tag = sequelize.define('Tag', {
		name: DataTypes.STRING,
		desc: DataTypes.STRING,
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
		tableName: 'ws_tag',
	});

	Tag.associate = function (models) {
		Tag.User = Tag.belongsTo(models.User, {
			foreignKey: 'user'
		})
		Tag.Article = Tag.belongsToMany(models.Article, {
			as: 'articles',
			through: 'ws_article_tag',
			foreignKey: 'tag_article'
		})
	}
	return Tag
}
