"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsPlugin = void 0;
require("./types");
const file_system_1 = require("./file-system");
exports.FsPlugin = {
    name: "fs",
    setup(pipeline) {
        pipeline.options("fs", new file_system_1.FileSystem(pipeline));
    }
};
