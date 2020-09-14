/*
* 要重写 pop push shift unshift reverse sort splice 会导致数组本身改变的方法
* value.__proto__ = arrayMethods;
* arrayMethods.__proto__ = oldMethods;
* */
const oldArrayMethods = Array.prototype; // 原生的Array 的原型
export const arrayMethods = Object.create(oldArrayMethods);
const methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'splice',
    'reverse'
];
methods.forEach(method => {
   arrayMethods[method] = function (...args) {
       // 改变数组  AOP 切片编程  this 指向 调用 push 方法的数组
       const result = oldArrayMethods[method].apply(this,args);
       // push unshift 添加的是一个对象
       let inserted;
       let ob = this.__ob__;
       switch (method) {
           case "push":
           case "unshift":
               inserted = args;  // 例如：arr.push({name:'xx'},{name:'xxxx'}); args 是一个数组
               break;
           case 'splice':  // arr.splice(start, length, {name:'xx'})
               inserted = args.slice(2);
           default:
               break;
       }
       if(inserted){
           ob.observerArray(inserted) //将新增的 数组 项进行监听
       }


       return result;
   }
});
