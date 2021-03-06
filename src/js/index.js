import { throttling, addEvent, switchBrowserTabs, copySiteInfo, addHeaderScrollListener,
	switchUserMenu, autoCloseHeaderMenu } from './utils'
import '../scss/index.scss'

switchBrowserTabs()
addHeaderScrollListener()
autoCloseHeaderMenu()
switchUserMenu()

let index = 0
const pages = document.querySelectorAll('.pagination > .page')
const sections = document.querySelectorAll('section')
const pageCount = pages.length

/**
 * 滑动页面
 * @param {*} direction 向上滚动还是向下滚动 > 0 向上 < 0 向下
 * @param {*} param1
 */
function scrollPage (direction = 1, { definiteIndex } = {}) {
	pages[index].classList.remove('active')
	sections[index].classList.remove('active')
	if (definiteIndex != null) {
		index = definiteIndex
	} else {
		index += direction > 0 ? -1 : 1
		if (index < 0) {
			index = pageCount - 1
		}
	}
	index %= pageCount
	pages[index].classList.add('active')
	sections[index].classList.add('active')
}

copySiteInfo()

addEvent(document.body, 'wheel', throttling(function (e) {
	scrollPage(e.wheelDeltaY)
}, 500))

addEvent(document.querySelector('.scroll_arrow'), 'click', scrollPage)

addEvent(document.querySelector('.pagination'), 'click', '.pagination .page', function (e) {
	let target = e.target
	let children = Array.from(target.parentNode.childNodes).filter(el => el.nodeName === 'LI')
	let pageNum = children.indexOf(target)
	if (pageNum === index) return
	scrollPage(null, { definiteIndex: pageNum })
})

Array.prototype.forEach.call(document.querySelectorAll('.section'), el => {
	let img = el.computedStyleMap().get('background-image').toString()
	new Wave({
		target: el,
		img
	})
})

const photoWall = document.querySelector('#photo_wall')
const wallSpaces = document.querySelectorAll('.wall-space')
function pauseGallaryAni() {
	photoWall.classList.add('ani_pause')
}
function startGallaryAni() {
	photoWall.classList.remove('ani_pause')
}
Array.prototype.forEach.call(wallSpaces, function (el) {
	addEvent(el, 'mouseenter', pauseGallaryAni)
	addEvent(el, 'mouseleave', startGallaryAni)
})
