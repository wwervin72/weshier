const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Annex = sequelize.define('Annex', {
		path: DataTypes.STRING,
		fileName: DataTypes.STRING,
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
		tableName: 'ws_annex'
	})

	Annex.associate = function (models) {
		Annex.User = Annex.belongsTo(models.User, {
			foreignKey: 'user'
		})
	}

	return Annex
}
