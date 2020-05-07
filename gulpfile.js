// vinyl 是一个简单的描述文件的元数据对象
// https://github.com/gulpjs/vinyl
const path = require("path");
const gulp = require("gulp");
const del = require("del");
const glob = require("glob");
const babelify = require("babelify");
const runSequence = require("run-sequence");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const gulpif = require("gulp-if");
const sass = require("gulp-sass");
const debug = require("gulp-debug");
const cached = require("gulp-cached");
const remember = require("gulp-remember");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const size = require("gulp-size");
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const rev = require("gulp-rev");
const watchify = require("watchify");
const lazypipe = require("lazypipe");
const revCollector = require("gulp-rev-collector");
const es = require("event-stream");
const argv = require("yargs").argv;

// 将打包后的静态资源 放到nginx服务器上
const bundleAssetsDir =
	argv.build_mode === "deploy" && argv.assets_path
		? argv.assets_path
		: "./public/static/";
const jsAssetsDir = path.join(bundleAssetsDir, "js");
const cssAssetsDir = path.join(bundleAssetsDir, "css");
const imgAssetsDir = path.join(bundleAssetsDir, "image");
const revAssetsDir = path.join(bundleAssetsDir, "rev");
const htmlAssetsDir = path.join("./app/view");

const AUTOPREFIXER_BROWSERS = [
	"ie >= 10",
	"ff >= 30",
	"chrome >= 34",
	"safari >= 7",
	"opera >= 23",
];

const jsChannel = lazypipe().pipe(uglify).pipe(gulp.dest, jsAssetsDir);

let watch = false;

function getEntryFiles(path, option) {
	return glob.sync(path, option);
}

/**
 * 打包js任务
 * @param {Object} bundle 各入口文件的browserify对象
 * @param {string} filename 入口文件名
 * @return {stream} stream 对象
 */
function jsTask({ bundle, filename }) {
	return (
		bundle
			.bundle()
			.pipe(
				plumber({
					errorHandler: notify.onError("Error: <%= error.message %>"),
				})
			)
			.pipe(source(filename))
			// 代替 gulp-streamify，来转换 vinyl 流
			.pipe(buffer())
			.pipe(rename({ dirname: "" }))
			.pipe(sourcemaps.init())
			.pipe(debug({ title: "script" }))
			.pipe(size({ title: "script" }))
			.pipe(sourcemaps.write(""))
			.pipe(gulp.dest(jsAssetsDir))
	);
}

/**
 * 如果一个文件被删除了，则将其忘记
 * @param {*} event
 */
function watchDel(event) {
	if (event.type === "deleted") {
		// gulp-cached 的删除 api
		delete cached.caches.scripts[event.path];
		// gulp-remember 的删除 api
		remember.forget("scripts", event.path);
	}
}

gulp.task("style", () => {
	return (
		gulp
			.src("./src/scss/*.scss")
			.pipe(
				plumber({
					errorHandler: notify.onError("Error: <%= error.message %>"),
				})
			)
			// .pipe(cached('style-task'))
			.pipe(sourcemaps.init())
			.pipe(sass())
			.pipe(
				cssnano({
					// 不修改 z-index
					safe: true,
				})
			)
			.pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
			.pipe(debug({ title: "style" }))
			// .pipe(remember('style-task'))
			.pipe(size({ title: "style" }))
			.pipe(sourcemaps.write(""))
			.pipe(gulp.dest(cssAssetsDir))
	);
});

gulp.task("script", () => {
	let entryJs = getEntryFiles("./src/js/*.js");
	let bundleTasks = entryJs.map((filename) => {
		const bundle = browserify({
			entries: [filename],
			cache: {},
			packageCache: {},
			plugin: [watch ? watchify : null],
			transform: babelify,
		});
		if (watch) {
			bundle.on("update", function () {
				jsTask.call(null, { bundle, filename });
			});
		}
		return { bundle, filename };
	});
	return es.merge(bundleTasks.map(jsTask));
});

gulp.task("image", () => {
	return gulp
		.src(["./src/image/*", "./src/image/**/*"])
		.pipe(
			plumber({
				errorHandler: notify.onError("Error: <%= error.message %>")
			})
		)
		.pipe(cached("image-task"))
		// .pipe(
		// 	imagemin([
		// 		imagemin.gifsicle({ interlaced: true }),
		// 		imagemin.jpegtran({ progressive: true }),
		// 		imagemin.optipng({ optimizationLevel: 5 }),
		// 		imagemin.svgo({
		// 			plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
		// 		}),
		// 	])
		// )
		.pipe(debug({ title: "image" }))
		.pipe(remember("image-task"))
		.pipe(size({ title: "image" }))
		.pipe(gulp.dest(imgAssetsDir));
});

gulp.task("html", () => {
	return gulp
		.src("./src/page/**/*.html")
		.pipe(
			plumber({
				errorHandler: notify.onError("Error: <%= error.message %>"),
			})
		)
		.pipe(cached("html-task"))
		.pipe(debug({ title: "html" }))
		.pipe(remember("html-task"))
		.pipe(gulp.dest(htmlAssetsDir));
});

gulp.task("rev", () => {
	return gulp
		.src([path.join(jsAssetsDir, "*.js"), path.join(cssAssetsDir, "*.css")])
		.pipe(rev())
		.pipe(gulpif("*.js", jsChannel()))
		.pipe(gulpif("*.css", gulp.dest(cssAssetsDir)))
		.pipe(
			rev.manifest({
				merge: true,
			})
		)
		.pipe(gulp.dest(revAssetsDir));
});

gulp.task("rev-collector", () => {
	return gulp
		.src([
			path.join(revAssetsDir, "*.json"),
			path.join(htmlAssetsDir, "*.html"),
		])
		.pipe(
			revCollector({
				replaceReved: true,
			})
		)
		.pipe(
			htmlmin({
				removeComments: true,
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				removeAttributeQuotes: true,
				removeRedundantAttributes: true,
				removeEmptyAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				removeOptionalTags: true,
			})
		)
		.pipe(size({ title: "html" }))
		.pipe(gulp.dest(htmlAssetsDir));
});

gulp.task("clean", () =>
	del([bundleAssetsDir, htmlAssetsDir], { force: true })
);

gulp.task("style:watch", () => {
	const watcher = gulp.watch(["./src/scss/**/*.scss"], ["style"]);
	watcher.on("change", watchDel);
});

gulp.task("image:watch", () => {
	const watcher = gulp.watch(["./src/image/**/*"], ["image"]);
	watcher.on("change", watchDel);
});
gulp.task("html:watch", () => {
	const watcher = gulp.watch(["./src/page/**/*.html"], ["html"]);
	watcher.on("change", watchDel);
});

gulp.task("watch", () => {
	watch = true;
	runSequence(
		"clean",
		["script", "style", "html", "image"],
		["style:watch", "html:watch", "image:watch"]
	);
});

gulp.task("build", (cb) => {
	watch = false;
	return runSequence(
		"clean",
		["script", "style", "html", "image"],
		"rev",
		"rev-collector",
		cb
	);
});

gulp.task("default", ["build"]);
