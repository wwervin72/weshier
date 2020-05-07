import { copySiteInfo, addEvent, switchBrowserTabs, addHeaderScrollListener, bindGoTopEvent,
	switchUserMenu, autoCloseHeaderMenu } from './utils'
import { api } from './api/url'
import { createCategory, delCategory, updateIndividualInfo, createTag, delTag } from './api/index'
import './utils/upload'

$('#upload_annex').uploadfile({
	url : api + 'uploadAnnex',
	width : '100%',
	height : 'auto',
	success: function (fileName) {
		alert(fileName + '上传成功');
	},
	error: function (fileName) {
		alert(fileName + '上传失败');
	},
	complete : function () {
		alert('所有文件上传完毕');
	}
});

addEvent(document.querySelector('input[name=avatar]'), 'change', function (event) {
	var formData = new FormData();
	formData.append('file', event.target.files[0]);
	$.ajax({
		url: api + 'alterAvatar',
		type: 'POST',
		cache: false,
		data: formData,
		processData: false,
		contentType: false
	}).then(res => {
		if (res.status) {
			Array.prototype.forEach.call(document.querySelectorAll('img.avatar'), el => {
				el.setAttribute('src', res.data)
			})
		} else {
			alert(res.msg || '头像更新失败')
		}
	})
})

// 分类相关
const addCategoryIpt = document.querySelector('#add_category input')
const cateListDom = document.querySelector('.cate_list')
// 添加分类
addEvent(addCategoryIpt, 'keyup', evt => {
	if (evt.keyCode === 13) {
		let categoryName = addCategoryIpt.value
		if (!categoryName) return
		if (categoryList.some(el => el.name === categoryName)) {
			alert('该分类名已存在，请重新输入')
			return
		}
		createCategory({
			name: categoryName
		}).then(res => {
			if (res.status) {
				addCategoryIpt.value = ''
				categoryList.push(res.data.category)
				addCategoryIpt.parentNode.insertAdjacentHTML('beforebegin', res.data.html)
			} else {
				alert(res.msg)
			}
		})
	}
})
// 删除分类
addEvent(cateListDom, 'click', '.cate_list .remove_item', evt => {
	if (window.confirm('确认删除该分类？')) {
		let target = evt.target
		let id = target.dataset.id
		delCategory({
			id
		}).then(res => {
			if (res.status) {
				cateListDom.removeChild(target.parentNode)
			}
		})
	}
})

// tag 相关
const addTagIpt = document.querySelector('#add_tag input')
const tagListDom = document.querySelector('.tag_list')
// 添加标签
addEvent(addTagIpt, 'keyup', evt => {
	if (evt.keyCode === 13) {
		let tagName = addTagIpt.value
		if (!tagName) return
		if (tags.some(el => el.name === tagName)) {
			alert('该标签名已存在，请重新输入')
			return
		}
		createTag({
			name: tagName
		}).then(res => {
			if (res.status) {
				addTagIpt.value = ''
				tags.push(res.data.tag)
				addTagIpt.parentNode.insertAdjacentHTML('beforebegin', res.data.html)
			}
		})
	}
})
// 删除标签
addEvent(tagListDom, 'click', '.tag_list .remove_item', evt => {
	if (window.confirm('确认删除该标签')) {
		let target = evt.target
		let id = target.dataset.id
		delTag({
			id,
		}).then(res => {
			if (res.status) {
				tagListDom.removeChild(target.parentNode)
			}
		})
	}
})

const siteIpt = document.querySelector('input[name=site]')
const bioIpt = document.querySelector('textarea[name=bio]')
const weiBoIpt = document.querySelector('input[name=weibo]')
const githubIpt = document.querySelector('input[name=github]')
addEvent(document.querySelector('#individual_info'), 'click', evt => {
	let url = siteIpt.value.trim() || null
	let bio = bioIpt.value.trim() || null
	let weibo = weiBoIpt.value.trim() || null
	let github = githubIpt.value.trim() || null
	updateIndividualInfo({ url, bio, weibo, github }).then(res => {
		alert(res.msg)
	})
})

addHeaderScrollListener()
switchUserMenu()
autoCloseHeaderMenu()
copySiteInfo()
switchBrowserTabs()
bindGoTopEvent()
