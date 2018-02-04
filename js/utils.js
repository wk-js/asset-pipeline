"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const filelist_1 = require("filelist");
const utils_1 = require("wkt/js/api/file/utils");
const fs_1 = __importDefault(require("fs"));
const when_1 = require("when");
const path_1 = require("path");
function fetchDirs(include, exclude) {
    const FL = new filelist_1.FileList;
    const includes = Array.isArray(include) ? include : [include];
    const excludes = Array.isArray(exclude) ? exclude : exclude ? [exclude] : [];
    includes.forEach((inc) => FL.include(inc));
    excludes.forEach((exc) => FL.exclude(exc));
    const files = FL.toArray().filter(function (file) {
        return utils_1.isDirectory(file);
    });
    return files;
}
exports.fetchDirs = fetchDirs;
function isSymbolicLink(path) {
    try {
        const stats = fs_1.default.statSync(path);
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
        return when_1.promise((resolve) => resolve({}));
    return utils_1.ensureDir(path_1.dirname(toPath)).then(function () {
        return when_1.promise(function (resolve, reject) {
            fs_1.default.symlink(path_1.join(process.cwd(), fromPath), path_1.join(process.cwd(), toPath), function (err) {
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
