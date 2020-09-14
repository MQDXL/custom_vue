import {initState} from "./state.js";
import {compileToFunction} from "./compiler/index.js";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        // 数据劫持
        const vm = this;//vue中使用this.$options
        vm.$options = options;

        initState(vm);

        /*如果出入了el属性，要将html传入渲染
        1、 通过选择器， 获取的 template html 模板,写在el属性下
        2、给vue 传入的 template 属性
        3、render 方法
        * */
        if(vm.$options.el){
            vm.$mount(vm.$options.el)

        }
    };
    Vue.prototype.$mount = function (el) {
      const vm = this;
      const options = vm.$options;
        el = document.querySelector(el);
        // 默认使用render方法， 没有去找 template , 最后找el
        if(!options.render){
            let template = options.template;
            if(!template && el){
                /*
                * <div id = 'example'>
                    <p></p>
                * </div>
                *
                * outerHTML 是值整个 id 代表的模板
                * innerHTML 是指内部的 p标签
                *  outerHTML 有浏览器兼容问题， 解决 自己创建一个div, 将outerHTML 传入 进去
                *
                *
                * */
                template = el.outerHTML;
            }
            const render = compileToFunction(template);
            options.render = render;
        }
    }

}
