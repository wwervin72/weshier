const { createNickname, makeSalt } = require('../../../app/utils')
const { userNameReg, userNameTips, passWordReg, passWordTips, fullPathReg } = require('../../../app/utils/variables')
const crypto = require('crypto')
const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
	const defaultAvatar = '/assets/image/avatar.png'
	const User = sequelize.define('User', {
		userName: {
			type: DataTypes.STRING,
			unique: {
				msg: '用户名已存在，请重新输入'
			},
			validate: {
				matches: {
					args: [userNameReg],
					msg: userNameTips
				}
			}
		},
		passWord: {
			type: DataTypes.STRING,
			validate: {
				notEmpty: {
					msg: passWordTips
				}
			},
			set (val) {
				this.setDataValue('passWord', this.encryptPassword(val))
			}
		},
		role: {
			type: DataTypes.ENUM,
			values: ['0', '1'],
			// 0：普通账号 1：管理员
			defaultValue: '0'
		},
		status: {
			type: DataTypes.ENUM,
			// 0：未审核 1：审核通过
			values: ['0', '1'],
			defaultValue: '0'
		},
		provide: {
			type: DataTypes.STRING,
			defaultValue: 'local'
		},
		avatar: {
			type: DataTypes.STRING,
			defaultValue: defaultAvatar,
			get() {
				let avatar = this.getDataValue('avatar')
				let fullPath = fullPathReg.test(avatar)
				return defaultAvatar === avatar || fullPath ? avatar : `/${process.env.ASSETS_PREFIX}/${process.env.UPLOAD_DIR}/${avatar}`
			}
		},
		url: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isUrl: {
					msg: '个人网站格式不正确'
				}
			}
		},
		bio: {
			type: DataTypes.TEXT,
			defaultValue: '这家伙很懒，什么都没留下。',
			validate: {
				len: {
					args: [[0, 200]],
					msg: 'bio最多为200个字'
				}
			}
		},
		resume: DataTypes.STRING,
		email: {
			type: DataTypes.STRING,
			unique: {
				msg: '该邮箱已被注册，请更换邮箱'
			},
			validate: {
				isEmail: {
					msg: '邮箱格式不正确'
				}
			}
		},
		phone: {
			type: DataTypes.STRING,
			validate: {
				isMobilePhone: {
					locale: ['zh-CN'],
					msg: '电话号码格式不正确'
				}
			}
		},
		weibo: {
			type: DataTypes.STRING
		},
		github: {
			type: DataTypes.STRING,
			validate: {
				isUrl: {
					msg: 'github网站格式不正确'
				}
			}
		},
		qq: DataTypes.STRING,
		wechat: DataTypes.STRING,
		nickName: {
			type: DataTypes.STRING,
			defaultValue: createNickname(),
			validate: {
				len: [2, 10]
			}
		},
		salt: {
			type: DataTypes.STRING,
			defaultValue: makeSalt()
		},
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
		tableName: 'ws_user',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		deletedAt: 'deleted_at',
		// 不从数据库中删除数据，而只是增加一个 deletedAt 标识当前时间
		paranoid: true
	})
	User.prototype.encryptPassword = function (pwd, salt) {
		if (!passWordReg.test(pwd)) return ''
		try {
			return crypto
				.createHmac('sha1', salt || this.salt)
				.update(pwd)
				.digest('hex')
		} catch (err) {
			return ''
		}
	}
	User.associate = function (models) {
		User.Article = User.hasMany(models.Article, {
			foreignKey: 'article_author'
		})
		User.Tag = User.hasMany(models.Tag, {
			foreignKey: 'user'
		})
		User.Comment = User.hasMany(models.Comment, {
			foreignKey: 'comment_author'
		})
		User.Heart = User.hasMany(models.Heart, {
			foreignKey: 'user'
		})
		User.Category = User.hasMany(models.Category, {
			foreignKey: 'user'
		})
		User.Replied = User.hasMany(models.Reply, {
			foreignKey: 'reply_user'
		})
	}

	return User
}
