const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Annex = sequelize.define('Annex', {
		path: DataTypes.STRING,
		fileName: DataTypes.STRING,
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
		tableName: 'ws_annex',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	})

	Annex.associate = function (models) {
		Annex.User = Annex.belongsTo(models.User, {
			foreignKey: 'user'
		})
	}

	return Annex
}
