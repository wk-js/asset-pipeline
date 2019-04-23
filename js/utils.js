"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const filelist_1 = require("filelist");
const fs_1 = require("./utils/fs");
const fs_2 = __importDefault(require("fs"));
const path_1 = require("path");
const promise_1 = require("./utils/promise");
function fetchDirs(include, exclude) {
    const FL = new filelist_1.FileList;
    const includes = Array.isArray(include) ? include : [include];
    const excludes = Array.isArray(exclude) ? exclude : exclude ? [exclude] : [];
    includes.forEach((inc) => FL.include(inc));
    excludes.forEach((exc) => FL.exclude(exc));
    const files = FL.toArray().filter(function (file) {
        return fs_1.isDirectory(file);
    });
    return files;
}
exports.fetchDirs = fetchDirs;
function isSymbolicLink(path) {
    try {
        const stats = fs_2.default.statSync(path);
        if (!stats.isSymbolicLink())
            throw 'Not a symbolic link';
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isSymbolicLink = isSymbolicLink;
function symlink(fromPath, toPath) {
    if (isSymbolicLink(toPath))
        return promise_1.promiseResolved({});
    return fs_1.ensureDir(path_1.dirname(toPath)).then(function () {
        return new Promise(function (resolve, reject) {
            fs_2.default.symlink(path_1.join(process.cwd(), fromPath), path_1.join(process.cwd(), toPath), function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({});
            });
        });
    });
}
exports.symlink = symlink;
