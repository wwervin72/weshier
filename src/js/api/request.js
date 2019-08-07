import axios from 'axios'
import qs from 'querystring'
import { api } from './url'
import { redirectUrlKey } from '../utils'

const instance = axios.create({
	validateStatus: function (status) {
		return status >= 200 && status <= 510
	},
	withCredentials: true
})

instance.interceptors.response.use(res => {
	if (res.data.code === 401) {
		// 需要登录
		sessionStorage.setItem(redirectUrlKey, window.location.href)
		window.location.href = '/login'
	}
	return Promise.resolve(res.data)
}, error => {
	return Promise.reject(error)
})

instance.interceptors.request.use(config => {
	if (config.method === 'post' && config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
		config.data = qs.stringify(config.data)
	}
	return config
}, err => {
	return Promise.reject(err)
})

export default ({
	method = 'GET',
	baseURL = api,
	url = '',
	data = {},
	params = {},
	headers = {
		'Content-Type': 'application/json'
	},
	timeout = 10000
}) => {
	return instance({
		method,
		baseURL,
		url,
		data,
		params,
		headers,
		timeout
	})
}
