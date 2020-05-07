import { fetchLeaveMsgHtml } from './api'
import { addHeaderScrollListener, bindGoTopEvent, switchUserMenu, autoCloseHeaderMenu } from './utils'
import { delegateCommentsEvent } from './utils/comment'

let comments;
/**
 * 加载留言列表
 */
fetchLeaveMsgHtml().then(res => {
	comments = res.data.comments
	commentContainer.innerHTML = res.data.html
	delegateCommentsEvent(comments, null, document.querySelector('#leave_msg_cnt'))
}).catch(err => message('留言列表加载失败，刷新试试看', 'warning'))

addHeaderScrollListener()
switchUserMenu()
autoCloseHeaderMenu()
bindGoTopEvent()
