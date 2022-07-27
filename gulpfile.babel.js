//버전이 너무 높으면 에러가 날 수 있다.
import gulp from "gulp";
//html 파일 만들기
import gpug from "gulp-pug";
//삭제시키기
import del from "del";
import ws from "gulp-webserver";
//이미지 최적화
import image from "gulp-image";
//css컴파일
import sass from "gulp-sass";
// 브라우저 호환성
import autoprefixer from "gulp-autoprefixer"
// css 파일 용량 압축.공백을 없애서 로딩 빠르게해줌
import miniCSS from "gulp-csso";
// js 컴파일
import bro from "gulp-bro";
import babelify from "babelify";

sass.compiler = require("node-sass");

// src내 pug 들을 컴파일하자
const routes = {
    pug : {
        watch: 'src/**/*.pug',
        src: "src/*.pug",
        dest: "build"
    },
    img : {
        src : "src/img/*",
        dest: "build/img"
    },
    scss:{
        watch: 'src/scss/**/*.scss',
        src: "src/scss/styles.scss",
        dest: "build/css"
    },
    js: {
        watch: 'src/js/**/*.js',
        src: "src/js/main.js",
        dest: "build/js"
    }
}
// pug task 는 index.pug 를 index.html 로 컴파일한다. dest는 파이프의 목적지 
export const pug = () => 
    gulp
        .src(routes.pug.src)
        .pipe(gpug())
        .pipe(gulp.dest(routes.pug.dest));

// build 를 삭제하는 task
export const clean = () => del(["build/"]);

const webserver = () => 
    gulp
    .src("build")
    .pipe(ws({
        livereload:true, 
        open:true
    }));


//이미지 처리도 하자. 압축시켜줌.
const img = () => 
    gulp
        .src(routes.img.src)
        .pipe(image())
        .pipe(gulp.dest(routes.img.dest));

const styles = () =>
    gulp
        .src(routes.scss.src)
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer({
            browsers: ["last 2 versions"]
        }))
        .pipe(miniCSS())
        .pipe(gulp.dest(routes.scss.dest));
        
const js = () =>
        gulp
        .src(routes.js.src)
        .pipe(bro({
            transform : [
                babelify.configure({presets: ['@babel/preset-env'] }),
                ['uglifyify', { global: true }]
            ]
        }))
        .pipe(gulp.dest(routes.js.dest));
// 지켜봐야할 파일을 정한다.
const watch = () => {
    gulp.watch(routes.pug.watch, pug);
    //이미지에 변동을 줄때마다 최적화하기
    gulp.watch(routes.img.src, img);
    gulp.watch(routes.scss.watch, styles);
    gulp.watch(routes.js.watch, js);
}

const prepare = gulp.series([clean, img]);
const assets = gulp.series([pug, styles, js]);
// series대신 parallel 을 사용하면 병렬로 동시에 수행한다. 
const postDev = gulp.parallel([webserver, watch]);

// build 를 지운후 pug 실행한다.
export const dev = gulp.series([prepare, assets, postDev]);
// export const dev = gulp.series([pug]);