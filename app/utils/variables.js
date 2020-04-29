exports.userNameReg = /^[a-zA-Z0-9]{5,16}$/
exports.userNameTips = '账号需为5到16个长度的字母或数字'

exports.passWordReg = /^[a-zA-Z0-9-_.]{5,20}$/
exports.passWordTips = '密码必须是长度为5到20个的字母、数字、-、_、.'

exports.fullPathReg = /^(https?:)?\/\//
