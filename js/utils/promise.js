"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promise(callback) {
    return new Promise(callback);
}
exports.promise = promise;
function promiseResolved(value) {
    return promise((resolve) => {
        resolve(value);
    });
}
exports.promiseResolved = promiseResolved;
