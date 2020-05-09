import { fetchEmojiPanel, leaveMsg as leaveMsgRequest, delMsg } from '../api'
import { switchEmojiTab, selectEmoji, findSpecifyAncesitorNode, addEvent } from './index'
import {message} from './index'

/**
 * 留言
 * @param {*} data
 * @param {*} textarea
 * @param {*} commentContainer comments list dom
 */
export function leaveMsg (data, textarea, commentContainer, appendComment = true) {
	return leaveMsgRequest(data)
	.then(res => {
		if (res.status) {
			textarea.value = ''
			if (appendComment) {
				if (res.data.comment.reply) {
					// 回复
					let lastSubComment = commentContainer.querySelectorAll('.sub_comment')
					lastSubComment = lastSubComment[lastSubComment.length - 1]
					if (lastSubComment) {
						lastSubComment.insertAdjacentHTML('afterend', res.data.html)
					} else {
						commentContainer.querySelector('.sub_comment_wrap .ws_cmt_editor')
							.insertAdjacentHTML('beforebegin', res.data.html)
					}
				} else {
					// 评论
					commentContainer.insertAdjacentHTML('beforeend', res.data.html)
				}
			}
			return res.data.comment
		}
	}).catch(e => {})
}

/**
 * 重置编辑框值
 * @param {*} textarea DOM 文本域对象
 * @param {*} replyUser Object 要回复的某个人
 */
export function resetEditorVal(textarea, replyUser) {
	let val = textarea.value
	if (replyUser && !new RegExp(`^@${replyUser.nickName}`).test(val)) {
		textarea.value = `@${replyUser.nickName} `
	}
	if (!replyUser && new RegExp(`^@`).test(val)) {
		textarea.value = ''
	}
	textarea.focus()
}

/**
 * 显示评论编辑器
 * @param {*} dom
 * @param {*} hasReply 留言文本框隐藏后，控制他的父节点是否也隐藏，如果有子评论，则不隐藏，否则隐藏
 * @param {*} replyUser 回复的时候 @ 某个人
 */
export function showCommentEditor(dom, hasReply, replyUser) {
	dom.classList.add('show')
	let textarea = dom.querySelector('textarea[name=comment]')
	resetEditorVal(textarea, replyUser)
	if (!hasReply) {
		dom.parentNode.classList.remove('hiden')
	}
}

/**
 * 切换评论编辑器
 * @param {*} target DOM 触发事件的对象
 * @param {*} isOneTrigger  比较上一次和这一次触发的对象 是否是同一个
 * @param {*} replyUser Object @ 的某个人
 */
export function switchCmtEditor(target, isOneTrigger, replyUser) {
	let ancestor = findSpecifyAncesitorNode(target, '.comment')
	if (ancestor) {
		let comment = ancestor.querySelector('.ws_cmt_editor')
		let subComment = comment.parentNode
		let hasReply = comment.previousElementSibling || comment.previousElementSibling
		if (comment.matches('.hide')) {
			comment.classList.remove('hide')
			showCommentEditor(comment, hasReply, replyUser)
		} else if (comment.matches('.hiden')) {
			comment.classList.remove('hiden')
			showCommentEditor(comment, hasReply, replyUser)
		} else if (comment.matches('.show')) {
			if (isOneTrigger) {
				// 如果是同一个对象触发的编辑器显示隐藏
				comment.classList.remove('show')
				comment.classList.add('hiden')
				if (!hasReply) {
					subComment.classList.add('hiden')
				}
			} else {
				// 不是同一个则修改内容
				resetEditorVal(comment.querySelector('textarea[name=comment]'), replyUser)
			}
		}
	}
}

/**
 * 代理留言事件处理函数
 * @param {*} comments 留言/评论列表
 * @param {*} articleId 文章 id，如果为空，则认为是留言
 * @param {*} commentsContainer 留言或者评论 dom 的父容器
 * @param {*} allowComment 根据文章判断是否允许评论
 */
