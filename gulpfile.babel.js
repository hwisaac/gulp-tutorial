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
// 깃허브
import ghPages from "gulp-gh-pages";


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

// build와 .publish 폴더를 를 삭제하는 task
export const clean = () => del(["build/", ".publish"]);

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

const gh = () =>
        gulp
        .src("build/**/*")
        .pipe(ghPages());


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
const live = gulp.parallel([webserver, watch]);


//scripts
// yarn build는 prepare과 assets 를 불러온다
export const build = gulp.series([prepare, assets]);

// dev는 build를 하고 live로 이들을 라이브 서버에 보여줌
export const dev = gulp.series([build, live]);

// yarn deploy 는 assets을 build하고 배포한 후 clean으로 .publish폴더를 삭제한다.
export const deploy = gulp.series([build, gh, clean]);