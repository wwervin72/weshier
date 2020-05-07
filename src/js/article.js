import { switchBrowserTabs, addHeaderScrollListener, bindGoTopEvent, switchUserMenu,
	autoCloseHeaderMenu,
	message} from './utils/index'
import { heartArticle, fetchArticleContent, fetchArticleCommentHtml, cancelHeartArticle } from './api'
import { delegateCommentsEvent } from './utils/comment'

const catelogContainer = document.querySelector('#catelog')
switchBrowserTabs()
addHeaderScrollListener()
autoCloseHeaderMenu()
switchUserMenu()
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
			Promise.resolve().then(() => {
				if (!catelogContainer.querySelector('.markdown-toc-list li')) {
					// 没有目录 隐藏目录节点
					catelogContainer.style.display = 'none'
				}
			});
			/**
			 * 加载留言列表
			 */
			fetchArticleCommentHtml(articleId, {
				allowComment: article.allow_comment
			}).then(res => {
				comments = res.data.comments
				commentContainer.innerHTML = res.data.html
				delegateCommentsEvent(comments, articleId, commentContainer, article.allow_comment === '1')
			}).catch(err => message('留言列表加载失败，刷新试试看', 'warning'))
		}
	})
}

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
				heartArticleStatistic.innerHTML = res.data.heart_count
				heartArticleStatistic.classList.add("hide")
			}
			message(res.msg)
		})
	} else {
		heartArticle(articleId).then(res => {
			if (res.status) {
				heartArticleArea.classList.add('article_hearted')
				article.hearted = true
				heartArticleStatistic.innerHTML = res.data.heart_count
				heartArticleStatistic.classList.remove("hide")
			}
			message(res.msg)
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
