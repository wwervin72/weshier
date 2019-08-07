import { login } from './api'
import { copySiteInfo, redirectUrlKey } from './utils/index'

$(function () {
	const form = document.querySelector('#signin_form')
	const uName = document.querySelector('input[name=userName]')
	const uPwd = document.querySelector('input[name=passWord]')
	const autoLogin = document.querySelector('input[name=autoLogin]')

	form.onsubmit = evt => {
		evt.preventDefault()
		const userName = uName.value.trim()
		const passWord = uPwd.value.trim()
		const rememberMe = autoLogin.value
		if (!uName) {
			alert('请输入用户名')
			return
		}

		if (!uPwd) {
			alert('请输入密码')
			return
		}
		login({
			userName,
			passWord,
			rememberMe
		}).then(res => {
			if (res.status) {
				let redirect = sessionStorage.getItem(redirectUrlKey) || res.redirect
				if (redirect) {
					sessionStorage.clear(redirectUrlKey)
					window.location.href = redirect
				}
			} else {
				alert(res.msg)
			}
		})
	}
})
copySiteInfo()
