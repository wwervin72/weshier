const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Code = sequelize.define('Code', {
		type: DataTypes.STRING,
		content: DataTypes.TEXT,
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
		tableName: 'ws_code',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	})

	Code.associate = function (models) {
		Code.User = Code.belongsTo(models.User, {
			foreignKey: 'code_author'
		})
		Code.Practice = Code.belongsTo(models.Practice, {
			foreignKey: 'code_practice'
		})
	}

	return Code
}
