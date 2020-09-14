// 把data中的数据，使用
import {isObject, def} from "../util";
import {arrayMethods} from './array';

class Observer {
    constructor(value) {
        // vue 严重问题： 如果数据非常的复杂，对象深度较深，vue要递归的去解析对象中的属性， 依次增加set get方法
        // vue3 使用了proxy进行优化 ，proxy 不需要递归，也不需要增加set get

        // 这样写有问题 value.__ob__ = this; // 给每一个监控过的对象增加一个属性 __ob__
        def(value, '__ob__', this);

        if (Array.isArray(value)) {
            /*
            如果是数组的话，不会对索引进行监控，因为会导致性能问题
            前端很少去操作索引 ，都是用push shift unshift pop 操作数组
            如果数组中是对象的话我再去监控， 普通值不需要监控

            数组的劫持：要劫持数组中的每一个对象
                        也要监听push shift unshift pop 这样的改变数组的方式
                        要重写这些方法
            * */
            value.__proto__ = arrayMethods;
            this.observerArray(value);
        } else {
            this.walk(value);
        }
    }

    observerArray(value) { // 处理 [{}]
        for (let i = 0; i < value.length; i++) {
            observe(value[i])
        }
    }

    walk(data) {
        let keys = Object.keys(data);
        keys.forEach((key) => {
            defineReactive(data, key, data[key]);
        });

    }
}

function defineReactive(data, key, value) {
    // value 是对象的话再执行一遍， 递归
    observe(value);
    Object.defineProperty(data, key, {
        configurable: true,
        enumerable: true,
        get() {
            return value
        },
        // 数组中的对象 的 属性更改，也是要更新页面的
        set(newValue) {
            if (newValue === value) return;
            // vm._data.address = {} 设置的是一个对象，再次去监听
            observe(newValue);
            value = newValue;
        }
    })

}

export function observe(data) {
    if (isObject(data)) {
        return;
    }
    new Observer(data);
}
