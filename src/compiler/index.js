/*
* ast 语法树：用对象表示js 原生语法
* 虚拟DOM： 用对象表示DOM节点的
*
* arguments[0]: 匹配到的标签
* arguments[1]: 标签名字
* */
import {parseHTML} from "./parse-html";

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 将 [{name:'id',value:'app'},{}] ===> {id:app}
// 处理属性 拼接成属性字符串
function genProps(attrs) {
    let str = '';
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if (attr.name === 'style') { // style = 'color:red' ===> {style:{color:'red'}}
            let obj = {};
            attr.value.split(';').forEach((item) => {
                let [key, value] = item.split(':');
                obj[key] = value;
            });
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},` // value 可能时对象
    }
    return `{${str.slice(0, -1)}`
}

function gen(node) {
    if (node.type == 1) { // 元素标签
        return generate(node)
    } else {
        /*
        * a  {{  name  }} b {{age}} c
        * _v('a'+_s(name)+'b'+_s(age)+'c')
        *
        *
        * */
        let text = node.text;
        let lastIndex = defaultTagRE.lastIndex = 0; // 只要全局匹配 就需要
        let tokens = [];
        let match, index;
        while (match = defaultTagRE.exec(text)) {  // 匹配到的时{{  name  }}
            index = match.index;
            if (index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex, index)))
            }
            tokens.push(`_s(${match[1].trim()})`);
            // 下一次循环匹配的开始
            lastIndex = index + match[0].length;
        }
        // 最后省 一个c 没有办法匹配{{}}
        if(lastIndex < text.length){
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return `_v(${tokens.join('+')})`
    }

}

function genChildren(el) {
    let children = el.children;
    if (children && children.length > 0) {
        return `${children.map((c) => gen(c)).join(',')}`
    } else {
        return false
    }

}

function generate(el) {
    let children = genChildren(el);
    let code = `_c('${el.tagName}',${
        el.attrs.length ? genProps(el.attrs) : 'undefined'
    }
    ${
        children ? `${children}` : ''
    })`;
    return code;
}
/*
* obj = {
*   hobbies:{
*       balls:['basketball','football']
*   }
* }
* with(obj.hobbies){
*   balls.forEach((ball)=>{
*      console.log(ball);
*   });
* }
*
* */

export function compileToFunction(template) {
    // 1、解析HTML字符串，将html字符串转成AST语法树
    let root = parseHTML(template);
    /*核心思路就是将模板转化成 下面的这段字符串
    将ast树 转成js语法
    * <div id="app"><p>hello {{name}}</p> hello</div>
    * _c创建元素 _(tagName, atttrs, child,child...)
    * _v处理文本节点
    * _s 处理变量的
      _c('div',{id: app},_c('p',undefined,_v('hello'+_s(name))),_v('hello'))
    * */
    let code = generate(root);
    /*所有模板引擎实现 都需要new Function +  with
    *
    * */
    return new Function(`with(this){return ${code}}`);
}

/*
name 变量取得是本vue实例的属性
function (){
    with(this){
        return _c('div',{id: app},_c('p',undefined,_v('hello'+_s(name))),_v('hello'));
    }
}

*
* */

