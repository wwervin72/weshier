import { fetchEmojiPanel, leaveMsg as leaveMsgRequest, fetchLeaveMsgHtml } from '../api'
import { switchEmojiTab, selectEmoji, findSpecifyAncesitorNode } from './index'

/**
 * 留言
 * @param {*} data
 * @param {*} textarea
 * @param {*} commentContainer comments list dom
 */
export function leaveMsg (data, textarea, commentContainer, appendComment = true) {
	return leaveMsgRequest(data).then(res => {
		alert(res.msg)
		if (res.status) {
			textarea.value = ''
			if (appendComment) {
				let div = document.createElement('div')
				div.innerHTML = res.data.html
				let lastSubComment = Array.from(commentContainer.querySelectorAll('.sub_comment')).pop()
				if (res.data.comment.reply) {
					// 回复
					commentContainer.insertBefore(
						div.children[0],
						lastSubComment ? lastSubComment.nextElementSibling : commentContainer.lastElementChild
					)
				} else {
					// 评论
					commentContainer.appendChild(div.children[0])
				}
			}
			return res.data.comment
		}
	})
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

export function delegateCommentsEvent(comments, articleId, commentsContainer) {
	// 表情包面板字符串
	let emojiPanelHtml;
	fetchEmojiPanel().then(res => {
		emojiPanelHtml = res;
	})
	document.addEventListener('keyup', evt => {
		if (evt.keyCode === 13 && evt.ctrlKey && evt.target.matches('.ws_cmt_form textarea[name=comment]')) {
			let ancestor = findSpecifyAncesitorNode(evt.target, '.ws_cmt_editor')
			let publishBtn = ancestor.querySelector('.cmt_fn_block .publish')
			if (publishBtn) {
				publishBtn.click()
			}
		}
	})
	document.body.addEventListener('click', evt => {
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
		if (target.matches('.leave_msg .cmt_fn_block .cancel')) {
			let ancestor = findSpecifyAncesitorNode(target, '.ws_cmt_editor')
			if (ancestor) {
				ancestor.querySelector('.ws_cmt_form textarea[name=comment]').value = ''
			}
			return
		}
		if (target.matches('.sub_comment .cmt_fn_block .cancel')) {
			let ancestor = findSpecifyAncesitorNode(target, '.ws_cmt_editor')
			if (ancestor) {
				let hasReply = ancestor.previousElementSibling || ancestor.previousElementSibling
				ancestor.querySelector('.ws_cmt_form textarea[name=comment]').value = ''
				ancestor.classList.remove('show')
				ancestor.classList.add('hiden')
				if (!hasReply) {
					ancestor.parentNode.classList.add('hiden')
				}
			}
			return
		}
		// 留言/评论
		if (target.matches('.leave_msg .cmt_fn_block .publish, #comment .cmt_fn_block .publish')) {
			let ancestor = findSpecifyAncesitorNode(target, '.ws_cmt_editor')
			if (ancestor) {
				let textarea = ancestor.querySelector('.ws_cmt_form textarea[name=comment]')
				let content = textarea.value.trim()
				if (!content) {
					return alert('留言不能为空')
				}
				leaveMsg({
					articleId,
					content
				}, textarea, commentsContainer).then(newComment => {
					comments.push(newComment)
					console.log(comments);
				})
			}
			return
		}
		// 回复
		if (target.matches('.sub_comment_wrap .cmt_fn_block .publish')) {
			let ancestor = findSpecifyAncesitorNode(target, '.comment')
			if (ancestor) {
				let index = Array.prototype.indexOf.call(ancestor.parentNode.querySelectorAll('.comment'), ancestor)
				let comment
				if (index !== -1) {
					comment = comments[index]
					let textarea = ancestor.querySelector('.ws_cmt_form textarea[name=comment]')
					let content = textarea.value.trim()
					let atUser = comment.atUser && comment.atUser.id
					let replyFormatLen
					if (!content) {
						return alert('留言不能为空')
					}
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
						console.log(comment);
					})
				}
			}
			return
		}
		if (target.matches('.tool_row .reply, .add_comment, .sub_comment_reply')) {
			// 回复评论
			// 添加新评论
			let commentDom = findSpecifyAncesitorNode(target, '.comment')
			let subCommentDom = target.matches('.add_comment') ? null : findSpecifyAncesitorNode(target, '.sub_comment')
			let comment, subComment
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
	})
}
