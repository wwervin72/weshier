const config = require('config')

exports.create = {
	content: {
		in: ['body'],
		isString: {
			errorMessage: "留言内容必须是字符串"
		},
		custom: {
			options: (val) => {
				let len = val ? val.trim().length : 0
				if (len <= 0) {
					throw new Error("留言内容不能为空")
				} else if (len > config.commentMaxLen) {
					throw new Error("留言内容最长200个字符")
				}
				return true
			}
		}
	}
}
