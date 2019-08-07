const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Code = sequelize.define('Code', {
		type: DataTypes.STRING,
		content: DataTypes.TEXT,
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
		tableName: 'ws_code'
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
