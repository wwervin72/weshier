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
		tableName: 'ws_carousel',
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
