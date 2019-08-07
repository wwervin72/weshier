import { delArticle as delArticleApi } from './../api/index'

export const redirectUrlKey = 'originalUrl'

// 判断渲染模式是不是标准模式
export const isCSS1Compat = (document.compatMode || "") === "CSS1Compat"

export function delArticle (id) {
	if (window.confirm('确认删除该文章？')) {
		delArticleApi({
			id
		}).then(res => {
			console.log(res);
		})
	}
}
/**
 * 绑定事件
 * @param {*} ele
 * @param {*} type
 * @param {*} selector
 * @param {*} fn
 */
export function addEvent (ele, type, selector, fn) {
	if (fn == null) {
		fn = selector
		selector = null
	}
	ele.addEventListener(type, function (e) {
		let target
		if (selector) {
			target = e.target
			if (target.matches(selector)) {
				fn.call(target, e)
			}
		} else {
			fn(e)
		}
	}, false)
}

/**
 * 函数节流
 * @param {*} fn 每隔一段时间要执行的操作
 * @param {*} delay 时间间隔
 */
export function throttling (fn, delay) {
	let timer = null
	return function () {
		let context = this
		let args = arguments
		if (!timer) {
			timer = setTimeout(() => {
				fn.apply(context, args)
				timer = null
			}, delay);
		}
	}
}

/**
 * 切换浏览器 tab 页监听事件
 */
export function switchBrowserTabs () {
	let selfTitle = document.title
	addEvent(document, 'visibilitychange', function () {
		if (document.visibilityState=='hidden') {
			document.title = '糟糕！出BUG了，快看'
		} else {
			document.title = selfTitle
		}
	})
}


/**
 * 粘贴事件
 */
export function copySiteInfo () {
	addEvent(document.body, 'copy', function (evt) {
		var clipboardData = evt.clipboardData || window.clipboardData
		var selection = window.getSelection().toString();
		if (clipboardData && selection) {
			evt.preventDefault();
			var siteInfo = ["作者：ervin", "来自：微识", "链接：" + window.location.href, "", selection];
			clipboardData.setData("text/html", siteInfo.join("<br>")),
			clipboardData.setData("text/plain", siteInfo.join("\n"))
		}
	})
}

/**
 * 切换 emoji 面板
 * @param {*} evt
 */
export function switchEmojiTab (evt) {
	let target = evt.target
	let index = target.getAttribute('data-index') - 0
	let tab = document.querySelector(`.emoji_panel:nth-child(${index + 1})`)
	let activeSpot = document.querySelector('.emoji_tab > li.active')
	if (tab && activeSpot !== target) {
		let activeTab = document.querySelector('.emoji_panel.active')
		activeSpot.classList.remove('active')
		activeTab.classList.remove('active')
		target.classList.add('active')
		tab.classList.add('active')
	}
}

/**
 *
 * @param {*} target 当前元素
 * @param {*} ancesitorSelector 要找的祖先元素选择器
 */
export function findSpecifyAncesitorNode(target, ancesitorSelector) {
	let findTextarea = false
	let ancesitor
	while (!findTextarea) {
		ancesitor = (ancesitor || target).parentNode
		if (ancesitor && (ancesitor === document.body || ancesitor.matches(ancesitorSelector))) {
			findTextarea = true
		}
	}
	if (ancesitor === document.body) return null
	return ancesitor
}

/**
 * 选择表情
 * @param {*} target event.target
 */
export function selectEmoji (target) {
	let textarea = findSpecifyAncesitorNode(target, '.ws_cmt_editor')
	if (textarea) {
		textarea = textarea.querySelector('textarea[name=comment]')
		textarea.value = textarea.value + target.getAttribute('alt')
	}
}

/**
 * 滑动到顶部
 */
export function bindGoTopEvent() {
	addEvent(document.querySelector('#go_top'), 'click', evt => {
		window.scroll(0, 0)
	})
}

/**
 * 加载更多
 * @param {*} handleFn
 */
export function scrollLoadMore(handleFn, pageCount = 10) {
	let isLoading = false
	let pageNum = 0
	let hasMore = true
	window.addEventListener('scroll', throttling((evt) => {
		let windowHeight = document.documentElement.clientHeight
		let documentScrollTop = document.documentElement.scrollTop
		let documentScrollHeight = document.documentElement.scrollHeight;

		if (!isLoading && hasMore && windowHeight + documentScrollTop + 10 >= documentScrollHeight &&
			typeof handleFn === 'function') {
			isLoading = true
			handleFn(pageCount, pageNum + 1).then((result) => {
				if (result.status) {
					pageNum += 1
					hasMore = result.hasMore
				}
				isLoading = false
			})
		}
	}, 100))
}

var supportPageOffset = window.pageXOffset !== undefined
function getBodyScrollDistance() {
	return {
		x: supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft,
		y: supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop
	}
}

/**
 * 滚动鼠标 header 出现阴影
 */
export function addHeaderScrollListener() {
	const header = document.getElementById("ws_header")
	const goTopBtn = document.querySelector('#go_top')
	if (goTopBtn && getBodyScrollDistance().y > 100) {
		goTopBtn.classList.add('show')
	}
	addEvent(window, 'scroll', throttling(evt => {
		let scrollTop = document.body.scrollTop || document.documentElement.scrollTop
		let className = header.classList
		if (scrollTop >= 50) {
			if (!className.contains('slide_down')) {
				className.add('slide_down')
			}
		} else {
			if (className.contains('slide_down')) {
				className.remove('slide_down')
			}
		}
		if (goTopBtn) {
			if (getBodyScrollDistance().y > 100) {
				if (!goTopBtn.matches('.show')) {
					goTopBtn.classList.add('show')
				}
			} else {
				if (goTopBtn.matches('.show')) {
					goTopBtn.classList.remove('show')
				}
			}
		}
	}, 100))
}

export const userNameReg = /^[a-zA-Z0-9]{5,16}$/
export const userNameTips = '账号需为5到16个长度的字母或数字'

export const passWordReg = /^[a-zA-Z0-9-_.]{5,20}$/
export const passWordTips = '密码必须是长度为5到20个的字母、数字、-、_、.'

export const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export function validateEmail(email) {
    return emailReg.test(String(email).toLowerCase());
}

export function validatePwd (pwd) {
	// 至少一个大小写字母和数字,长度在6位以上
	return passWordReg.test(pwd);
}

export function validateUserName (pwd) {
	// 至少一个大小写字母和数字,长度在6位以上
	return userNameReg.test(pwd);
}
