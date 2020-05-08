const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Tag = sequelize.define('Tag', {
		name: DataTypes.STRING,
		desc: DataTypes.STRING,
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
		tableName: 'ws_tag',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		deletedAt: 'deleted_at',
		paranoid: true
	});

	Tag.associate = function (models) {
		Tag.User = Tag.belongsTo(models.User, {
			foreignKey: 'user'
		})
		Tag.Article = Tag.belongsToMany(models.Article, {
			as: 'articles',
			through: models.ArticleTag,
			foreignKey: 'tag_id'
		})
	}

	return Tag
}
