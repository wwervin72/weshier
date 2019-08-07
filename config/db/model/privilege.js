const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const Privilege = sequelize.define('Privilege', {
		path: DataTypes.STRING,
		role: DataTypes.STRING,
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
		tableName: 'ws_privilege',
	});

	return Privilege
}
