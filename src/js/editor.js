import { uploadFormData, saveArticle, updateArticle, fetchArticle } from './api'
import { addHeaderScrollListener, switchUserMenu, autoCloseHeaderMenu, message } from './utils'


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

	const editorDom = document.querySelector('#editor')
	const articleOption = document.querySelector('.article_options')
	let editorIsFull = false

	let tags = articleTags.slice(), editor
    const imageUploadFn = (files, cb, writeUrl) => {
        let data = new FormData()
		data.append('file', files[0])
		uploadFormData(data)
			.then(res => {
				cb()
				if (res.status) {
					writeUrl(res.data)
				} else {
					message('上传失败', 'error')
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

		if (!title) return message('请输入标题')
		if (!markdown) return message('请输入内容')
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
            if (res.status) {
                window.location.href = `/a/${res.data.id}`
            }
        }).catch(err => {})
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
            "|", "goto-line", "watch", "preview", "fullscreen", "clear", "search", "save", "switcher"]
        },
        imageUpload : true,
        imageFormats : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
		imageUploadFn,
		imageUploadCb,
        saveHTMLToTextarea: true,
        toolbarIconsClass: {
			save: "fa-save",
			switcher: "fa-switcher"
        },
        toolbarHandlers: {
            save: function (cm, icon, cursor, selection) {
                save()
            },
            switcher: function (cm, icon, cursor, selection) {
				editorIsFull = !editorIsFull
				if (editorIsFull) {
					editorDom.classList.add('full_screen')
					articleOption.classList.add('hide')
				} else {
					editorDom.classList.remove('full_screen')
					articleOption.classList.remove('hide')
				}
            }
		},
        onfullscreen: function () {
            $('#editor').css({'zIndex': 99999})
        },
        onfullscreenExit: function () {
            $('#editor').css({'zIndex': 'auto'})
		},
		onload () {
			console.log(123);

			document.querySelector('.fa-switcher').parentNode.style.cssText += 'vertical-align:top;';
		}
	})

	const tagActive = 'selected'
    $('#tag').on('click', evt => {
		evt.stopPropagation()
        const target = evt.target
		const t = target.dataset.tag - 0
		const idx = tags.indexOf(t)
        if (target.matches('.tag')) {
			if (idx !== -1) {
				if (!target.classList.contains(tagActive)) {
					target.classList.add(tagActive)
				}
			} else {
				tags.push(t)
				target.classList.add(tagActive)
			}
        } else if (target.matches('.remove_tag')) {
			let parent = target.parentNode
            if (idx !== -1) {
                tags.splice(idx, 1)
				parent.classList.remove(tagActive)
            } else if (parent.classList.contains(tagActive)) {
				parent.classList.remove(tagActive)
			}
        }
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
