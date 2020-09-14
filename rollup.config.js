import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import clear from 'rollup-plugin-clear'

export default {
    input:'./src/index.js',
    output:{
        file:'dist/umd/vue.js',
        name:'Vue', // 指定打包后的全局变量的名字
        format: 'umd', //统一模块规范
        sourcemap: true // es6->es5 开启源码调试， 可以找到源码保存位置
    },
    plugins:[
        babel({
            exclude:'node_modules/**', // 忽略 node_modules 文件夹下的所有文件
        }),
        process.env.ENV === 'development'? serve({
            open: true,
            openPage:'/public/index.html',
            port: 3000,
            contentBase:''
        }): null,
        clear({
            // required, point out which directories should be clear.
            targets: ['some directory'],
            // optional, whether clear the  directores when rollup recompile on --watch mode.
            watch: false, // default: false
        })
    ],
    watch:{
        exclude:'rollup.config.js'
    }
}
