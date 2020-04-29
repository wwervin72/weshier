const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Category = sequelize.define('Category', {
		name: DataTypes.STRING,
		desc: DataTypes.STRING,
		status: {
			type: DataTypes.ENUM,
			// 默认为 1 正常值，0：已删除
			values: ['0', '1'],
			defaultValue: '1'
		},
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
		tableName: 'ws_category',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	});

	Category.associate = function (models) {
		Category.User = Category.belongsTo(models.User, {
			foreignKey: 'user'
		})
		Category.Article = Category.hasMany(models.Article, {
			foreignKey: 'article_category'
		})
	}
	return Category
}
