const githubStrategy = require('passport-github').Strategy;
const config = require('config');
const models = require('../../config/db/model')
const Op = models.Sequelize.Op

module.exports = new githubStrategy({
	clientID: config.github.clientID,
	clientSecret: config.github.clientSecret,
	callbackURL: config.github.callbackURL
}, (accessToken, refreshToken, profile, done) => {
	const userName = profile.username
	const email = profile._json.email
	models.User.findOne({
		where: {
			[Op.or]: [
				{
					email: profile._json.email
				},
				{
					userName: profile.username
				}
			]
		}
	}).then(exist => {
		if (exist) {
			return done(null, exist);
		} else {
			// 创建账号
			return models.User.create({
				email,
				userName,
				status: '1',
				provide: profile.provider,
				avatar: profile._json.avatar_url,
				url: profile._json.html_url,
				bio: profile._json.bio,
				github: profile._json.html_url,
				nickName: profile._json.displayName
			}).then(user => {
				return done(null, user)
			}).catch(err => done(err))
		}
	}).catch(err => done(err))
});
