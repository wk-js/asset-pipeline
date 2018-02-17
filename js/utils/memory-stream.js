"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const memStore = {};
class MemoryStream extends stream_1.Writable {
    constructor(key, options) {
        super(options);
        this.key = key;
        memStore[this.key] = new Buffer('');
    }
    _write(chunk, encoding, callback) {
        var bf = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk);
        memStore[this.key] = Buffer.concat([memStore[this.key], bf]);
        callback();
    }
    getData(encoding) {
        return encoding ? memStore[this.key].toString(encoding) : memStore[this.key];
    }
    clean() {
        if (memStore[this.key]) {
            delete memStore[this.key];
        }
    }
}
exports.MemoryStream = MemoryStream;
