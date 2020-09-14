/*
* ast 语法树：用对象表示js 原生语法
* 虚拟DOM： 用对象表示DOM节点的
*
* arguments[0]: 匹配到的标签
* arguments[1]: 标签名字
* */

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

export function compileToFunction(template) {
    let root = parseHTML(template);
    return function render() {

    }
}
function start(tagName,attrs) {

}
function chars(text) {
    console.log('文本是:', text);

}
function end(tagName) {
    console.log('结束标签：', tagName);
}
function parseHTML(html) {
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
}

