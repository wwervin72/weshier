const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Practice = sequelize.define('Practice', {
		title: DataTypes.STRING,
		desc: DataTypes.STRING,
		link: DataTypes.STRING,
		thumbnail: DataTypes.STRING,
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
		tableName: 'ws_practice',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
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
