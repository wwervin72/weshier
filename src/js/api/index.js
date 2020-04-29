import request from './request'

export function uploadFormData (data) {
	return request({
		url: 'upload',
		method: 'post',
		data
	})
}

export function login (data) {
	return request({
		url: 'login',
		method: 'POST',
		data
	})
}

export function register (data) {
	return request({
		url: '/register',
		data,
		method: 'POST'
	})
}

export function sendRegisterAuthCode(email) {
	return request({
		url: `/register/authCode`,
		params: { email }
	})
}

export function saveArticle (data) {
	return request({
		url: '/article',
		data,
		method: 'POST'
	})
}

export function fetchArticle (articleId) {
	return request({
		url: `/article/edit/${articleId}`
	})
}

export function fetchArticleContent (articleId) {
	return request({
		url: `/article/show/${articleId}`
	})
}

export function fetchArticleCommentHtml (articleId, params) {
	return request({
		url: `/article/${articleId}/comments`,
		params
	})
}

export function updateArticle (data) {
	return request({
		url: '/article',
		data,
		method: 'PUT'
	})
}

export function delArticle (data) {
	return request({
		url: '/article',
		data,
		method: 'DELETE'
	})
}

export function heartArticle (articleId) {
	return request({
		url: `/article/${articleId}/heart`
	})
}

export function cancelHeartArticle (articleId) {
	return request({
		url: `/article/${articleId}/heart`,
		method: 'DELETE'
	})
}

export function fetchEmojiPanel () {
	return request({
		url: `/emoji/html`,
		headers: {
			'Accept': "text/html"
		}
	})
}

export function leaveMsg (data) {
	return request({
		url: `/message/leave`,
		data,
		method: 'post'
	})
}

export function fetchLeaveMsg () {
	return request({
		url: `/message/leave`
	})
}

export function fetchLeaveMsgHtml () {
	return request({
		url: `/message/leave/html`
	})
}

export function fetchArticleListHtmlPagination(params) {
	return request({
		url: `/article/pagination`,
		params
	})
}

export function fetchUserCategoryList() {
	return request({
		url: `/category`
	})
}

export function createCategory(data) {
	return request({
		url: `/category`,
		method: 'post',
		data
	})
}

export function delCategory(data) {
	return request({
		url: `/category`,
		method: 'delete',
		data
	})
}

export function updateIndividualInfo(data) {
	return request({
		url: `/personal/info`,
		method: 'put',
		data
	})
}

export function uploadResume(data) {
	return request({
		headers: {
			'Content-Type':'multipart/form-data'
		},
		url: `/upload/resume`,
		data,
		method: 'post'
	})
}
