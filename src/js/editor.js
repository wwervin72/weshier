import { uploadFormData, saveArticle, updateArticle, fetchArticle } from './api'
import { addHeaderScrollListener, switchUserMenu, autoCloseHeaderMenu } from './utils'


$(function() {
	addHeaderScrollListener()
	switchUserMenu()
	autoCloseHeaderMenu()

	const abstractMax = 120
	const abstractMin = 60

	const titleDom = document.querySelector('#title_ipt')
	const pwdDom = document.querySelector('#pwd_ipt')
	const categoryDom = document.querySelector('#category')
	const thumbnailDom = document.querySelector('#thumbnail_img')

	let articleId = window.location.pathname.match(/\/a\/edit\/(\d+)$/)
	let tags = [], editor
	if (articleId) {
		articleId = articleId[1]
		fetchArticle(articleId).then(res => {
			if (res.status) {
				tags = res.data.tags
			} else {
				alert(res.msg)
			}
		})
	}

    const imageUploadFn = (files, cb, writeUrl) => {
        let data = new FormData()
		data.append('file', files[0])
		uploadFormData(data)
			.then(res => {
				cb()
				if (res.status) {
					writeUrl(res.data)
				} else {
					alert('上传失败')
				}
			}).catch(err => {
				console.log(err)
			})
			.catch(() => {
				cb()
			})
    }

    function save () {
        const markdown = editor.getMarkdown()
		const title = titleDom.value.trim()

		if (!title) return alert('请输入标题')
		if (!markdown) return alert('请输入内容')
		const password = pwdDom.value
		// 分类
		const category = categoryDom.value || null
		// 缩略图
		const thumbnailImg = thumbnailDom.getAttribute('src')

        const abstractLen = Math.floor(Math.random() * (abstractMax - abstractMin + 1) + abstractMin)
		const html = $(editor.getHTML())
		const allowCommentDom = document.querySelector('input[name=allow_comment]:checked')

		let text = ''
		html.each((i, el) => {
			el = $(el)
			text += el.text()
		})
		let abstract = text.replace(/\s/g, '').slice(0, abstractLen) + '...'
		let saveEntity = {
			title,
			allow_comment: allowCommentDom.value,
            content: markdown,
			abstract,
			password,
			thumbnail: thumbnailImg,
			category,
			tags
		}

		let p
		if (articleId) {
			saveEntity.id = articleId
			p = updateArticle(saveEntity)
		} else {
			p = saveArticle(saveEntity)
		}
        p.then(res => {
			alert(res.msg)
            if (res.status) {
                window.location.href = `/a/${res.data.id}`
            }
        }).catch(err => {
            console.log(err)
        })
	}

	function imageUploadCb (form) {
		if (form.avatar) {
			thumbnailImg = form.url
		}
	}

    editor = editormd("editor", {
        width: "100%",
		height: '100%',
		// markdown: article ? article.content : '',
        path: "/assets/lib/editor.md/",
        pluginPath: '/assets/lib/editor.md/plugins/',
        tex: false,
        toolbarIcons: () => {
            return ["undo", "redo", "|", "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", "h1", "h2", "h3", "h4", "h5", "h6", "|",
            "list-ul", "list-ol", "hr", "|", "link", "reference-link", "image", "code", "preformatted-text", "code-block", "table", "datetime", "pagebreak",
            "|", "goto-line", "watch", "preview", "fullscreen", "clear", "search", "save"]
        },
        imageUpload : true,
        imageFormats : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
		imageUploadFn,
		imageUploadCb,
        saveHTMLToTextarea: true,
        toolbarIconsClass: {
            save: "fa-save"
        },
        toolbarHandlers: {
            save: function (cm, icon, cursor, selection) {
                save()
            }
		},
        onfullscreen: function () {
            $('#editor').css({'zIndex': 99999})
        },
        onfullscreenExit: function () {
            $('#editor').css({'zIndex': 'auto'})
        }
    })

    const tagIpt = $('#tag_ipt')
    tagIpt.on('keypress', evt => {
        const val = tagIpt.val()
        // 最多十个tags
        if (evt.keyCode === 13 && val && !tags.includes(val)) {
            if (tags.length >= 10) return alert('最多十个标签')
            tags.push(val)
            tagIpt.before(`<button class="tag">${val}<span class="remove_item remove_tag">×</span></button>`)
            tagIpt.val('')
        }
    })

    $('#tag').on('click', evt => {
        const target = evt.target
        if (target.matches('.remove_tag')) {
			evt.stopPropagation()
            const parent = target.parentNode
            const val = parent.innerText.slice(0, -1)
            const idx = tags.indexOf(val)
            if (~idx) {
                tags.splice(idx, 1)
                parent.remove()
            }
            return
        }
        tagIpt.focus()
	})

	let selectTbDialog = document.querySelector('#select_tb_dialog')
	$('.select_tb').on('click', evt => {
		selectTbDialog.classList.add('show')
	})
	$('.del_tb').on('click', evt => {
		if (window.confirm('确认删除缩略图？')) {
			thumbnailDom.setAttribute('src', null)
		}
	})
	$('#select_tb_dialog .close').on('click', evt => {
		selectTbDialog.classList.remove('show')
	})
	$('#select_tb_dialog .annex').on('dblclick', evt => {
		thumbnailDom.setAttribute('src', evt.target.getAttribute('src'))
	})
})
