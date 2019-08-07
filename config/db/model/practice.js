const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Practice = sequelize.define('Practice', {
		title: DataTypes.STRING,
		desc: DataTypes.STRING,
		link: DataTypes.STRING,
		thumbnail: DataTypes.STRING,
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
		tableName: 'ws_practice'
	})

	Practice.associate = function (models) {
		Practice.User = Practice.belongsTo(models.User, {
			foreignKey: 'practice_author'
		})
		Practice.Code = Practice.hasMany(models.Code, {
			foreignKey: 'code_practice'
		})
	}

	return Practice
}
