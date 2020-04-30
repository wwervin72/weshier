const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Carousel = sequelize.define('Carousel', {
		desc: {
			type: DataTypes.STRING
		},
		cover: {
			type: DataTypes.STRING
		},
		url: {
			type: DataTypes.STRING
		},
		title: {
			type: DataTypes.STRING
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
		tableName: 'ws_carousel',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		deletedAt: 'deleted_at',
		paranoid: true
	})

	Carousel.associate = function (models) {
		Carousel.User = Carousel.belongsTo(models.User, {
			foreignKey: 'user'
		})
		Carousel.Article = Carousel.belongsTo(models.Article, {
			foreignKey: 'article'
		})
	}
	return Carousel
}
