import {
	copySiteInfo,
	switchBrowserTabs,
	bindGoTopEvent,
	addHeaderScrollListener,
	scrollLoadMore,
	switchUserMenu,
	autoCloseHeaderMenu,
	initFireWorks,
} from "./utils";
import { fetchArticleListHtmlPagination } from "./api/index";

import "../scss/blog.scss";
(function () {
	const articleContainer = document.querySelector("#article_list");
	function loadMoreArticles(pageCount, pageNum) {
		return fetchArticleListHtmlPagination({
			pageCount,
			pageNum,
		})
			.then((res) => {
				if (res.status) {
					let div = document.createElement("div");
					div.innerHTML = res.data.html;
					articleContainer.append(...div.children);
				}
				return res;
			})
			.catch((e) => {});
	}
	addHeaderScrollListener();
	switchUserMenu();
	autoCloseHeaderMenu();
	scrollLoadMore(loadMoreArticles);
	initFireWorks();
	// clock
	var dom = document.querySelector("#clock");
	var plate = document.querySelector("#plate");
	var needles = document.querySelector("#needles");

	var cntP = plate.getContext("2d");
	var cntH = needles.getContext("2d");
	var width = dom.getBoundingClientRect().width;

	//clock构造函数
	function drawclock(cnt, radius, platelen, linewidth, numLen, NUMLEN) {
		this.cnt = cnt;
		this.radius = radius;
		this.platelen = platelen;
		this.linewidth = linewidth;
		this.numLen = numLen;
		this.NUMLEN = NUMLEN;
		this.getCalibCoor = function (i) {
			//获得表盘刻度两端的坐标
			var X = width / 2 + this.radius * Math.sin((6 * i * Math.PI) / 180);
			var Y = width / 2 - this.radius * Math.cos((6 * i * Math.PI) / 180);
			var x =
				width / 2 +
				(this.radius - this.platelen) *
					Math.sin((6 * i * Math.PI) / 180);
			var y =
				width / 2 -
				(this.radius - this.platelen) *
					Math.cos((6 * i * Math.PI) / 180);

			// 获得分针刻度的坐标
			var numx =
				width / 2 +
				(this.radius - this.platelen - this.numLen) *
					Math.sin((6 * i * Math.PI) / 180);
			var numy =
				width / 2 -
				(this.radius - this.platelen - this.numLen) *
					Math.cos((6 * i * Math.PI) / 180);
			//获得小时数字刻度的坐标
			var numX =
				width / 2 +
				(this.radius - this.platelen - this.NUMLEN) *
					Math.sin((6 * i * Math.PI) / 180);
			var numY =
				width / 2 -
				(this.radius - this.platelen - this.NUMLEN) *
					Math.cos((6 * i * Math.PI) / 180);
			return {
				X: X,
				Y: Y,
				x: x,
				y: y,
				numx: numx,
				numy: numy,
				numX: numX,
				numY: numY,
			};
		};
		this.drawCalibration = function () {
			//画刻度
			for (var i = 0, coorObj; i < 60; i++) {
				coorObj = this.getCalibCoor(i);
				this.cnt.beginPath();
				this.cnt.moveTo(coorObj.X, coorObj.Y);
				this.cnt.lineTo(coorObj.x, coorObj.y);
				this.cnt.closePath();

				this.cnt.lineWidth = this.linewidth;
				this.cnt.strokeStyle = "rgba(6, 128, 67, .2)";
				i % 5 == 0 &&
					(this.cnt.strokeStyle = "rgba(6, 128, 67, .3)") &&
					(this.cnt.lineWidth = this.linewidth * 2);
				i % 15 == 0 &&
					(this.cnt.strokeStyle = "rgba(6, 128, 67, .4)") &&
					(this.cnt.lineWidth = this.linewidth * 3);
				this.cnt.stroke();

				if (width < 320) {
					this.cnt.font = "0px Arial";
				} else {
					this.cnt.font = "10px Arial";
				}
				this.cnt.fillStyle = "rgba(6,128,67,.2)";
				this.cnt.fillText(i, coorObj.numx - 7, coorObj.numy + 3);
				i % 5 == 0 &&
					(this.cnt.fillStyle = "rgba(6,128,67,.5)") &&
					(this.cnt.font = "18px Arial") &&
					this.cnt.fillText(
						i / 5,
						coorObj.numX - 5,
						coorObj.numY + 5
					);
			}
		};
	}

	function clockNeedle(cnt, R, lineWidth, strokeStyle, lineCap, obj) {
		this.R = R;
		this.cnt = cnt;
		this.lineWidth = lineWidth;
		this.strokeStyle = strokeStyle;
		this.lineCap = lineCap;
		this.obj = obj;
		this.getNeedleCoor = function (i) {
			var X = width / 2 + this.R * 0.8 * Math.sin(i); //起点的坐标
			var Y = width / 2 - this.R * 0.8 * Math.cos(i);

			var x = width / 2 - width * 0.05 * Math.sin(i); //终点的坐标
			var y = width / 2 + width * 0.05 * Math.cos(i);
			return { X: X, Y: Y, x: x, y: y };
		};
		this.drawNeedle = function () {
			var d = new Date().getTime();
			var angle;
			switch (this.obj) {
				case 0:
					angle =
						(((((d / 3600000) % 24) + 8) / 12) * 360 * Math.PI) /
						180;
					break;
				case 1:
					angle = ((((d / 60000) % 60) / 60) * 360 * Math.PI) / 180;
					break;
				case 2:
					angle = ((((d / 1000) % 60) / 60) * 360 * Math.PI) / 180;
					break;
			}
			var coorobj = this.getNeedleCoor(angle);
			this.cnt.beginPath();
			this.cnt.moveTo(coorobj.x, coorobj.y);
			this.cnt.lineTo(coorobj.X, coorobj.Y);

			this.cnt.lineWidth = this.lineWidth;
			this.cnt.strokeStyle = this.strokeStyle;
			this.cnt.lineCap = this.lineCap;
			this.cnt.stroke();
		};
	}

	function init() {
		cntP.clearRect(0, 0, width, width);
		width = dom.getBoundingClientRect().width;

		plate.setAttribute("width", width);
		plate.setAttribute("height", width);
		needles.setAttribute("width", width);
		needles.setAttribute("height", width);

		// 实例化一个表盘对象
		var clock = new drawclock(cntP, width / 2, 5, 1, 10, 25);
		cntP.arc(width / 2, width / 2, 5, 0, 2 * Math.PI);
		cntP.fillStyle = "rgba(6, 128, 67, .3)";
		cntP.fill();
		clock.drawCalibration();
	}

	function draw() {
		cntH.clearRect(0, 0, width / 0.2, width / 0.2);
		var mzneedleSize = width / 2 - 10 > 50 ? width / 2 - 10 : 50;
		var fzneedleSize = mzneedleSize * 0.7;
		var szneedleSize = fzneedleSize * 0.6;
		var mzneedle = new clockNeedle(
			cntH,
			mzneedleSize,
			1,
			"rgba(6,128,67,.3)",
			"round",
			2
		);
		//最后一个参数0代表画时针，1画分针，2画秒针
		var fzneedle = new clockNeedle(
			cntH,
			fzneedleSize,
			2,
			"rgba(6,128,67,.4)",
			"round",
			1
		);
		var szneedle = new clockNeedle(
			cntH,
			szneedleSize,
			3,
			"rgba(6,128,67,.5)",
			"round",
			0
		);
		mzneedle.drawNeedle();
		fzneedle.drawNeedle();
		szneedle.drawNeedle();
	}

	$(window).resize(init);

	init();
	draw();
	setInterval(draw, 1);

	copySiteInfo();
	switchBrowserTabs();
	bindGoTopEvent();
})();
