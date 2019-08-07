const local = require('./passport/local')
const github = require('./passport/github')
const models = require("./db/model")

module.exports = passport => {
    passport.serializeUser((user, done) => done(null, user))
	passport.deserializeUser((user, done) => {
		models
			.User
			.findOne({
				where: {
					id: user.id
				}
			})
			.then(user => {
				done(null, user)
				return user
			})
			.catch(err => done(err, false))
	})

    passport.use(local)
    passport.use(github)
}
