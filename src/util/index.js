export function isObject(data) {
    // typeof null is also object
    return typeof data === 'object' && data !== null;
}

export function def(data,key,value) {
    Object.defineProperty(data, key, {
        enumerable:false, // 遍历不到
        configurable: false, // 不能修改
        value
    })
}
