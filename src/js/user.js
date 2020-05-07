import { copySiteInfo, switchBrowserTabs, addHeaderScrollListener, scrollLoadMore, bindGoTopEvent,
	switchUserMenu, autoCloseHeaderMenu } from './utils'
import { fetchArticleListHtmlPagination, uploadResume } from './api/index'

;(function () {
	const articleContainer = document.querySelector('#article_list')
	let userName = window.location.pathname.match(/\/u\/([A-Za-z0-9]+)\/?$/)[1]
	function loadMoreArticles(pageCount, pageNum) {
		return fetchArticleListHtmlPagination({
			pageCount,
			pageNum,
			userName
		}).then(res => {
			if (res.status) {
				let div = document.createElement('div')
				div.innerHTML = res.data.html
				articleContainer.append(...div.children)
			}
			return res
		}).catch(e => {})
	}

	const downResume = document.querySelector('#down_resume')
	const contactMember = document.querySelector('#contact')
	document.querySelector('input[name=resume]').addEventListener('change', evt => {
		let formData = new FormData()
		let target = evt.target
		formData.append('file', target.files[0]);
		uploadResume(formData).then(res => {
			if (res.status) {
				if (!downResume) {
					let downResumeDom = document.createElement('a')
					downResumeDom.setAttribute('id', 'down_resume')
					downResumeDom.setAttribute('href', '/api/resume/' + userName)
					downResumeDom.setAttribute('filename', res.data)
					downResumeDom.innerHTML = '下载简历'
					contactMember.insertBefore(downResumeDom, target.parentNode)
				}
			}
		}).catch(e => {})
	})

	copySiteInfo()
	switchBrowserTabs()
	autoCloseHeaderMenu()
	addHeaderScrollListener()
	switchUserMenu()
	scrollLoadMore(loadMoreArticles)
	bindGoTopEvent()
})()
