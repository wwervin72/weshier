const localStorategy = require('passport-local').Strategy
const models = require('../db/model')

module.exports = new localStorategy({
    usernameField: 'userName',
    passwordField: 'passWord',
    passReqToCallback: true
}, function (req, userName, passWord, done) {
	models
		.User
		.findOne({
			where: {
				userName,
				status: '1',
				provide: 'local'
			}
		})
		.then(user => {
			if (!user || user.passWord !== user.encryptPassword(passWord)) {
				return done(null, false)
			} else {
				return done(null, user)
			}
		})
		.catch(err => {
			return done(err)
		})
})