export function delegateCommentsEvent(comments, articleId, commentsContainer, allowComment = true) {
	// 表情包面板字符串
	let emojiPanelHtml;
	let comment
	// 获取 emoji 面板的 html 代码
	fetchEmojiPanel().then(res => {
		emojiPanelHtml = res;
	}).catch(e => {})
	// 绑定评论输入域的 ctrl + enter 事件
	addEvent(document, 'keyup', evt => {
		if (evt.keyCode === 13 && evt.ctrlKey && evt.target.matches('.ws_cmt_form textarea[name=comment]')) {
			let ancestor = findSpecifyAncesitorNode(evt.target, '.ws_cmt_editor')
			let publishBtn = ancestor.querySelector('.cmt_fn_block .publish')
			if (publishBtn) {
				publishBtn.click()
			}
		}
	})
	addEvent(document.body, 'click', evt => {
		let target = evt.target
		// 切换表情包面板
		if (target.matches('.emoji_tab > li')) {
			switchEmojiTab(evt)
			return
		}
		// 点击表情 写入文本框
		if (target.matches('.emoji .emoji_icon')) {
			selectEmoji(target)
			return
		}
		// 打开 emoji 面板
		if (target.matches('.emoji_switch')) {
			let emojiWrap = target.parentNode
			let emojiPanel = target.nextElementSibling
			if (!emojiPanel) {
				emojiWrap.innerHTML = target.outerHTML + emojiPanelHtml
			} else {
				if (emojiPanel.classList.contains('show')) {
					emojiPanel.classList.remove('show')
					emojiPanel.classList.add('hide')
				} else {
					emojiPanel.classList.remove('hide')
					emojiPanel.classList.add('show')
				}
			}
			return
		}
		// 自动关闭 emoji 面板
		if (target === document.body ||
			(!target.matches('.ws_emoji_tabs') && !findSpecifyAncesitorNode(target, '.ws_emoji_tabs'))) {
			let emojiTabs = document.querySelectorAll('.ws_emoji_tabs.show')
			Array.prototype.forEach.call(emojiTabs, function (tab) {
				tab.classList.remove('show')
				tab.classList.add('hide')
			})
		}
		// 评论输入域下的取消按钮
		if (target.matches('.cmt_fn_block .cancel')) {
			let ancestor = findSpecifyAncesitorNode(target, '.ws_cmt_editor')
			if (ancestor) {
				ancestor.querySelector('.ws_cmt_form textarea[name=comment]').value = ''
				if (ancestor.matches('.reply_editor')) {
					// 处理回复输入域下的取消按钮，需要收回输入域
					let hasReply = ancestor.previousElementSibling || ancestor.previousElementSibling
					ancestor.classList.remove('show')
					ancestor.classList.add('hiden')
					if (!hasReply) {
						ancestor.parentNode.classList.add('hiden')
					}
				}
			}
			return
		}
		// 回复评论
		if (target.matches('.sub_comment_wrap .cmt_fn_block .publish')) {
			if (!allowComment) return
			let ancestor = findSpecifyAncesitorNode(target, '.comment')
			if (ancestor) {
				let index = Array.prototype.indexOf.call(ancestor.parentNode.querySelectorAll('.comment'), ancestor)
				if (index !== -1) {
					comment = comments[index]
					let textarea = ancestor.querySelector('.ws_cmt_form textarea[name=comment]')
					let content = textarea.value.trim()
					if (!content) {
						return message('留言不能为空', 'info')
					}
					let atUser = comment.atUser && comment.atUser.id
					let replyFormatLen
					leaveMsg({
						articleId,
						content: replyFormatLen == null ? content : content.slice(replyFormatLen - 1).trim(),
						comment: comment.id,
						atUser
					}, textarea, ancestor.querySelector('.sub_comment_wrap')).then(newReply => {
						if (!comment.replies) {
							comment.replies = []
						}
						comment.replies.push(newReply)
						delete comment.atUser
					}).catch(e => {})
				}
			}
			return
		} else if (target.matches('.cmt_fn_block .publish, #comment .cmt_fn_block .publish')) {
			// 留言/评论
			if (!allowComment) return
			let ancestor = findSpecifyAncesitorNode(target, '.ws_cmt_editor')
			if (ancestor) {
				let textarea = ancestor.querySelector('.ws_cmt_form textarea[name=comment]')
				let content = textarea.value.trim()
				if (!content) {
					return message('留言内容不能为空')
				}
				leaveMsg({
					articleId,
					content
				}, textarea, commentsContainer).then(newComment => {
					comments.push(newComment)
				}).catch(e => {})
			}
			return
		}
		// 添加新评论
		if (target.matches('.tool_row .reply, .add_comment, .sub_comment_reply')) {
			if (!allowComment) return
			let commentDom = findSpecifyAncesitorNode(target, '.comment')
			let subCommentDom = target.matches('.add_comment') ? null : findSpecifyAncesitorNode(target, '.sub_comment')
			let subComment
			if (commentDom) {
				let commentDoms = commentDom.parentNode.querySelectorAll('.comment')
				let index = Array.prototype.indexOf.call(commentDoms, commentDom)
				if (index != -1) {
					comment = comments[index]
				}
			}
			if (!comment) return
			if (subCommentDom) {
				let subCommentDoms = subCommentDom.parentNode.querySelectorAll('.sub_comment')
				let index = Array.prototype.indexOf.call(subCommentDoms, subCommentDom)
				if (index != -1) {
					subComment = comment.replies[index]
					comment.atUser = subComment.author
				}
			} else {
				delete comment.atUser
			}
			switchCmtEditor(target, comment.target === target, comment.atUser)
			comment.target = target
			return
		}
		if (target.matches('.tool_row .heart')) {
			// 点赞
			return
		}
		if (target.matches('.expand_comments > a')) {
			// 展开所有回复
			let subCmtWrapper = findSpecifyAncesitorNode(target, '.sub_comment_wrap')
			subCmtWrapper.classList.remove('hide_exceed_cmt')
			return
		}
		if (target.matches('.del_cmt')) {
			let id = target.dataset.id
			if (id && confirm('确认删除该评论?')) {
				delMsg(id)
				.then(res => {
					let dom = findSpecifyAncesitorNode(target, '.sub_comment, .comment')
					// 删除 dom
					if (dom) {
						dom.parentNode.removeChild(dom)
					}
					// 删除数据
					let commentData
					let len = comments.length
					if (res.data.reply) {
						// 是回复信息
						for (let i = 0; i < len; i++) {
							if (comments[i].id === res.data.reply) {
								commentData = comments[i]
								let length = commentData.replies ? commentData.replies.length : 0
								for (let j = 0; j < length; j++) {
									if (commentData.replies[j].id === res.data.id) {
										// 删除评论下的指定回复
										commentData.replies.splice(j, 1)
										break
									}
								}
								break
							}
						}
					} else {
						// 评论
						for (let i = 0; i < len; i++) {
							if (comments[i].id === res.data.id) {
								comments.splice(i, 1)
								break
							}
						}
					}
				})
				console.log(comments);

				return
			}
		}
	})
}
