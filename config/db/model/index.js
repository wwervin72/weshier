const path = require('path')
const config = require('config')
const Sequelize = require('sequelize')
const requireDirectory = require("require-directory")

const db = {}

const sequelize = new Sequelize(config.mysql)

sequelize
	.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.')
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err)
	})

const modelBlackList = /index.js$/
const modelWhiteList = /.js$/

function fillterEntryFile(path) {
	if (modelBlackList.test(path)) {
		return true
	}
	return false
}

function fillterModel(path) {
	if (modelWhiteList.test(path)) {
		return true
	}
	return false
}

function registerModel(obj, pathStr) {
	const model = sequelize.import(path.basename(pathStr, '.js'), obj)
	db[model.name] = model
}

requireDirectory(module, './', {
	exclude: fillterEntryFile,
	include: fillterModel,
	visit: registerModel
})

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db)
	}
});

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
