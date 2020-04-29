import { copySiteInfo, addEvent, switchBrowserTabs, addHeaderScrollListener, bindGoTopEvent,
	switchUserMenu, autoCloseHeaderMenu } from './utils'
import { api } from './api/url'
import { fetchUserCategoryList, createCategory, delCategory, updateIndividualInfo } from './api/index'
import './utils/upload'

addEvent(document.querySelector('.cate_list'), 'click', '.remove_cate', function (event) {
	event.stopPropagation();
})

let categoryList
fetchUserCategoryList().then(res => {
	if (res.status) {
		categoryList = res.data
	}
})


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

const addCategoryIpt = document.querySelector('#add_category input')
const cateListDom = document.querySelector('.cate_list')
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
				let div = document.createElement('div')
				div.innerHTML = res.data.html
				cateListDom.insertBefore(div.children[0], addCategoryIpt.parentNode)
			} else {
				alert(res.msg)
			}
		})
	}
})

addEvent(cateListDom, 'click', '.cate_list .remove_cate', evt => {
	if (window.confirm('确认删除该分类？')) {
		let target = evt.target
		let name = target.previousElementSibling.innerHTML.trim()
		delCategory({
			name
		}).then(res => {
			if (res.status) {
				cateListDom.removeChild(target.parentNode)
			}
			alert(res.msg)
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
