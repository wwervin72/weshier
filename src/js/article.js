import { switchBrowserTabs, addHeaderScrollListener, bindGoTopEvent } from './utils/index'
import { heartArticle, fetchArticleContent, fetchArticleCommentHtml, cancelHeartArticle } from './api'
import { delegateCommentsEvent } from './utils/comment'

const catelogContainer = document.querySelector('#catelog')
switchBrowserTabs()
addHeaderScrollListener()
const commentContainer = document.querySelector('#comments')
let comments, article
let articleId = window.location.pathname.match(/\/a\/(\d+)$/)
if (articleId) {
	articleId = articleId[1]
	fetchArticleContent(articleId).then(res => {
		if (res.status) {
			article = res.data
			article.hearted = !!document.querySelector('.article_hearted')
			editormd.markdownToHTML('content', {
				markdown: res.data.content,
				htmlDecode: 'style, script, iframe',
				taskList: true,
				tex: true,
				flowChart: true,
				sequenceDiagram: true,
				tocContainer: catelogContainer,
				tocDropdown: false
			});
		} else {
			alert(res.msg)
		}
	})
}

/**
 * 加载留言列表
 */
fetchArticleCommentHtml(articleId).then(res => {
	comments = res.data.comments
	commentContainer.innerHTML = res.data.html
	delegateCommentsEvent(comments, articleId, commentContainer)
}).catch(err => alert('留言列表加载失败，刷新试试看'))

const heartArticleArea = document.querySelector('.heart_article')
const heartArticleBtn = document.querySelector('#heart_btn')
const heartArticleStatistic = heartArticleBtn.nextElementSibling
heartArticleBtn.onclick = function (evt) {
	if (!articleId) return
	if (article.hearted) {
		// 已喜欢 再点取消喜欢
		cancelHeartArticle(articleId).then(res => {
			if (res.status) {
				heartArticleArea.classList.remove('article_hearted')
				delete article.hearted
				article.heartCount -= 1
				heartArticleStatistic.innerHTML = article.heartCount
			}
			alert(res.msg)
		})
	} else {
		heartArticle(articleId).then(res => {
			if (res.status) {
				heartArticleArea.classList.add('article_hearted')
				article.hearted = true
				article.heartCount += 1
				heartArticleStatistic.innerHTML = article.heartCount
			}
			alert(res.msg)
		})
	}
}
document.querySelector('.ws_iconfont.ws_s_6').addEventListener('click', evt => {
	if (catelogContainer.classList.contains('hide')) {
		catelogContainer.classList.remove('hide')
	} else {
		catelogContainer.classList.add('hide')
	}
})

bindGoTopEvent()
