import { throttling } from './index'

const header = document.getElementById("ws_header")
window.addEventListener('scroll', throttling(evt => {
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
}, 50))
