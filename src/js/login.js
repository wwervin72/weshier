import { login } from './api'
import { copySiteInfo, redirectUrlKey, message } from './utils/index'

const form = document.querySelector('#signin_form')
const uName = document.querySelector('input[name=userName]')
const uPwd = document.querySelector('input[name=passWord]')
const autoLogin = document.querySelector('input[name=autoLogin]')

uName.focus()

form.onsubmit = evt => {
	evt.preventDefault()
	const userName = uName.value.trim()
	const passWord = uPwd.value.trim()
	const rememberMe = autoLogin.value
	if (!userName) {
		message('请输入用户名', 'info')
		return
	}

	if (!passWord) {
		message('请输入密码', 'info')
		return
	}
	login({
		userName,
		passWord,
		rememberMe
	}).then(res => {
		if (res.status) {
			let redirect = sessionStorage.getItem(redirectUrlKey) || res.data.redirectTo
			if (redirect) {
				sessionStorage.clear(redirectUrlKey)
				window.location.href = redirect
			}
		}
	}).catch(e => {})
}
copySiteInfo()
