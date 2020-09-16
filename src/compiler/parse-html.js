// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`; // abc-aaa
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // <aaa:b> 匹配命名空间标签
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则，捕获的是标签名
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // </
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

let root = null; // ast语法树
let currentParent;
let stack = [];
const ELEMENT_TYPE  = 1;
const TEXT_TYPE = 3;
function createASTElement(tagName,attrs) {
    return{
        tag:tagName,
        type: ELEMENT_TYPE,
        children:[],
        attrs,
        parent:null
    }

}

// 遇到开始标签 就创建一个ast元素
function start(tagName,attrs) {
    let element = createASTElement(tagName, attrs);
    if(!root){
        root = element;
    }
    currentParent = element; //将当前元素标记成父AST树
    stack.push(element); // 将开始标签放入栈中，为以后判断 标签书写是否合规
}
// 文本标签
function chars(text) {

    text = text.replace(/\s/g,'');
    if(text){
        currentParent.children.push({
            text,
            type:TEXT_TYPE
        })
    }
}
/*
* 以例：
* <div><p></p></div>
* 遇到</p> 时， stack = [div,p]
* */
function end(tagName) {
    let element = stack.pop();
    currentParent = stack[stack.length - 1];
    if(currentParent){
        element.parent = currentParent;
        currentParent.children.push(element); // 实现了一个树的父子关系
    }

}



export function parseHTML(html) {
    // 不停的去解析html字符串， 匹配成功就删除相应的字符传
    while (html) {
        let textEnd = html.index('<')
        // 如果当前索引为0，肯定是一个标签  开始标签、结束标签
        if (textEnd === 0) {
            let startTagMatch = parseStartTag(); //通过这个方法获取匹配的结果 tagName,attrs
            if(startTagMatch){
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;// 如果开始标签匹配完了，就开始下一次匹配
            }
            let endTagMatch = html.match(endTag);
            if(endTagMatch){
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }
        }
        /*
        * 处理 纯文本
        * <div> hello
            <p></p>
        * */
        let text;
        if(textEnd >=0){
            text = html.substring(0,textEnd);
        }
        if(text){
            advance(text.length);
            chars(text);
        }
    }

    function advance(n) {
        html = html.substring(n)
    }
    function parseStartTag() {
        let start = html.match(startTagOpen);
        // start = ['<div', 'div']
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            };
            advance(start[0].length); // 将标签删除
            let end, attr;
            // 属性匹配完，循环结束，结束后end也赋值了
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) { // 有属性

                advance(attr[0].length); // 将属性删除
                // 属性可能 id = '1' or id = "1" or id = 1
                match.attrs.push({name: attr[1], value: attr[3] || attr[4] || attr[5]})
            }
            // 删除end匹配的值 去掉还是标签的 >
            if(end){
                advance(end[0].length);
                return match;
            }
        }

    }
    return root;
}
